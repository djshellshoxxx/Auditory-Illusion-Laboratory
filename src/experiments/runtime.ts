import {audioEngine} from '../audio/AudioEngine';
import {midiToHz, shepardFrame, rissetFrame, stereoAlternate, scaleStereoEvents, chromaticStereoEvents, scrambleOctaves} from '../audio/core.js';
import {startPhantomWords} from './phantomWords';
import {startGlissando,stopGlissando} from './glissandoRuntime';
import {startZwicker} from './zwickerRuntime';
import {startMissingFundamental} from './missingFundamentalRuntime';
import {startCombinationTones} from './combinationTonesRuntime';
import type {ExperimentSession} from './session';
import {startPrecedence} from './precedenceRuntime';
let stopCurrent:()=>void=()=>{};
const safe=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,Number(v)||a));

type Cleanup=()=>void;
function toneBurst(ctx:AudioContext,bus:AudioNode,f:number,duration=.16,pan=0,gain=.055,type:OscillatorType='sine'):Cleanup{
  const o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner();o.type=type;o.frequency.value=safe(f,20,18000);p.pan.value=safe(pan,-1,1);
  g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),ctx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
  o.connect(g).connect(p).connect(bus);o.start();o.stop(ctx.currentTime+duration+.01);return()=>{try{o.stop()}catch{};o.disconnect();g.disconnect();p.disconnect()};
}
function continuousShepard(ctx:AudioContext,bus:AudioNode,p:Record<string,any>,discrete:boolean,clean:Cleanup[]){
  const count=Math.round(safe(p.partials,3,10)),nodes=Array.from({length:count},()=>{const o=ctx.createOscillator(),g=ctx.createGain();g.gain.value=0;o.connect(g).connect(bus);o.start();return{o,g}});let phase=0,last=performance.now();
  const tick=()=>{const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;const direction=(p.direction??1)<0?-1:1;if(discrete){const rate=safe(p.stepRate,0.25,12);phase=Math.floor((now/1000*rate)%12)/12;}else phase=(phase+dt*safe(p.speed,.01,1)*direction+1)%1;const fr=shepardFrame(safe(p.base,40,500),count,safe(p.center,100,5000),safe(p.width,.2,4),phase,direction);fr.forEach((x:any,i:number)=>{nodes[i].o.frequency.setTargetAtTime(x.frequency,ctx.currentTime,.012);nodes[i].g.gain.setTargetAtTime(x.gain*.045,ctx.currentTime,.015)})};tick();const id=setInterval(tick,20);clean.push(()=>clearInterval(id),()=>nodes.forEach(n=>{try{n.o.stop()}catch{};n.o.disconnect();n.g.disconnect()}));
}
function rissetRhythm(ctx:AudioContext,bus:AudioNode,p:Record<string,any>,clean:Cleanup[]){
  const layers=Math.round(safe(p.layers,2,8)),acc=Array(layers).fill(0);let phase=0,last=performance.now();const id=setInterval(()=>{const now=performance.now(),dt=Math.min(.08,(now-last)/1000);last=now;phase=(phase+dt*.13*((p.direction??1)<0?-1:1)+1)%1;const fr=rissetFrame(safe(p.bpm,30,240),layers,phase,p.direction??1);fr.forEach((x:any,i:number)=>{acc[i]+=dt*x.rate/60;while(acc[i]>=1){acc[i]-=1;toneBurst(ctx,bus,100+i*55,.045,(i/(layers-1))*1.6-.8,.055*x.gain,'square')}})},20);clean.push(()=>clearInterval(id));
}
function stereoSequence(ctx:AudioContext,bus:AudioNode,events:{left:number,right:number}[],rate:number,clean:Cleanup[]){let i=0;const id=setInterval(()=>{const e=events[i++%events.length];toneBurst(ctx,bus,midiToHz(e.left),.14,-1,.05);toneBurst(ctx,bus,midiToHz(e.right),.14,1,.05)},1000/safe(rate,1,12));clean.push(()=>clearInterval(id));}
function tritoneSequence(ctx:AudioContext,bus:AudioNode,p:Record<string,any>,clean:Cleanup[]){let second=false;const burst=(root:number)=>{const fs=Array.from({length:6},(_,i)=>midiToHz(root-24+i*12)),center=safe(p.center,150,5000),width=safe(p.width,.3,4);const logs=fs.map(f=>Math.log2(f/center)),raw=logs.map(x=>Math.exp(-.5*(x/width)**2)),m=Math.max(...raw);fs.forEach((f,i)=>toneBurst(ctx,bus,f,.38,0,.035*raw[i]/m))};burst(60+(p.rootClass??0));const id=setInterval(()=>{second=!second;burst(60+(p.rootClass??0)+(second?6:0))},620);clean.push(()=>clearInterval(id));}
function continuity(ctx:AudioContext,bus:AudioNode,p:Record<string,any>,clean:Cleanup[]){const cycle=1.25,gapStart=.47,gap=safe(p.gap,.06,.6),target=safe(p.target,100,4000),maskLevel=safe(p.maskLevel,.03,.5);const run=()=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=target;g.gain.value=.045;o.connect(g).connect(bus);const t=ctx.currentTime;g.gain.setValueAtTime(.045,t);g.gain.setTargetAtTime(.00001,t+gapStart,.002);g.gain.setValueAtTime(.00001,t+gapStart+.006);g.gain.setTargetAtTime(.045,t+gapStart+gap,.002);o.start(t);o.stop(t+cycle);const len=Math.max(1,Math.round(ctx.sampleRate*gap)),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*maskLevel;const src=ctx.createBufferSource();src.buffer=buf;src.connect(bus);src.start(t+gapStart);src.stop(t+gapStart+gap)};run();const id=setInterval(run,cycle*1000);clean.push(()=>clearInterval(id));}

export async function startExperiment(id:string,p:Record<string,any>,onStatus?:(message:string)=>void):Promise<ExperimentSession|void>{stopExperiment();
  if(id==='glissando'){await startGlissando(p);return}
  const ctx=await audioEngine.ensureRunning(),bus=await audioEngine.createInputBus(),clean:Cleanup[]=[];const run:{session?:ExperimentSession}={};
  if(id==='shepard')continuousShepard(ctx,bus,p,true,clean);
  else if(id==='risset-glide')continuousShepard(ctx,bus,p,false,clean);
  else if(id==='risset-rhythm')rissetRhythm(ctx,bus,p,clean);
  else if(id==='octave'){const ev=stereoAlternate(p.low,p.high,8);let i=0;const tid=setInterval(()=>{const e=ev[i++%ev.length];toneBurst(ctx,bus,e.left,.18,-1,.055);toneBurst(ctx,bus,e.right,.18,1,.055)},1000/safe(p.rate,1,10));clean.push(()=>clearInterval(tid))}
  else if(id==='scale')stereoSequence(ctx,bus,scaleStereoEvents(p.root??60,p.steps??8),p.tempo??6,clean);
  else if(id==='chromatic')stereoSequence(ctx,bus,chromaticStereoEvents(p.root??60,12),p.rate??6,clean);
  else if(id==='cambiata'){const c=69+(p.transpose??0),events=[{left:c+7,right:c-5},{left:c-7,right:c+5},{left:c+5,right:c-7},{left:c-5,right:c+7}];stereoSequence(ctx,bus,events,p.tempo??5,clean)}
  else if(id==='tritone')tritoneSequence(ctx,bus,p,clean);
  else if(id==='streaming'){const seq=[p.a??440,p.b??659.25,p.a??440,0],rate=safe(p.rate,1,12);let i=0;const tid=setInterval(()=>{const f=seq[i++%4];if(f)toneBurst(ctx,bus,f,.11,0,.05)},1000/rate);clean.push(()=>clearInterval(tid))}
  else if(id==='continuity')continuity(ctx,bus,p,clean);
  else if(id==='zwicker')startZwicker(ctx,bus,p,clean,onStatus);
  else if(id==='missing-fundamental')startMissingFundamental(ctx,bus,p,clean);
  else if(id==='combination-tones')startCombinationTones(ctx,bus,p,clean);
  else if(id==='precedence')startPrecedence(ctx,bus,p,clean);
  else if(id==='phantom-words')await startPhantomWords(ctx,bus,p,clean);
  else if(id==='mysterious-melody'){const reveal=safe(p.reveal??0,0,1),depth=Math.round(safe(p.depth??3,0,4)*(1-reveal)),notes=scrambleOctaves([60,60,67,67,69,69,67,65,65,64,64,62,62,60],depth,4);let i=0;const tid=setInterval(()=>toneBurst(ctx,bus,midiToHz(notes[i++%notes.length]),.16,0,.05),1000/safe(p.tempo,1,10));clean.push(()=>clearInterval(tid))}
  else if(id==='speech-to-song')throw new Error('Use Record Phrase, then Repeat in the speech panel.');
  stopCurrent=()=>{for(const f of clean.splice(0)){try{f()}catch{}}};audioEngine.registerCleanup(stopCurrent);
  return run.session;
}
export function stopExperiment(){stopGlissando();try{stopCurrent()}catch{}stopCurrent=()=>{}}
