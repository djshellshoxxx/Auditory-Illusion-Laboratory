import {phantomWordSchedule} from '../audio/core.js';
import {PHANTOM_WORD_DEFAULT_LABELS,PHANTOM_WORD_TOKEN_A,PHANTOM_WORD_TOKEN_B} from '../assets/phantomWords.js';

type Cleanup=()=>void;
type Params=Record<string,any>;

async function decode(ctx:AudioContext,url:string){
  const response=await fetch(url);
  if(!response.ok)throw new Error(`Could not load Phantom Words speech token (${response.status})`);
  return ctx.decodeAudioData(await response.arrayBuffer());
}

export async function startPhantomWords(ctx:AudioContext,bus:AudioNode,p:Params,clean:Cleanup[]){
  const tokenAUrl=typeof p.tokenAUrl==='string'&&p.tokenAUrl?p.tokenAUrl:PHANTOM_WORD_TOKEN_A;
  const tokenBUrl=typeof p.tokenBUrl==='string'&&p.tokenBUrl?p.tokenBUrl:PHANTOM_WORD_TOKEN_B;
  const tokenALabel=typeof p.tokenALabel==='string'&&p.tokenALabel?p.tokenALabel:PHANTOM_WORD_DEFAULT_LABELS[0];
  const tokenBLabel=typeof p.tokenBLabel==='string'&&p.tokenBLabel?p.tokenBLabel:PHANTOM_WORD_DEFAULT_LABELS[1];
  const tokenPeriod=Math.min(2,Math.max(.15,Number(p.tokenPeriod)||.4));
  const offset=Math.min(tokenPeriod*2,Math.max(0,Number.isFinite(Number(p.offset))?Number(p.offset):tokenPeriod));
  const repetitions=Math.min(80,Math.max(2,Math.round(Number(p.repetitions)||24)));
  const [a,b]=await Promise.all([decode(ctx,tokenAUrl),decode(ctx,tokenBUrl)]);
  const schedule=phantomWordSchedule([tokenALabel,tokenBLabel],tokenPeriod,repetitions,offset);
  const buffers=new Map([[tokenALabel,a],[tokenBLabel,b]]);
  const sources:AudioBufferSourceNode[]=[];
  const nodes:AudioNode[]=[];
  const startAt=ctx.currentTime+.06;
  const swap=Boolean(p.channelSwap);

  for(const event of schedule){
    const source=ctx.createBufferSource();
    const gain=ctx.createGain();
    const pan=ctx.createStereoPanner();
    source.buffer=buffers.get(event.token)??a;
    gain.gain.value=.13;
    const physicalChannel=swap?(event.channel==='left'?'right':'left'):event.channel;
    pan.pan.value=physicalChannel==='left'?-1:1;
    source.connect(gain).connect(pan).connect(bus);
    source.start(startAt+event.time);
    sources.push(source);nodes.push(gain,pan);
  }

  clean.push(()=>{
    for(const source of sources){try{source.stop()}catch{}source.disconnect()}
    for(const node of nodes)node.disconnect();
  });
}
