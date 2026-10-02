import {buildCombinationToneStimulus} from './combinationTones.js';

type Cleanup=()=>void;
type Params=Record<string,unknown>;

export function startCombinationTones(ctx:AudioContext,bus:AudioNode,params:Params,clean:Cleanup[]){
  const stimulus=buildCombinationToneStimulus(params);
  const fade=ctx.createGain();
  fade.gain.setValueAtTime(.0001,ctx.currentTime);
  fade.gain.exponentialRampToValueAtTime(1,ctx.currentTime+.02);
  fade.connect(bus);

  const voices=stimulus.voices.map((voice:{frequencyHz:number;gain:number;waveform:OscillatorType})=>{
    const oscillator=ctx.createOscillator();
    const gain=ctx.createGain();
    oscillator.type=voice.waveform;
    oscillator.frequency.value=voice.frequencyHz;
    gain.gain.value=voice.gain;
    oscillator.connect(gain).connect(fade);
    oscillator.start();
    return {oscillator,gain};
  });

  clean.push(()=>{
    const now=ctx.currentTime;
    fade.gain.cancelScheduledValues(now);
    fade.gain.setTargetAtTime(0,now,.008);
    for(const {oscillator} of voices){try{oscillator.stop(now+.05)}catch{}}
    window.setTimeout(()=>{
      for(const {oscillator,gain} of voices){oscillator.disconnect();gain.disconnect()}
      fade.disconnect();
    },80);
  });

  return stimulus;
}
