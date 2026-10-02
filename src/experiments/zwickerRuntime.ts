import {zwickerNotchEdges,ZWICKER_CLASSIC} from './zwicker.js';

type Cleanup=()=>void;
type Params=Record<string,any>;

const clamp=(value:number,min:number,max:number,fallback:number)=>{
  const n=Number(value);
  return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));
};

export function startZwicker(
  ctx:AudioContext,
  bus:AudioNode,
  params:Params,
  clean:Cleanup[],
  onStatus?:(message:string)=>void
){
  const centerHz=clamp(params.centerHz,500,8000,ZWICKER_CLASSIC.centerHz);
  const notchOctaves=clamp(params.notchOctaves,.2,1.5,ZWICKER_CLASSIC.notchOctaves);
  const noiseSeconds=clamp(params.noiseSeconds,.25,60,ZWICKER_CLASSIC.noiseSeconds);
  const listenSeconds=clamp(params.listenSeconds,.25,12,ZWICKER_CLASSIC.listenSeconds);
  const level=clamp(params.level,.01,.3,ZWICKER_CLASSIC.level);
  const filterStages=Math.round(clamp(params.filterStages,1,6,ZWICKER_CLASSIC.filterStages));
  const {lowHz,highHz}=zwickerNotchEdges(centerHz,notchOctaves);
  const frameCount=Math.max(1,Math.round(ctx.sampleRate*noiseSeconds));
  const noise=ctx.createBuffer(1,frameCount,ctx.sampleRate);
  const data=noise.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;

  const source=ctx.createBufferSource();
  const envelope=ctx.createGain();
  source.buffer=noise;
  const settleSeconds=Math.min(.1,Math.max(.03,noiseSeconds*.1));
  const fadeSeconds=Math.min(.05,Math.max(.015,noiseSeconds*.05));
  const silentAt=Math.max(.02,noiseSeconds-settleSeconds);
  const fadeStart=Math.max(.02,silentAt-fadeSeconds);
  envelope.gain.setValueAtTime(0,ctx.currentTime);
  envelope.gain.linearRampToValueAtTime(level,ctx.currentTime+.02);
  envelope.gain.setValueAtTime(level,ctx.currentTime+fadeStart);
  envelope.gain.linearRampToValueAtTime(0,ctx.currentTime+silentAt);
  envelope.gain.setValueAtTime(0,ctx.currentTime+noiseSeconds);
  source.connect(envelope);

  const filters:BiquadFilterNode[]=[];
  const connectBand=(type:BiquadFilterType,frequency:number)=>{
    let node:AudioNode=envelope;
    for(let i=0;i<filterStages;i++){
      const filter=ctx.createBiquadFilter();
      filter.type=type;
      filter.frequency.value=frequency;
      filter.Q.value=.707;
      node.connect(filter);
      node=filter;
      filters.push(filter);
    }
    const bandGain=ctx.createGain();
    bandGain.gain.value=.72;
    node.connect(bandGain).connect(bus);
    return bandGain;
  };

  const lowGain=connectBand('lowpass',lowHz);
  const highGain=connectBand('highpass',highHz);
  const startTime=ctx.currentTime;
  source.start(startTime);
  source.stop(startTime+noiseSeconds);
  onStatus?.('Notched noise playing');

  const listenTimer=window.setTimeout(()=>onStatus?.('Listen now: digital silence'),noiseSeconds*1000);
  const doneTimer=window.setTimeout(()=>onStatus?.('Trial complete'),(noiseSeconds+listenSeconds)*1000);

  clean.push(()=>{
    window.clearTimeout(listenTimer);
    window.clearTimeout(doneTimer);
    try{source.stop()}catch{}
    source.disconnect();
    envelope.disconnect();
    lowGain.disconnect();
    highGain.disconnect();
    filters.forEach(filter=>filter.disconnect());
  });
}
