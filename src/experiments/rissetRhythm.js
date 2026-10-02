const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
export const RISSET_RHYTHM_CLASSIC=Object.freeze({rootBpm:90,layers:5,speedOctavesPerSecond:.1,direction:1,density:1,pulseTimbre:'click',stereoSpread:0});
export const RHYTHM_EDGE_TAPER=.3,RHYTHM_WIDTH=1.15;

export function normalizeRissetRhythmParams(input={}){
  return {
    rootBpm:clamp(input.rootBpm??input.bpm,30,240,RISSET_RHYTHM_CLASSIC.rootBpm),
    layers:Math.round(clamp(input.layers,3,7,RISSET_RHYTHM_CLASSIC.layers)),
    speedOctavesPerSecond:clamp(input.speedOctavesPerSecond,.01,.5,RISSET_RHYTHM_CLASSIC.speedOctavesPerSecond),
    direction:(input.direction??1)<0?-1:1,
    density:clamp(input.density,.1,1,1),
    pulseTimbre:['click','tick','pitched'].includes(input.pulseTimbre)?input.pulseTimbre:'click',
    stereoSpread:clamp(input.stereoSpread,0,1,0)
  };
}
export function rhythmLayerGain(position,n){
  const g=Math.exp(-.5*Math.pow((position-n/2)/RHYTHM_WIDTH,2)),edge=Math.min(position,n-position);
  const taper=edge<=0?0:edge>=RHYTHM_EDGE_TAPER?1:.5-.5*Math.cos(Math.PI*edge/RHYTHM_EDGE_TAPER);
  return g*taper;
}
/** Pure per-layer state at time t: position in the N-octave rate band, rate in BPM, gain, pan. */
export function rissetRhythmState(t,input={}){
  const p=normalizeRissetRhythmParams(input),n=p.layers,phase=p.speedOctavesPerSecond*t*p.direction;
  return Array.from({length:n},(_,k)=>{const position=(((k+phase)%n)+n)%n;return {k,position,rateBpm:p.rootBpm*Math.pow(2,position-(n-1)/2),gain:rhythmLayerGain(position,n),pan:p.stereoSpread*((position/n)*2-1)}});
}
export function rhythmNextWrapTime(k,t,input={}){
  const p=normalizeRissetRhythmParams(input),n=p.layers,s=p.speedOctavesPerSecond,position=(((k+s*t*p.direction)%n)+n)%n;
  const remaining=p.direction>0?n-position:position;return t+(remaining<=1e-12?n:remaining)/s;
}
export function rhythmCycleSeconds(input={}){const p=normalizeRissetRhythmParams(input);return p.layers/p.speedOctavesPerSecond;}
/** Deterministic density mask: keep pulse index i of a layer when the golden-ratio fractional sequence is below density. */
export const pulseKept=(index,density)=>density>=1||((index*0.6180339887498949)%1)<density;

/** Stateful, deterministic pulse generator. pulsesUntil(t) returns pulses with time < t not yet returned. */
export function createRissetRhythmSequencer(input={},dt=.00025){
  const p=normalizeRissetRhythmParams(input),n=p.layers;
  const phase=new Float64Array(n),count=new Int32Array(n);let t=0;
  return {
    params:p,
    pulsesUntil(until){
      const out=[];
      while(t<until){
        const st=rissetRhythmState(t,p);
        for(let k=0;k<n;k++){
          const prev=phase[k],next=prev+st[k].rateBpm/60*dt;
          if(Math.floor(next)>Math.floor(prev)){
            const frac=(Math.floor(next)-prev)/(next-prev),time=t+frac*dt,idx=count[k]++;
            if(st[k].gain>1e-4&&pulseKept(idx,p.density))out.push({time:+time.toFixed(6),layer:k,gain:st[k].gain,pan:st[k].pan,rateBpm:st[k].rateBpm,index:idx});
          }
          phase[k]=next;
          // at a wrap the rate jumps while gain is zero; reset beat phase so the new slow layer starts clean
          if(rhythmNextWrapTime(k,t,p)<t+dt)phase[k]=0;
        }
        t+=dt;
      }
      return out;
    }
  };
}
