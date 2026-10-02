import {audioEngine} from '../audio/AudioEngine';
import {GLISSANDO_CLASSIC} from './glissando.js';

type Cleanup=()=>void;
let stopCurrent:Cleanup=()=>{};
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,Number(v)||a));

export async function startGlissando(params:Record<string,any>){
  stopGlissando();
  const ctx=await audioEngine.ensureRunning(),bus=await audioEngine.createInputBus();
  const p={
    fixedHz:clamp(params.fixedHz??params.fixed??GLISSANDO_CLASSIC.fixedHz,80,1200),
    lowHz:clamp(params.lowHz??params.low??GLISSANDO_CLASSIC.lowHz,40,4000),
    highHz:clamp(params.highHz??params.high??GLISSANDO_CLASSIC.highHz,80,8000),
    cycleSeconds:clamp(params.cycleSeconds??params.duration??GLISSANDO_CLASSIC.cycleSeconds,.5,20),
    swapSeconds:clamp(params.swapSeconds??GLISSANDO_CLASSIC.swapSeconds,.05,2),
    channelSwap:Boolean(params.channelSwap),
    fixedTimbre:String(params.fixedTimbre??'oboe-like')
  };
  if(p.highHz<=p.lowHz)p.highHz=p.lowHz*2;

  const fixed=ctx.createOscillator(),fg=ctx.createGain(),fp=ctx.createStereoPanner();
  const glide=ctx.createOscillator(),gg=ctx.createGain(),gp=ctx.createStereoPanner();
  if(p.fixedTimbre==='sine')fixed.type='sine';
  else if(p.fixedTimbre==='triangle')fixed.type='triangle';
  else{
    const real=new Float32Array(9),imag=new Float32Array([0,1,.46,.31,.23,.17,.13,.10,.075]);
    fixed.setPeriodicWave(ctx.createPeriodicWave(real,imag,{disableNormalization:false}));
  }
  fixed.frequency.value=p.fixedHz;glide.type='sine';
  fg.gain.value=.032;gg.gain.value=.045;
  fixed.connect(fg).connect(fp).connect(bus);glide.connect(gg).connect(gp).connect(bus);

  const start=ctx.currentTime+.03,half=p.cycleSeconds/2;
  let nextCycleStart=start,nextSwapTime=start,swapIndex=0;
  glide.frequency.setValueAtTime(p.lowHz,start);
  const schedule=(until:number)=>{
    while(nextCycleStart<until){
      glide.frequency.exponentialRampToValueAtTime(p.highHz,nextCycleStart+half);
      glide.frequency.exponentialRampToValueAtTime(p.lowHz,nextCycleStart+p.cycleSeconds);
      nextCycleStart+=p.cycleSeconds;
    }
    while(nextSwapTime<until){
      const fixedLeft=(swapIndex%2===0)!==p.channelSwap;
      fp.pan.setValueAtTime(fixedLeft?-1:1,nextSwapTime);
      gp.pan.setValueAtTime(fixedLeft?1:-1,nextSwapTime);
      swapIndex++;
      nextSwapTime=start+swapIndex*p.swapSeconds;
    }
  };
  schedule(ctx.currentTime+20);
  fixed.start(start);glide.start(start);
  const timer=window.setInterval(()=>schedule(ctx.currentTime+20),8000);
  stopCurrent=()=>{window.clearInterval(timer);try{fixed.stop();glide.stop()}catch{}fixed.disconnect();glide.disconnect();fg.disconnect();gg.disconnect();fp.disconnect();gp.disconnect()};
  audioEngine.registerCleanup(stopCurrent);
}

export function stopGlissando(){try{stopCurrent()}catch{}stopCurrent=()=>{}}
