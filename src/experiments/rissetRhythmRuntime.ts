import {createRissetRhythmSequencer,normalizeRissetRhythmParams} from './rissetRhythm.js';
import {lookaheadScheduler} from '../audio/scheduler';
import type {ExperimentSession} from './session';
type Cleanup=()=>void;
function pulseBuffer(ctx:AudioContext,timbre:string,layer:number,layers:number){
  const ms=timbre==='click'?8:timbre==='tick'?20:40,frames=Math.round(ctx.sampleRate*ms/1000),b=ctx.createBuffer(1,frames,ctx.sampleRate),d=b.getChannelData(0);
  let s=0x9e3779b1+layer;
  for(let i=0;i<frames;i++){const w=Math.sin(Math.PI*(i+.5)/frames)**2;
    if(timbre==='click'){s=(Math.imul(s,1664525)+1013904223)>>>0;d[i]=(s/4294967296*2-1)*w}
    else if(timbre==='tick')d[i]=Math.sin(2*Math.PI*1500*i/ctx.sampleRate)*w;
    else{const f=220*Math.pow(2,layer-Math.floor(layers/2));d[i]=Math.sin(2*Math.PI*f*i/ctx.sampleRate)*w*Math.exp(-i/frames*3)}}
  return b;
}
export function startRissetRhythm(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const p=normalizeRissetRhythmParams(params),seq=createRissetRhythmSequencer(p),t0=ctx.currentTime+.05;
  const buffers=Array.from({length:p.layers},(_,k)=>pulseBuffer(ctx,p.pulseTimbre,k,p.layers));
  const active=new Set<AudioBufferSourceNode>();
  const fill=(until:number)=>{for(const pulse of seq.pulsesUntil(until-t0)){const src=ctx.createBufferSource(),g=ctx.createGain(),pan=ctx.createStereoPanner();src.buffer=buffers[pulse.layer];g.gain.value=.22*pulse.gain;pan.pan.value=pulse.pan;src.connect(g).connect(pan).connect(bus);src.onended=()=>{active.delete(src);src.disconnect();g.disconnect();pan.disconnect()};active.add(src);src.start(t0+pulse.time)}};
  clean.push(lookaheadScheduler(ctx,fill,.5,80));
  clean.push(()=>{for(const s of active){try{s.stop()}catch{}try{s.disconnect()}catch{}}active.clear()});
  return {startedAt:performance.now()+(t0-ctx.currentTime)*1000,notes:'risset rhythm'};
}
