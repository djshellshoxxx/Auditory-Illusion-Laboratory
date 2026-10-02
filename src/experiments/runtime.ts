import {audioEngine} from '../audio/AudioEngine';
import {midiToHz, scrambleOctaves} from '../audio/core.js';
import {startPhantomWords} from './phantomWords';
import {startGlissando,stopGlissando} from './glissandoRuntime';
import {startZwicker} from './zwickerRuntime';
import {startMissingFundamental} from './missingFundamentalRuntime';
import {startCombinationTones} from './combinationTonesRuntime';
import type {ExperimentSession} from './session';
import {startOctave} from './octaveRuntime';
import {startScale} from './scaleRuntime';
import {startChromatic} from './chromaticRuntime';
import {startCambiata} from './cambiataRuntime';
import {startShepard} from './shepardRuntime';
import {startRissetGlide} from './rissetGlideRuntime';
import {startRissetRhythm} from './rissetRhythmRuntime';
import {startTritone} from './tritoneRuntime';
import {startPrecedence} from './precedenceRuntime';
let stopCurrent:()=>void=()=>{};
const safe=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,Number(v)||a));

type Cleanup=()=>void;
function toneBurst(ctx:AudioContext,bus:AudioNode,f:number,duration=.16,pan=0,gain=.055,type:OscillatorType='sine'):Cleanup{
  const o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner();o.type=type;o.frequency.value=safe(f,20,18000);p.pan.value=safe(pan,-1,1);
  g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),ctx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
  o.connect(g).connect(p).connect(bus);o.start();o.stop(ctx.currentTime+duration+.01);return()=>{try{o.stop()}catch{};o.disconnect();g.disconnect();p.disconnect()};
}
function continuity(ctx:AudioContext,bus:AudioNode,p:Record<string,any>,clean:Cleanup[]){const cycle=1.25,gapStart=.47,gap=safe(p.gap,.06,.6),target=safe(p.target,100,4000),maskLevel=safe(p.maskLevel,.03,.5);const run=()=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=target;g.gain.value=.045;o.connect(g).connect(bus);const t=ctx.currentTime;g.gain.setValueAtTime(.045,t);g.gain.setTargetAtTime(.00001,t+gapStart,.002);g.gain.setValueAtTime(.00001,t+gapStart+.006);g.gain.setTargetAtTime(.045,t+gapStart+gap,.002);o.start(t);o.stop(t+cycle);const len=Math.max(1,Math.round(ctx.sampleRate*gap)),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*maskLevel;const src=ctx.createBufferSource();src.buffer=buf;src.connect(bus);src.start(t+gapStart);src.stop(t+gapStart+gap)};run();const id=setInterval(run,cycle*1000);clean.push(()=>clearInterval(id));}

export async function startExperiment(id:string,p:Record<string,any>,onStatus?:(message:string)=>void):Promise<ExperimentSession|void>{stopExperiment();
  if(id==='glissando'){await startGlissando(p);return}
  const ctx=await audioEngine.ensureRunning(),bus=await audioEngine.createInputBus(),clean:Cleanup[]=[];const run:{session?:ExperimentSession}={};
  if(id==='shepard')run.session=startShepard(ctx,bus,p,clean);
  else if(id==='risset-glide')run.session=startRissetGlide(ctx,bus,p,clean);
  else if(id==='risset-rhythm')run.session=startRissetRhythm(ctx,bus,p,clean);
  else if(id==='octave')run.session=startOctave(ctx,bus,p,clean);
  else if(id==='scale')run.session=startScale(ctx,bus,p,clean);
  else if(id==='chromatic')run.session=startChromatic(ctx,bus,p,clean);
  else if(id==='cambiata')run.session=startCambiata(ctx,bus,p,clean);
  else if(id==='tritone')run.session=startTritone(ctx,bus,p,clean);
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
