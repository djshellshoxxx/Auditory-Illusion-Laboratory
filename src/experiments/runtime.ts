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
import {startStreaming} from './streamingRuntime';
import {startContinuity} from './continuityRuntime';
import {startSpeechToSong} from './speechToSongRuntime';
import {startPrecedence} from './precedenceRuntime';
let stopCurrent:()=>void=()=>{};
const safe=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,Number(v)||a));

type Cleanup=()=>void;
function toneBurst(ctx:AudioContext,bus:AudioNode,f:number,duration=.16,pan=0,gain=.055,type:OscillatorType='sine'):Cleanup{
  const o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner();o.type=type;o.frequency.value=safe(f,20,18000);p.pan.value=safe(pan,-1,1);
  g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),ctx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
  o.connect(g).connect(p).connect(bus);o.start();o.stop(ctx.currentTime+duration+.01);return()=>{try{o.stop()}catch{};o.disconnect();g.disconnect();p.disconnect()};
}

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
  else if(id==='streaming')run.session=startStreaming(ctx,bus,p,clean);
  else if(id==='continuity')run.session=startContinuity(ctx,bus,p,clean);
  else if(id==='zwicker')startZwicker(ctx,bus,p,clean,onStatus);
  else if(id==='missing-fundamental')startMissingFundamental(ctx,bus,p,clean);
  else if(id==='combination-tones')startCombinationTones(ctx,bus,p,clean);
  else if(id==='precedence')startPrecedence(ctx,bus,p,clean);
  else if(id==='phantom-words')await startPhantomWords(ctx,bus,p,clean);
  else if(id==='mysterious-melody'){const reveal=safe(p.reveal??0,0,1),depth=Math.round(safe(p.depth??3,0,4)*(1-reveal)),notes=scrambleOctaves([60,60,67,67,69,69,67,65,65,64,64,62,62,60],depth,4);let i=0;const tid=setInterval(()=>toneBurst(ctx,bus,midiToHz(notes[i++%notes.length]),.16,0,.05),1000/safe(p.tempo,1,10));clean.push(()=>clearInterval(tid))}
  else if(id==='speech-to-song')run.session=await startSpeechToSong(ctx,bus,p,clean);
  stopCurrent=()=>{for(const f of clean.splice(0)){try{f()}catch{}}};audioEngine.registerCleanup(stopCurrent);
  return run.session;
}
export function stopExperiment(){stopGlissando();try{stopCurrent()}catch{}stopCurrent=()=>{}}
