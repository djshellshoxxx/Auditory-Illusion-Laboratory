import {audioEngine} from '../audio/AudioEngine';
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
import {startMysteriousMelody} from './mysteriousMelodyRuntime';
import {startPrecedence,precedenceSession} from './precedenceRuntime';
import {glissandoSession} from './glissandoSession';
import {zwickerSession} from './zwickerSession';
let stopCurrent:()=>void=()=>{};
let unregisterCurrent:()=>void=()=>{};
type Cleanup=()=>void;

export async function startExperiment(id:string,p:Record<string,any>,onStatus?:(message:string)=>void):Promise<ExperimentSession|void>{stopExperiment();
  if(id==='glissando'){await startGlissando(p);return glissandoSession(p)}
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
  else if(id==='zwicker'){startZwicker(ctx,bus,p,clean,onStatus);run.session=zwickerSession(p)}
  else if(id==='missing-fundamental')startMissingFundamental(ctx,bus,p,clean);
  else if(id==='combination-tones')startCombinationTones(ctx,bus,p,clean);
  else if(id==='precedence'){startPrecedence(ctx,bus,p,clean);run.session=precedenceSession(p)}
  else if(id==='phantom-words')await startPhantomWords(ctx,bus,p,clean);
  else if(id==='mysterious-melody')run.session=startMysteriousMelody(ctx,bus,p,clean);
  else if(id==='speech-to-song')run.session=await startSpeechToSong(ctx,bus,p,clean);
  stopCurrent=()=>{for(const f of clean.splice(0)){try{f()}catch{}}};unregisterCurrent=audioEngine.registerCleanup(stopCurrent);
  return run.session;
}
export function stopExperiment(){stopGlissando();unregisterCurrent();unregisterCurrent=()=>{};try{stopCurrent()}catch{}stopCurrent=()=>{}}
