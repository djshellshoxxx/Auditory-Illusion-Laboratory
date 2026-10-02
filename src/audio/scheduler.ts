import {toAudioBuffer} from './render.js';
export type Cleanup=()=>void;

/** Call fill(untilAudioTime) repeatedly so audio-clock events are always scheduled ahead of real time. */
export function lookaheadScheduler(ctx:AudioContext,fill:(until:number)=>void,lookahead=.35,intervalMs=40):Cleanup{
  fill(ctx.currentTime+lookahead);
  const id=window.setInterval(()=>fill(ctx.currentTime+lookahead),intervalMs);
  return()=>window.clearInterval(id);
}

/** A tone gated on the audio clock with short linear ramps (no browser-timer jitter). */
export function gatedTone(ctx:AudioContext,dest:AudioNode,o:{frequency:number;start:number;stop:number;gain:number;pan?:number;type?:OscillatorType;ramp?:number;wave?:PeriodicWave}):Cleanup{
  const osc=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner();
  if(o.wave)osc.setPeriodicWave(o.wave);else osc.type=o.type??'sine';
  osc.frequency.value=o.frequency;p.pan.value=o.pan??0;
  const r=o.ramp??.005;
  g.gain.setValueAtTime(0,o.start);g.gain.linearRampToValueAtTime(o.gain,o.start+r);
  g.gain.setValueAtTime(o.gain,Math.max(o.start+r,o.stop-r));g.gain.linearRampToValueAtTime(0,o.stop);
  osc.connect(g).connect(p).connect(dest);osc.start(o.start);osc.stop(o.stop+.01);
  const dispose=()=>{try{osc.stop()}catch{}osc.disconnect();g.disconnect();p.disconnect()};
  osc.onended=()=>{osc.disconnect();g.disconnect();p.disconnect()};
  return dispose;
}

/** Loop a pre-rendered stereo buffer through the engine bus with a click-free fade in/out. */
export function loopRendered(ctx:AudioContext,bus:AudioNode,rendered:{left:Float32Array;right:Float32Array;frames:number;sampleRate:number;seconds:number},o:{loop?:boolean;gain?:number;startAt?:number}={}){
  const buffer=toAudioBuffer(ctx,rendered);
  const src=ctx.createBufferSource(),fade=ctx.createGain();
  src.buffer=buffer;src.loop=o.loop??true;
  const at=o.startAt??ctx.currentTime+.03;
  fade.gain.setValueAtTime(0,at);fade.gain.linearRampToValueAtTime(o.gain??1,at+.01);
  src.connect(fade).connect(bus);src.start(at);
  if(!src.loop)src.stop(at+rendered.seconds+.02);
  const stop=()=>{const now=ctx.currentTime;fade.gain.cancelScheduledValues(now);fade.gain.setTargetAtTime(0,now,.006);try{src.stop(now+.05)}catch{}window.setTimeout(()=>{src.disconnect();fade.disconnect()},80)};
  return {source:src,fade,startAt:at,stop};
}
