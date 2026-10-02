import {renderStereoEvents} from '../audio/render.js';
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
const midiToHz=m=>440*Math.pow(2,(m-69)/12);
export const CHROMATIC_CLASSIC=Object.freeze({spanOctaves:2,transposeSemitones:0,positionSeconds:.25,channelSwap:false});

export function normalizeChromaticParams(input={}){
  const spanOctaves=Math.round(clamp(input.spanOctaves,1,2,CHROMATIC_CLASSIC.spanOctaves));
  const transposeSemitones=Math.round(clamp(input.transposeSemitones,-24,24,0));
  const positionSeconds=clamp(input.positionSeconds??(input.rate?1/Number(input.rate):undefined),.08,1,CHROMATIC_CLASSIC.positionSeconds);
  return {spanOctaves,transposeSemitones,positionSeconds,channelSwap:Boolean(input.channelSwap)};
}
export function chromaticMidi(input={}){const p=normalizeChromaticParams(input);return Array.from({length:12*p.spanOctaves+1},(_,i)=>60+p.transposeSemitones+i);}
export function chromaticCycles(input={}){return chromaticMidi(input).length%2?2:1;}
export function chromaticLoopSeconds(input={}){const p=normalizeChromaticParams(input);return +(chromaticMidi(p).length*chromaticCycles(p)*p.positionSeconds).toFixed(6);}

/** Ascending and descending chromatic lines, alternating ears each position, rendered over enough cycles for continuous alternation. */
export function chromaticDichoticEvents(input={}){
  const p=normalizeChromaticParams(input),asc=chromaticMidi(p),desc=[...asc].reverse(),n=asc.length,out=[];
  for(let c=0;c<chromaticCycles(p);c++)for(let i=0;i<n;i++){
    const k=c*n+i,ascRight=(k%2===0)!==p.channelSwap,t=k*p.positionSeconds;
    out.push({time:t,duration:p.positionSeconds,channel:ascRight?'right':'left',midi:asc[i],frequencyHz:midiToHz(asc[i]),line:'ascending',position:k});
    out.push({time:t,duration:p.positionSeconds,channel:ascRight?'left':'right',midi:desc[i],frequencyHz:midiToHz(desc[i]),line:'descending',position:k});
  }
  return out;
}
export function renderChromaticLoop(input={},sampleRate=48000){
  const events=chromaticDichoticEvents(input).map(e=>({...e,gain:.11}));
  return {...renderStereoEvents(events,{sampleRate,rampSeconds:.005,totalSeconds:chromaticLoopSeconds(input)}),events};
}
