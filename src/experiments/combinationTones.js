const clamp=(value,min,max,fallback=min)=>{
  const n=Number(value);
  return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));
};

export const COMBINATION_TONES_CLASSIC=Object.freeze({
  f1:700,
  f2:900,
  level:.16,
  balance:0,
  waveform:'sine'
});

export function normalizeCombinationToneParams(input={}){
  let f1=clamp(input.f1,80,10000,COMBINATION_TONES_CLASSIC.f1);
  let f2=clamp(input.f2,80,12000,COMBINATION_TONES_CLASSIC.f2);
  if(f1>f2)[f1,f2]=[f2,f1];
  if(f2-f1<10)f2=Math.min(12000,f1+10);
  const level=clamp(input.level,.01,.18,COMBINATION_TONES_CLASSIC.level);
  const balance=clamp(input.balance,-1,1,COMBINATION_TONES_CLASSIC.balance);
  const waveform=['sine','triangle','square','sawtooth'].includes(input.waveform)?input.waveform:COMBINATION_TONES_CLASSIC.waveform;
  return {f1,f2,level,balance,waveform};
}

export function predictedCombinationProducts(f1,f2){
  const low=Math.min(Number(f1),Number(f2));
  const high=Math.max(Number(f1),Number(f2));
  return {
    differenceHz:Math.abs(high-low),
    twoF1MinusF2Hz:Math.abs(2*low-high),
    twoF2MinusF1Hz:Math.abs(2*high-low)
  };
}

function primaryGains(level,balance){
  const f1Gain=level*(balance<=0?1:1-balance);
  const f2Gain=level*(balance>=0?1:1+balance);
  return [f1Gain,f2Gain];
}

export function buildCombinationToneStimulus(input={}){
  const p=normalizeCombinationToneParams(input);
  const [g1,g2]=primaryGains(p.level,p.balance);
  return {
    params:p,
    voices:[
      {id:'f1',frequencyHz:p.f1,gain:g1,waveform:p.waveform},
      {id:'f2',frequencyHz:p.f2,gain:g2,waveform:p.waveform}
    ],
    predictedProducts:predictedCombinationProducts(p.f1,p.f2)
  };
}

export function renderClassicCombinationSamples(input={},sampleRate=48000,durationSeconds=1){
  const stimulus=buildCombinationToneStimulus({...input,waveform:'sine'});
  const frames=Math.max(1,Math.round(sampleRate*durationSeconds));
  const out=new Float64Array(frames);
  for(let i=0;i<frames;i++){
    const t=i/sampleRate;
    out[i]=stimulus.voices.reduce((sum,v)=>sum+v.gain*Math.sin(2*Math.PI*v.frequencyHz*t),0);
  }
  return {samples:out,stimulus,sampleRate};
}

export function magnitudeAt(samples,sampleRate,frequencyHz){
  let re=0,im=0;
  for(let i=0;i<samples.length;i++){
    const phase=2*Math.PI*frequencyHz*i/sampleRate;
    re+=samples[i]*Math.cos(phase);
    im-=samples[i]*Math.sin(phase);
  }
  return 2*Math.hypot(re,im)/samples.length;
}
