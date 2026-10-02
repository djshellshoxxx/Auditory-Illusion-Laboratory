import {buildMissingFundamentalComponents,normalizeMissingFundamentalParams} from './missingFundamental.js';

type Cleanup=()=>void;
type Params=Record<string,unknown>;

export function startMissingFundamental(ctx:AudioContext,bus:AudioNode,params:Params,clean:Cleanup[]){
  const normalized=normalizeMissingFundamentalParams(params,ctx.sampleRate);
  const components=buildMissingFundamentalComponents(normalized,1,ctx.sampleRate);
  const mix=ctx.createGain();
  const fade=ctx.createGain();
  const perVoice=.11/Math.sqrt(Math.max(1,components.length));
  mix.gain.value=perVoice;
  fade.gain.setValueAtTime(.0001,ctx.currentTime);
  fade.gain.exponentialRampToValueAtTime(1,ctx.currentTime+.02);
  mix.connect(fade).connect(bus);

  const oscillators=components.map(component=>{
    const oscillator=ctx.createOscillator();
    const gain=ctx.createGain();
    const real=new Float32Array([0,Math.sin(component.phaseRadians)]);
    const imag=new Float32Array([0,Math.cos(component.phaseRadians)]);
    oscillator.setPeriodicWave(ctx.createPeriodicWave(real,imag,{disableNormalization:true}));
    oscillator.frequency.value=component.frequencyHz;
    gain.gain.value=component.gain;
    oscillator.connect(gain).connect(mix);
    oscillator.start();
    return {oscillator,gain};
  });

  clean.push(()=>{
    const now=ctx.currentTime;
    fade.gain.cancelScheduledValues(now);
    fade.gain.setTargetAtTime(0,now,.008);
    for(const {oscillator} of oscillators){try{oscillator.stop(now+.05)}catch{}}
    window.setTimeout(()=>{
      for(const {oscillator,gain} of oscillators){oscillator.disconnect();gain.disconnect()}
      mix.disconnect();
      fade.disconnect();
    },80);
  });

  return {params:normalized,components};
}
