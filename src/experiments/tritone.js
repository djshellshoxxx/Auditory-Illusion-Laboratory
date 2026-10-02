import {renderStereoEvents} from '../audio/render.js';
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
export const PITCH_CLASSES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const DEUTSCH_ENVELOPES=Object.freeze([262,370,523,740]);
export const TRITONE_CLASSIC=Object.freeze({envelopeCenterHz:370,envelopeWidthOctaves:1,components:6,toneSeconds:.5,rampSeconds:.05,gapSeconds:0,seed:1,order:'shuffled'});

export function normalizeTritoneParams(input={}){
  return {
    envelopeCenterHz:clamp(input.envelopeCenterHz??input.center,150,2000,TRITONE_CLASSIC.envelopeCenterHz),
    envelopeWidthOctaves:clamp(input.envelopeWidthOctaves??input.width,.5,2.5,TRITONE_CLASSIC.envelopeWidthOctaves),
    components:Math.round(clamp(input.components,4,8,6)),
    toneSeconds:clamp(input.toneSeconds,.2,1.5,.5),
    rampSeconds:clamp(input.rampSeconds,.005,.1,.05),
    gapSeconds:clamp(input.gapSeconds,0,1,0),
    seed:Math.round(clamp(input.seed,1,1e9,1)),
    order:input.order==='sequential'?'sequential':'shuffled'
  };
}
const classHz=pc=>440*Math.pow(2,(pc-9)/12); // pitch class in octave 4
/** Octave complex for one pitch class: components straddle the fixed envelope centre. */
export function tritoneTone(pitchClass,input={}){
  const p=normalizeTritoneParams(input),pc=((pitchClass%12)+12)%12;
  const target=p.envelopeCenterHz*Math.pow(2,-(p.components-1)/2);
  const f4=classHz(pc),oct=Math.round(Math.log2(target/f4)),f0=f4*Math.pow(2,oct);
  return Array.from({length:p.components},(_,k)=>{const f=f0*Math.pow(2,k);return {k,frequencyHz:f,gain:Math.exp(-.5*Math.pow(Math.log2(f/p.envelopeCenterHz)/p.envelopeWidthOctaves,2))}});
}
export const tritonePair=first=>[((first%12)+12)%12,((first+6)%12+12)%12];
/** All twelve first-pitch-classes in a seeded shuffled order (or sequential). */
export function tritoneTrialOrder(input={}){
  const p=normalizeTritoneParams(input),order=Array.from({length:12},(_,i)=>i);
  if(p.order==='sequential')return order;
  let s=p.seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
  for(let i=11;i>0;i--){const j=Math.floor(rand()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
  return order;
}
export function tritonePairEvents(first,input={}){
  const p=normalizeTritoneParams(input),[a,b]=tritonePair(first);
  return [a,b].map((pc,i)=>{const comps=tritoneTone(pc,p);return {time:i*(p.toneSeconds+p.gapSeconds),duration:p.toneSeconds,channel:'both',frequencyHz:comps[0].frequencyHz,partials:comps.map(c=>({ratio:Math.pow(2,c.k),gain:c.gain})),gain:.06,label:PITCH_CLASSES[pc],pitchClass:pc,components:comps}});
}
export function renderTritonePair(first,input={},sampleRate=48000){
  const p=normalizeTritoneParams(input),events=tritonePairEvents(first,p);
  return {...renderStereoEvents(events,{sampleRate,rampSeconds:p.rampSeconds,totalSeconds:2*p.toneSeconds+p.gapSeconds}),events};
}
/** Local map: per first pitch class, counts of up/down/ambiguous judgments from stored perception records. */
export function aggregateTritoneResponses(records){
  const map=PITCH_CLASSES.map((name,pc)=>({pitchClass:pc,name,up:0,down:0,ambiguous:0}));
  for(const r of records||[]){const x=r?.response;if(!x||typeof x.firstPitchClass!=='number')continue;const cell=map[((x.firstPitchClass%12)+12)%12];if(x.judgment==='up')cell.up++;else if(x.judgment==='down')cell.down++;else cell.ambiguous++}
  return map;
}
