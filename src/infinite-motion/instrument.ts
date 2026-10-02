import {audioEngine} from '../audio/AudioEngine';
import {createMotionState,advanceMotion,pitchLayers,spatialCues,snapshot,wrapped,normalizeLanes,PITCH_LAYERS} from './engine.js';

type Lanes={pitch:number;tempo:number;pan:number;distance:number;spectrum:number};
type Voice={midi:number;oscs:OscillatorNode[];gains:GainNode[];env:GainNode;positions:number[];velocity:number};
const LOOKAHEAD=.12,CHUNK=.02,TICK_MS=25,VOICE_LEVEL=.05,PULSE_LEVEL=.18;

function impulse(ctx:AudioContext,seconds=2){const n=Math.round(ctx.sampleRate*seconds),b=ctx.createBuffer(2,n,ctx.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let s=0x1234567+c*977;for(let i=0;i<n;i++){s=(Math.imul(s,1664525)+1013904223)>>>0;d[i]=(s/4294967296*2-1)*Math.pow(1-i/n,3)}}return b;}
function click(ctx:AudioContext){const n=Math.round(ctx.sampleRate*.008),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);let s=0x9e3779b1;for(let i=0;i<n;i++){s=(Math.imul(s,1664525)+1013904223)>>>0;d[i]=(s/4294967296*2-1)*Math.sin(Math.PI*(i+.5)/n)**2}return b;}

/**
 * Audio side of Infinite Motion. The pure motion clock is advanced in 20 ms chunks, 120 ms ahead of the
 * audio clock; every parameter change is an audio-clock ramp. Voices and rhythm pulses share one spatial chain:
 * mix → distance low-pass → (L gain → L delay, R gain → R delay) → merger → dry → bus, plus a reverb send.
 */
export class MotionInstrument{
  private ctx?:AudioContext;private bus?:AudioNode;private mix?:GainNode;private lp?:BiquadFilterNode;
  private gL?:GainNode;private gR?:GainNode;private dL?:DelayNode;private dR?:DelayNode;private dry?:GainNode;private wet?:GainNode;private nodes:AudioNode[]=[];
  private clickBuf?:AudioBuffer;
  private state=createMotionState();private lanes:Lanes={pitch:0,tempo:0,pan:0,distance:0,spectrum:0};
  private voices=new Map<number,Voice>();private reserved=new Set<number>();
  private timer=0;private t0=0;private scheduledUntil=0;private unregister:(()=>void)|null=null;
  private pulses=new Set<AudioBufferSourceNode>();
  tempoEnabled=true;
  onChange?:()=>void;

  setLanes(l:Lanes){this.lanes=normalizeLanes(l) as Lanes}
  get voiceCount(){return this.voices.size}
  get running(){return this.timer!==0}
  snapshot(){return snapshot(this.state)}

  private async ensureGraph(){
    const ctx=await audioEngine.ensureRunning(),bus=await audioEngine.createInputBus();
    if(this.ctx===ctx&&this.bus===bus&&this.mix)return ctx;
    this.ctx=ctx;this.bus=bus;
    const mix=ctx.createGain(),lp=ctx.createBiquadFilter(),split=ctx.createChannelSplitter(2),gL=ctx.createGain(),gR=ctx.createGain(),dL=ctx.createDelay(.01),dR=ctx.createDelay(.01),merge=ctx.createChannelMerger(2),dry=ctx.createGain(),wet=ctx.createGain(),conv=ctx.createConvolver();
    mix.channelCount=1;mix.channelCountMode='explicit';lp.type='lowpass';lp.frequency.value=16000;
    conv.buffer=impulse(ctx);wet.gain.value=.05;
    mix.connect(lp);lp.connect(split);split.connect(gL,0);split.connect(gR,0);gL.connect(dL).connect(merge,0,0);gR.connect(dR).connect(merge,0,1);merge.connect(dry).connect(bus);
    lp.connect(conv).connect(wet).connect(bus);
    Object.assign(this,{mix,lp,gL,gR,dL,dR,dry,wet});this.nodes=[mix,lp,split,gL,gR,dL,dR,merge,dry,wet,conv];
    this.clickBuf=click(ctx);
    return ctx;
  }

  private start(ctx:AudioContext){
    if(this.timer)return;
    this.t0=ctx.currentTime+.03;this.scheduledUntil=this.t0;this.state.time=0;
    this.applySpatial(this.t0,true);
    this.timer=window.setInterval(()=>this.fill(),TICK_MS);
    // re-register on every start: AudioEngine.panic() clears its cleanup set after running it
    this.unregister=audioEngine.registerCleanup(()=>this.stopAll());
    this.fill();
  }

  private applySpatial(at:number,immediate=false){
    const c=spatialCues(this.state),set=(p:AudioParam,v:number)=>immediate?p.setValueAtTime(v,at):p.linearRampToValueAtTime(v,at);
    set(this.gL!.gain,c.gainL);set(this.gR!.gain,c.gainR);set(this.dL!.delayTime,c.delayL);set(this.dR!.delayTime,c.delayR);
    set(this.lp!.frequency,c.cutoffHz);set(this.dry!.gain,c.level);set(this.wet!.gain,c.reverbSend*c.level);
  }

  private fill(){
    const ctx=this.ctx;if(!ctx)return;
    while(this.scheduledUntil<ctx.currentTime+LOOKAHEAD){
      const at=this.scheduledUntil+CHUNK;
      const pulses=advanceMotion(this.state,this.lanes,CHUNK);
      for(const v of this.voices.values())this.scheduleVoice(v,at);
      this.applySpatial(at);
      if(this.tempoEnabled)for(const p of pulses)this.schedulePulse(this.t0+p.time,p.gain);
      this.scheduledUntil=at;
    }
  }

  private scheduleVoice(v:Voice,at:number){
    const layers=pitchLayers(v.midi,this.state);
    layers.forEach((l,i)=>{
      if(wrapped(v.positions[i],l.position,PITCH_LAYERS)){v.oscs[i].frequency.setValueAtTime(l.frequencyHz,at-CHUNK);v.gains[i].gain.setValueAtTime(0,at-CHUNK)}
      else v.oscs[i].frequency.exponentialRampToValueAtTime(l.frequencyHz,at);
      v.gains[i].gain.linearRampToValueAtTime(l.gain,at);v.positions[i]=l.position;
    });
  }

  private schedulePulse(when:number,gain:number){
    const ctx=this.ctx!,src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=this.clickBuf!;g.gain.value=PULSE_LEVEL*gain;src.connect(g).connect(this.mix!);
    src.onended=()=>{this.pulses.delete(src);src.disconnect();g.disconnect()};this.pulses.add(src);src.start(Math.max(when,ctx.currentTime));
  }

  /** Synchronous reservation prevents duplicate voices when a note is retriggered before the graph is ready. */
  async noteOn(midi:number,velocity=.8){
    if(this.voices.has(midi)||this.reserved.has(midi))return;
    this.reserved.add(midi);
    try{
      const ctx=await this.ensureGraph();
      if(!this.reserved.has(midi))return; // released (or Panic) while we awaited
      this.start(ctx);
      const at=Math.max(ctx.currentTime,this.t0),env=ctx.createGain();env.gain.setValueAtTime(0,at);env.gain.linearRampToValueAtTime(VOICE_LEVEL*velocity,at+.03);env.connect(this.mix!);
      const layers=pitchLayers(midi,this.state),oscs:OscillatorNode[]=[],gains:GainNode[]=[];
      for(const l of layers){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(l.frequencyHz,at);g.gain.setValueAtTime(l.gain,at);o.connect(g).connect(env);o.start(at);oscs.push(o);gains.push(g)}
      this.voices.set(midi,{midi,oscs,gains,env,positions:layers.map(l=>l.position),velocity});
    }finally{this.reserved.delete(midi);this.onChange?.()}
  }

  noteOff(midi:number){
    this.reserved.delete(midi);
    const v=this.voices.get(midi),ctx=this.ctx;if(!v||!ctx)return;
    this.voices.delete(midi);
    const now=ctx.currentTime;v.env.gain.cancelScheduledValues(now);v.env.gain.setValueAtTime(v.env.gain.value,now);v.env.gain.linearRampToValueAtTime(0,now+.06);
    for(const o of v.oscs){try{o.stop(now+.08)}catch{/* already stopped */}}
    window.setTimeout(()=>{v.oscs.forEach(o=>o.disconnect());v.gains.forEach(g=>g.disconnect());v.env.disconnect()},150);
    if(!this.voices.size&&!this.reserved.size)this.halt();
    this.onChange?.();
  }

  private halt(){
    if(this.timer){window.clearInterval(this.timer);this.timer=0}
    for(const s of this.pulses){try{s.stop()}catch{/* ended */}}this.pulses.clear();
    if(this.unregister){this.unregister();this.unregister=null}
  }

  /** Releases every voice and stops scheduling; used by Stop All, Panic, page switch and unmount. */
  stopAll(){
    this.reserved.clear();
    for(const m of [...this.voices.keys()])this.noteOff(m);
    this.halt();this.onChange?.();
  }

  dispose(){this.stopAll();window.setTimeout(()=>{for(const n of this.nodes){try{n.disconnect()}catch{/* detached */}}this.nodes=[];this.mix=undefined;this.ctx=undefined},200)}
}
