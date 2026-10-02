import {seededNoise,biquadCoefficients,applyBiquad,normalizePeak} from '../audio/noise.js';
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
export const CONTINUITY_CLASSIC=Object.freeze({condition:'masked',targetHz:1000,targetLevel:.09,gapMs:250,maskerType:'white',maskerLevel:.45,maskerBandwidthOctaves:1,cycleSeconds:1.2,gapStartSeconds:.45});
export const CONDITIONS=['continuous','silent-gap','masked'];

export function normalizeContinuityParams(input={}){
  const cycleSeconds=clamp(input.cycleSeconds,.6,4,1.2),gapMs=clamp(input.gapMs??(input.gap?Number(input.gap)*1000:undefined),30,600,250);
  const gapStartSeconds=clamp(input.gapStartSeconds,.1,cycleSeconds-gapMs/1000-.1,.45);
  return {condition:CONDITIONS.includes(input.condition)?input.condition:'masked',targetHz:clamp(input.targetHz??input.target,100,4000,1000),targetLevel:clamp(input.targetLevel,.01,.2,.09),gapMs,maskerType:['white','bandpass','notched'].includes(input.maskerType)?input.maskerType:'white',maskerLevel:clamp(input.maskerLevel??input.maskLevel,0,.6,.45),maskerBandwidthOctaves:clamp(input.maskerBandwidthOctaves,.25,3,1),cycleSeconds,gapStartSeconds};
}
export function continuitySchedule(input={}){
  const p=normalizeContinuityParams(input),g0=p.gapStartSeconds,g1=g0+p.gapMs/1000;
  const segs=p.condition==='continuous'?[{kind:'target',start:0,end:p.cycleSeconds}]:[{kind:'target',start:0,end:g0},{kind:'target-absent',start:g0,end:g1},{kind:'target',start:g1,end:p.cycleSeconds}];
  if(p.condition==='masked')segs.push({kind:'masker',start:g0,end:g1});
  return {params:p,segments:segs};
}
function ramp(i,len,r){return Math.min(1,Math.min((i+1)/r,(len-i)/r));}
/** Renders target and masker separately; target samples in the gap are exactly 0. */
export function renderContinuityCycle(input={},sampleRate=48000){
  const {params:p,segments}=continuitySchedule(input),frames=Math.round(p.cycleSeconds*sampleRate),r=Math.round(.005*sampleRate);
  const target=new Float32Array(frames),masker=new Float32Array(frames);
  for(const s of segments.filter(x=>x.kind==='target')){const a=Math.round(s.start*sampleRate),b=Math.round(s.end*sampleRate);for(let i=a;i<b;i++)target[i]=p.targetLevel*Math.sin(2*Math.PI*p.targetHz*i/sampleRate)*ramp(i-a,b-a,r)}
  const m=segments.find(x=>x.kind==='masker');
  if(m&&p.maskerLevel>0){
    const a=Math.round(m.start*sampleRate),b=Math.round(m.end*sampleRate);let n=seededNoise(b-a,0xC0FFEE);
    if(p.maskerType==='bandpass'){const q=1/(2*Math.sinh(Math.LN2/2*p.maskerBandwidthOctaves));n=normalizePeak(applyBiquad(n,biquadCoefficients('bandpass',p.targetHz,sampleRate,q),2))}
    else if(p.maskerType==='notched'){const q=1/(2*Math.sinh(Math.LN2/2*p.maskerBandwidthOctaves));n=normalizePeak(applyBiquad(n,biquadCoefficients('notch',p.targetHz,sampleRate,q),4))}
    for(let i=a;i<b;i++)masker[i]=p.maskerLevel*n[i-a]*ramp(i-a,b-a,r);
  }
  const left=new Float32Array(frames),right=new Float32Array(frames);for(let i=0;i<frames;i++){left[i]=target[i]+masker[i];right[i]=left[i]}
  return {target,masker,left,right,frames,sampleRate,seconds:frames/sampleRate,segments,params:p};
}
