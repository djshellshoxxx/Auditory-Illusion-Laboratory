import {renderStereoEvents} from '../audio/render.js';
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
export const PITCH_CLASSES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const C1=440*Math.pow(2,(24-69)/12); // 32.703 Hz

export const SHEPARD_CLASSIC=Object.freeze({startPitchClass:0,direction:1,stepSemitones:1,stepSeconds:.5,components:10,envelopeCenterHz:1000,envelopeWidthOctaves:1.35,waveform:'sine',detuneCents:0});

export function normalizeShepardParams(input={}){
  return {
    startPitchClass:((Math.round(clamp(input.startPitchClass,0,11,0))%12)+12)%12,
    direction:(input.direction??1)<0?-1:1,
    stepSemitones:Math.round(clamp(input.stepSemitones,1,6,1)),
    stepSeconds:clamp(input.stepSeconds??(input.stepRate?1/Number(input.stepRate):undefined),.1,2,SHEPARD_CLASSIC.stepSeconds),
    components:Math.round(clamp(input.components??input.partials,6,10,SHEPARD_CLASSIC.components)),
    envelopeCenterHz:clamp(input.envelopeCenterHz??input.center,200,4000,SHEPARD_CLASSIC.envelopeCenterHz),
    envelopeWidthOctaves:clamp(input.envelopeWidthOctaves??input.width,.5,3,SHEPARD_CLASSIC.envelopeWidthOctaves),
    waveform:input.waveform==='triangle'?'triangle':'sine',
    detuneCents:clamp(input.detuneCents,-50,50,0)
  };
}
export const envelopeWeight=(f,center,width)=>Math.exp(-.5*Math.pow(Math.log2(f/center)/width,2));

/** One Shepard tone: exact octave-spaced components under the fixed log-frequency Gaussian envelope. */
export function shepardTone(pitchClassSemitones,input={}){
  const p=normalizeShepardParams(input);
  const base=C1*Math.pow(2,(pitchClassSemitones+p.detuneCents/100)/12);
  return Array.from({length:p.components},(_,k)=>{const f=base*Math.pow(2,k);return {k,frequencyHz:f,gain:envelopeWeight(f,p.envelopeCenterHz,p.envelopeWidthOctaves)}});
}
/** The 12-step (or step-size-adjusted) cyclic sequence of pitch classes. */
export function shepardSequence(input={}){
  const p=normalizeShepardParams(input),steps=12/gcd(12,p.stepSemitones),out=[];
  for(let i=0;i<steps;i++){const pc=((p.startPitchClass+i*p.stepSemitones*p.direction)%12+12)%12;out.push({index:i,pitchClass:pc,name:PITCH_CLASSES[pc],components:shepardTone(pc,p)})}
  return out;
}
const gcd=(a,b)=>b?gcd(b,a%b):a;
export function shepardCycleSeconds(input={}){const p=normalizeShepardParams(input);return +(shepardSequence(p).length*p.stepSeconds).toFixed(6);}
export function spectralCentroidOctaves(components){const w=components.reduce((s,c)=>s+c.gain,0);return components.reduce((s,c)=>s+c.gain*Math.log2(c.frequencyHz),0)/w;}

export function shepardEvents(input={}){
  const p=normalizeShepardParams(input);
  return shepardSequence(p).map(step=>{
    const norm=1; // envelope peak is 1 by construction; no per-step renormalisation so level is identical across steps
    return {time:step.index*p.stepSeconds,duration:p.stepSeconds,channel:'both',frequencyHz:step.components[0].frequencyHz,partials:step.components.map(c=>({ratio:Math.pow(2,c.k),gain:c.gain/norm})),waveform:p.waveform,label:step.name,gain:.05,pitchClass:step.pitchClass,components:step.components};
  });
}
export function renderShepardCycle(input={},sampleRate=48000){
  const events=shepardEvents(input);
  return {...renderStereoEvents(events,{sampleRate,rampSeconds:.01,totalSeconds:shepardCycleSeconds(input)}),events};
}
