// Seeded noise and simple IIR filters for deterministic offline renders.
export function seededNoise(frames,seed=1){const d=new Float32Array(frames);let s=(seed>>>0)||1;for(let i=0;i<frames;i++){s=(Math.imul(s,1664525)+1013904223)>>>0;d[i]=s/4294967296*2-1}return d;}
/** RBJ biquad coefficients. type: 'lowpass'|'highpass'|'bandpass'|'notch' */
export function biquadCoefficients(type,frequencyHz,sampleRate,q=.707){
  const w=2*Math.PI*frequencyHz/sampleRate,c=Math.cos(w),s=Math.sin(w),a=s/(2*q);let b0,b1,b2,a0,a1,a2;
  if(type==='lowpass'){b0=(1-c)/2;b1=1-c;b2=(1-c)/2}else if(type==='highpass'){b0=(1+c)/2;b1=-(1+c);b2=(1+c)/2}else if(type==='notch'){b0=1;b1=-2*c;b2=1}else{b0=a;b1=0;b2=-a}
  a0=1+a;a1=-2*c;a2=1-a;return {b0:b0/a0,b1:b1/a0,b2:b2/a0,a1:a1/a0,a2:a2/a0};
}
export function applyBiquad(input,coef,stages=1){let x=input;for(let st=0;st<stages;st++){const y=new Float32Array(x.length);let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<x.length;i++){const v=coef.b0*x[i]+coef.b1*x1+coef.b2*x2-coef.a1*y1-coef.a2*y2;x2=x1;x1=x[i];y2=y1;y1=v;y[i]=v}x=y}return x;}
export function normalizePeak(data,peak=1){let m=0;for(let i=0;i<data.length;i++)m=Math.max(m,Math.abs(data[i]));if(m>0)for(let i=0;i<data.length;i++)data[i]*=peak/m;return data;}
