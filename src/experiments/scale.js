import {renderStereoEvents} from '../audio/render.js';
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};

/** Deutsch (1975) reported frequencies for the C-major scale. */
export const SCALE_HISTORICAL_HZ=Object.freeze([259,290,326,345,388,435,488,517]);
export const SCALE_CLASSIC=Object.freeze({tuning:'historical',transposeSemitones:0,positionSeconds:.25,channelSwap:false});
const MAJOR=[0,2,4,5,7,9,11,12];
const midiToHz=m=>440*Math.pow(2,(m-69)/12);

export function normalizeScaleParams(input={}){
  const tuning=input.tuning==='equal'?'equal':'historical';
  const transposeSemitones=Math.round(clamp(input.transposeSemitones,-24,24,0));
  const positionSeconds=clamp(input.positionSeconds??(input.tempo?1/Number(input.tempo):undefined),.08,1,SCALE_CLASSIC.positionSeconds);
  return {tuning,transposeSemitones,positionSeconds,channelSwap:Boolean(input.channelSwap)};
}

export function scalePitches(input={}){
  const p=normalizeScaleParams(input);
  if(p.tuning==='historical')return SCALE_HISTORICAL_HZ.map(f=>f*Math.pow(2,p.transposeSemitones/12));
  return MAJOR.map(s=>midiToHz(60+s+p.transposeSemitones));
}

/** One cycle: 8 positions, each with one ascending tone in one ear and the descending tone in the other. */
export function scaleDichoticEvents(input={}){
  const p=normalizeScaleParams(input),asc=scalePitches(p),desc=[...asc].reverse(),out=[];
  asc.forEach((f,i)=>{
    const ascRight=(i%2===0)!==p.channelSwap;
    out.push({time:i*p.positionSeconds,duration:p.positionSeconds,channel:ascRight?'right':'left',frequencyHz:f,line:'ascending',position:i});
    out.push({time:i*p.positionSeconds,duration:p.positionSeconds,channel:ascRight?'left':'right',frequencyHz:desc[i],line:'descending',position:i});
  });
  return out;
}

export function scaleLoopSeconds(input={}){return normalizeScaleParams(input).positionSeconds*8;}

export function renderScaleLoop(input={},sampleRate=48000){
  const events=scaleDichoticEvents(input).map(e=>({...e,gain:.11}));
  return {...renderStereoEvents(events,{sampleRate,rampSeconds:.005,totalSeconds:scaleLoopSeconds(input)}),events};
}
