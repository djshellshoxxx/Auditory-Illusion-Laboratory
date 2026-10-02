import {rissetGlideState,normalizeRissetGlideParams,nextWrapTime} from './rissetGlide.js';
import {lookaheadScheduler} from '../audio/scheduler';
import type {ExperimentSession} from './session';
type Cleanup=()=>void;
const CHUNK=.025,LEVEL=.04;
export function startRissetGlide(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const p=normalizeRissetGlideParams(params);
  const t0=ctx.currentTime+.05;
  const voices=Array.from({length:p.layers},()=>{const o=ctx.createOscillator(),g=ctx.createGain(),pan=ctx.createStereoPanner();o.type=p.waveform as OscillatorType;g.gain.value=0;o.connect(g).connect(pan).connect(bus);return {o,g,pan}});
  const init=rissetGlideState(0,p);
  voices.forEach((v,k)=>{v.o.frequency.setValueAtTime(init[k].frequencyHz,t0);v.g.gain.setValueAtTime(0,t0);v.pan.pan.setValueAtTime(init[k].pan,t0);v.o.start(t0)});
  let scheduled=t0;
  const fill=(until:number)=>{
    while(scheduled<until){
      const a=scheduled-t0,b=a+CHUNK,sb=rissetGlideState(b,p);
      voices.forEach((v,k)=>{
        const wraps=nextWrapTime(k,a,p)<b;
        if(wraps){v.o.frequency.setValueAtTime(sb[k].frequencyHz,t0+a);v.g.gain.setValueAtTime(0,t0+a);v.g.gain.linearRampToValueAtTime(sb[k].gain*LEVEL,t0+b);v.pan.pan.setValueAtTime(sb[k].pan,t0+a)}
        else{v.o.frequency.exponentialRampToValueAtTime(sb[k].frequencyHz,t0+b);v.g.gain.linearRampToValueAtTime(sb[k].gain*LEVEL,t0+b);v.pan.pan.linearRampToValueAtTime(sb[k].pan,t0+b)}
      });
      scheduled+=CHUNK;
    }
  };
  clean.push(lookaheadScheduler(ctx,fill,.4,60));
  clean.push(()=>{const now=ctx.currentTime;for(const v of voices){v.g.gain.cancelScheduledValues(now);v.g.gain.setTargetAtTime(0,now,.01);try{v.o.stop(now+.08)}catch{}}window.setTimeout(()=>voices.forEach(v=>{v.o.disconnect();v.g.disconnect();v.pan.disconnect()}),120)});
  return {startedAt:performance.now()+(t0-ctx.currentTime)*1000,notes:'continuous glide'};
}
