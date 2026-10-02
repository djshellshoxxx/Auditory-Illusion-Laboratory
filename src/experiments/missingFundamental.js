const clamp=(value,min,max,fallback=min)=>{
  const n=Number(value);
  return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));
};

export const MISSING_FUNDAMENTAL_CLASSIC=Object.freeze({
  f0:110,
  firstHarmonic:2,
  lastHarmonic:8,
  amplitudeRolloffDbPerOctave:6,
  phaseMode:'sine'
});

export function normalizeMissingFundamentalParams(input={},sampleRate=48000){
  const sr=clamp(sampleRate,8000,384000,48000);
  const nyquistSafe=sr*.48;
  const firstHarmonic=Math.round(clamp(input.firstHarmonic??input.first,2,16,MISSING_FUNDAMENTAL_CLASSIC.firstHarmonic));
  const maxF0=Math.max(40,Math.min(2000,nyquistSafe/firstHarmonic));
  const f0=clamp(input.f0,40,maxF0,MISSING_FUNDAMENTAL_CLASSIC.f0);
  const maxLast=Math.max(firstHarmonic,Math.min(24,Math.floor(nyquistSafe/f0)));
  const lastHarmonic=Math.round(clamp(input.lastHarmonic??input.last,firstHarmonic,maxLast,MISSING_FUNDAMENTAL_CLASSIC.lastHarmonic));
  const amplitudeRolloffDbPerOctave=clamp(input.amplitudeRolloffDbPerOctave,0,18,MISSING_FUNDAMENTAL_CLASSIC.amplitudeRolloffDbPerOctave);
  const phaseMode=['sine','alternating','random'].includes(input.phaseMode)?input.phaseMode:MISSING_FUNDAMENTAL_CLASSIC.phaseMode;
  return {f0,firstHarmonic,lastHarmonic,amplitudeRolloffDbPerOctave,phaseMode};
}

const makeRandom=seed=>{
  let state=(Number(seed)>>>0)||1;
  return()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
};

export function buildMissingFundamentalComponents(input={},seed=1,sampleRate=48000){
  const p=normalizeMissingFundamentalParams(input,sampleRate);
  const random=makeRandom(seed);
  const components=[];
  for(let harmonic=p.firstHarmonic;harmonic<=p.lastHarmonic;harmonic++){
    const octavesAboveFirst=Math.log2(harmonic/p.firstHarmonic);
    const gain=Math.pow(10,-p.amplitudeRolloffDbPerOctave*octavesAboveFirst/20);
    const phaseRadians=p.phaseMode==='alternating'?(harmonic%2?Math.PI:0):p.phaseMode==='random'?random()*Math.PI*2:0;
    components.push({harmonic,frequencyHz:p.f0*harmonic,gain,phaseRadians});
  }
  return components;
}
