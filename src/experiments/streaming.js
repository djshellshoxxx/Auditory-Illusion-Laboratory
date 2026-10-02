import {renderStereoEvents} from '../audio/render.js';
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
export const STREAMING_CLASSIC=Object.freeze({aHz:440,separationSemitones:6,slotMs:120,toneMs:50,bTimbre:'sine',stereoSeparation:0,levelDifferenceDb:0});

export function normalizeStreamingParams(input={}){
  const aHz=clamp(input.aHz??input.a,100,4000,STREAMING_CLASSIC.aHz);
  let separationSemitones=clamp(input.separationSemitones,0,24,STREAMING_CLASSIC.separationSemitones);
  if(input.separationSemitones===undefined&&input.b)separationSemitones=clamp(12*Math.log2(Number(input.b)/aHz),0,24,6);
  const slotMs=clamp(input.slotMs??(input.rate?1000/Number(input.rate):undefined),50,500,STREAMING_CLASSIC.slotMs);
  const toneMs=Math.min(slotMs,clamp(input.toneMs,20,500,STREAMING_CLASSIC.toneMs));
  return {aHz,separationSemitones,slotMs,toneMs,bHz:aHz*Math.pow(2,separationSemitones/12),bTimbre:['sine','triangle','square'].includes(input.bTimbre)?input.bTimbre:'sine',stereoSeparation:clamp(input.stereoSeparation,0,1,0),levelDifferenceDb:clamp(input.levelDifferenceDb,-20,20,0)};
}
export function streamingCycleSeconds(input={}){return normalizeStreamingParams(input).slotMs*4/1000;}
/** A B A _ : the fourth slot is silence. */
export function streamingEvents(input={}){
  const p=normalizeStreamingParams(input),slot=p.slotMs/1000,tone=p.toneMs/1000,gB=Math.pow(10,p.levelDifferenceDb/20);
  const base=.08,gA=Math.min(base,base/Math.max(1,gB)),gBv=Math.min(base,base*Math.min(1,gB));
  return [
    {slot:0,label:'A',time:0,duration:tone,channel:'both',frequencyHz:p.aHz,gain:gA,waveform:'sine',pan:-p.stereoSeparation},
    {slot:1,label:'B',time:slot,duration:tone,channel:'both',frequencyHz:p.bHz,gain:gBv,waveform:p.bTimbre,pan:p.stereoSeparation},
    {slot:2,label:'A',time:2*slot,duration:tone,channel:'both',frequencyHz:p.aHz,gain:gA,waveform:'sine',pan:-p.stereoSeparation},
    {slot:3,label:'rest',time:3*slot,duration:slot,channel:'both',frequencyHz:0,gain:0,silent:true}
  ];
}
export function renderStreamingCycle(input={},sampleRate=48000){
  const events=streamingEvents(input).filter(e=>!e.silent);
  // render each tone with constant-power panning into L/R
  const parts=events.map(e=>{const theta=(e.pan+1)*Math.PI/4;const l=renderStereoEvents([{...e,channel:'left',gain:e.gain*Math.cos(theta)}],{sampleRate,rampSeconds:.008,totalSeconds:streamingCycleSeconds(input)});const r=renderStereoEvents([{...e,channel:'right',gain:e.gain*Math.sin(theta)}],{sampleRate,rampSeconds:.008,totalSeconds:streamingCycleSeconds(input)});return {l:l.left,r:r.right,frames:l.frames}});
  const frames=parts[0].frames,left=new Float32Array(frames),right=new Float32Array(frames);
  for(const q of parts)for(let i=0;i<frames;i++){left[i]+=q.l[i];right[i]+=q.r[i]}
  return {left,right,frames,sampleRate,seconds:frames/sampleRate,events:streamingEvents(input)};
}
/** Points for the local boundary map: (separation, slot) → response. */
export function streamingBoundaryPoints(records){
  const out=[];for(const r of records||[]){const p=r?.params;if(!p||!['one-stream','two-streams','switching'].includes(r.response))continue;const n=normalizeStreamingParams(p);out.push({separationSemitones:n.separationSemitones,slotMs:n.slotMs,response:r.response})}return out;
}
