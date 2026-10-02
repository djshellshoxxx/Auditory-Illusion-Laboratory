const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
export const RISSET_GLIDE_CLASSIC=Object.freeze({layers:8,speedOctavesPerSecond:.12,direction:1,envelopeCenterHz:900,envelopeWidthOctaves:1.3,stereoSpread:0,waveform:'sine'});
export const EDGE_TAPER_OCTAVES=.3;

export function normalizeRissetGlideParams(input={}){
  return {
    layers:Math.round(clamp(input.layers??input.partials,6,10,RISSET_GLIDE_CLASSIC.layers)),
    speedOctavesPerSecond:clamp(input.speedOctavesPerSecond??input.speed,.01,1,RISSET_GLIDE_CLASSIC.speedOctavesPerSecond),
    direction:(input.direction??1)<0?-1:1,
    envelopeCenterHz:clamp(input.envelopeCenterHz??input.center,200,4000,RISSET_GLIDE_CLASSIC.envelopeCenterHz),
    envelopeWidthOctaves:clamp(input.envelopeWidthOctaves??input.width,.5,3,RISSET_GLIDE_CLASSIC.envelopeWidthOctaves),
    stereoSpread:clamp(input.stereoSpread,0,1,0),
    waveform:input.waveform==='triangle'?'triangle':'sine'
  };
}
/** Fixed Gaussian envelope times a raised-cosine taper that is exactly 0 at the band edges. */
export function layerGain(positionOctaves,p){
  const n=p.layers,center=n/2,g=Math.exp(-.5*Math.pow((positionOctaves-center)/p.envelopeWidthOctaves,2));
  const edge=Math.min(positionOctaves,n-positionOctaves);
  const taper=edge<=0?0:edge>=EDGE_TAPER_OCTAVES?1:.5-.5*Math.cos(Math.PI*edge/EDGE_TAPER_OCTAVES);
  return g*taper;
}
export function bandLowHz(p){return p.envelopeCenterHz/Math.pow(2,p.layers/2);}
/** Pure state of every layer at time t (seconds since start). */
export function rissetGlideState(t,input={}){
  const p=normalizeRissetGlideParams(input),n=p.layers,low=bandLowHz(p),phase=p.speedOctavesPerSecond*t*p.direction;
  return Array.from({length:n},(_,k)=>{
    const position=(((k+phase)%n)+n)%n;
    return {k,position,frequencyHz:low*Math.pow(2,position),gain:layerGain(position,p),pan:p.stereoSpread*((position/n)*2-1)};
  });
}
/** Time (s) at which layer k next wraps after t. */
export function nextWrapTime(k,t,input={}){
  const p=normalizeRissetGlideParams(input),n=p.layers,s=p.speedOctavesPerSecond;
  const phase=s*t*p.direction,position=(((k+phase)%n)+n)%n;
  const remaining=p.direction>0?n-position:position;
  return t+(remaining<=1e-12?n:remaining)/s;
}
export function cycleSeconds(input={}){const p=normalizeRissetGlideParams(input);return p.layers/p.speedOctavesPerSecond;}
