import {renderCrossfadedDichotic} from '../audio/render.js';
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};

export const OCTAVE_CLASSIC=Object.freeze({lowHz:400,highHz:800,stateSeconds:.25,levelDifferenceDb:0,channelSwap:false});

export function normalizeOctaveParams(input={}){
  const lowHz=clamp(input.lowHz??input.low,100,4000,OCTAVE_CLASSIC.lowHz);
  let highHz=clamp(input.highHz??input.high,100,8000,OCTAVE_CLASSIC.highHz);
  if(highHz<=lowHz)highHz=lowHz*2;
  const stateSeconds=clamp(input.stateSeconds??(input.rate?1/Number(input.rate):undefined),.05,2,OCTAVE_CLASSIC.stateSeconds);
  const levelDifferenceDb=clamp(input.levelDifferenceDb,-12,12,0);
  return {lowHz,highHz,stateSeconds,levelDifferenceDb,channelSwap:Boolean(input.channelSwap)};
}

/** Two complementary dichotic states: both ears always carry one tone. */
export function octaveStates(input={}){
  const p=normalizeOctaveParams(input);
  const a={duration:p.stateSeconds,left:p.lowHz,right:p.highHz},b={duration:p.stateSeconds,left:p.highHz,right:p.lowHz};
  return p.channelSwap?[b,a]:[a,b];
}

/** Shortest whole number of two-state cycles (≤16 s) at which both tones complete whole periods, for click-free looping. */
export function octaveLoopSeconds(input={}){
  const p=normalizeOctaveParams(input),cycle=2*p.stateSeconds;
  let best=cycle,bestErr=Infinity;
  for(let n=1;n*cycle<=16;n++){
    const L=n*cycle,err=Math.max(Math.abs(p.lowHz*L-Math.round(p.lowHz*L)),Math.abs(p.highHz*L-Math.round(p.highHz*L)));
    if(err<bestErr-1e-9){bestErr=err;best=L;if(err<1e-6)break}
  }
  return +best.toFixed(6);
}

export function octaveLaneEvents(input={}){
  const p=normalizeOctaveParams(input),states=octaveStates(p),out=[];
  states.forEach((s,i)=>{out.push({time:i*p.stateSeconds,duration:p.stateSeconds,channel:'left',frequencyHz:s.left,label:`${Math.round(s.left)} Hz`});out.push({time:i*p.stateSeconds,duration:p.stateSeconds,channel:'right',frequencyHz:s.right,label:`${Math.round(s.right)} Hz`})});
  return out;
}

export function renderOctaveLoop(input={},sampleRate=48000){
  const p=normalizeOctaveParams(input),states=octaveStates(p),loop=octaveLoopSeconds(p);
  const reps=Math.round(loop/(2*p.stateSeconds)),seq=[];
  for(let i=0;i<reps;i++)seq.push(...states);
  const r=renderCrossfadedDichotic(seq,{sampleRate,crossfadeSeconds:.003,gain:.12});
  if(p.levelDifferenceDb){const gl=Math.pow(10,Math.max(0,p.levelDifferenceDb)/20*-1),gr=Math.pow(10,Math.max(0,-p.levelDifferenceDb)/20*-1);for(let i=0;i<r.frames;i++){r.left[i]*=gr;r.right[i]*=gl}}
  return {...r,loopSeconds:loop,states,params:p};
}
