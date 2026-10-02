import {buildPrecedencePair,normalizePrecedenceParams} from './precedence.js';

type Cleanup=()=>void;
type Params=Record<string,unknown>;

function seededNoise(length:number){
  const data=new Float32Array(length);
  let state=0x51f15e;
  for(let i=0;i<length;i++){
    state=(Math.imul(state,1664525)+1013904223)>>>0;
    data[i]=(state/4294967296*2-1);
  }
  return data;
}

function createTransient(ctx:AudioContext,sourceType:string,burstMs:number){
  const frames=Math.max(1,Math.round(ctx.sampleRate*burstMs/1000));
  const buffer=ctx.createBuffer(1,frames,ctx.sampleRate);
  const data=buffer.getChannelData(0);
  if(sourceType==='click'){
    data[0]=1;
    if(frames>1)data[1]=-.5;
  }else if(sourceType==='tone-pip'){
    for(let i=0;i<frames;i++){
      const phase=2*Math.PI*1000*i/ctx.sampleRate;
      const window=Math.sin(Math.PI*(i+.5)/frames)**2;
      data[i]=Math.sin(phase)*window;
    }
  }else{
    const noise=seededNoise(frames);
    for(let i=0;i<frames;i++){
      const window=Math.sin(Math.PI*(i+.5)/frames)**2;
      data[i]=noise[i]*window;
    }
  }
  return buffer;
}

function pairGains(ildDb:number){
  const base=.11;
  if(ildDb>=0)return {lead:base,lag:base*Math.pow(10,-ildDb/20)};
  return {lead:base*Math.pow(10,ildDb/20),lag:base};
}

export function startPrecedence(ctx:AudioContext,bus:AudioNode,params:Params,clean:Cleanup[]){
  const p=normalizePrecedenceParams(params);
  const pair=buildPrecedencePair(p);
  const transient=createTransient(ctx,p.sourceType,p.burstMs);
  const gains=pairGains(p.ildDb);
  const active=new Set<AudioBufferSourceNode>();

  const schedulePair=()=>{
    const baseTime=ctx.currentTime+.02;
    for(const event of pair.events){
      const source=ctx.createBufferSource();
      const gain=ctx.createGain();
      const pan=ctx.createStereoPanner();
      source.buffer=transient;
      gain.gain.value=event.role==='lead'?gains.lead:gains.lag;
      pan.pan.value=event.side==='left'?-1:1;
      source.connect(gain).connect(pan).connect(bus);
      source.onended=()=>{active.delete(source);source.disconnect();gain.disconnect();pan.disconnect()};
      active.add(source);
      source.start(baseTime+event.timeSeconds);
    }
  };

  schedulePair();
  const timer=window.setInterval(schedulePair,p.repetitionMs);
  clean.push(()=>{
    window.clearInterval(timer);
    for(const source of active){try{source.stop()}catch{};try{source.disconnect()}catch{}}
    active.clear();
  });
  return pair;
}

export function precedenceSession(params:Params){
  const p=normalizePrecedenceParams(params),pair=buildPrecedencePair(p),loop=p.repetitionMs/1000,dur=Math.max(.004,p.burstMs/1000);
  return {startedAt:performance.now()+20,loopSeconds:loop,events:pair.events.map(e=>({time:e.timeSeconds,duration:dur,channel:e.side as 'left'|'right',frequencyHz:1000,label:`${e.role} ${e.side}`}))};
}
