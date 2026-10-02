import {scheduleRepetitions,normalizeSpeechToSongParams} from './speechToSong.js';
import type {ExperimentSession} from './session';
type Cleanup=()=>void;
const cache=new Map<string,AudioBuffer>();
async function decode(ctx:AudioContext,url:string){if(cache.has(url))return cache.get(url)!;const res=await fetch(url);const buf=await ctx.decodeAudioData(await res.arrayBuffer());cache.set(url,buf);return buf;}
export async function startSpeechToSong(ctx:AudioContext,bus:AudioNode,params:Record<string,any>,clean:Cleanup[]):Promise<ExperimentSession>{
  const which=params.playWhich==='sentence'?'sentence':'phrase';
  const url=which==='sentence'?params.sentenceUrl:params.phraseUrl;
  if(typeof url!=='string'||!url)throw new Error(which==='sentence'?'Record the full sentence first.':'Record a short phrase first, then press Start.');
  const buffer=await decode(ctx,url);
  const p=which==='sentence'?{repetitions:1,intervalSeconds:0}:normalizeSpeechToSongParams(params);
  const run=scheduleRepetitions(ctx,bus,buffer,p,ctx.currentTime+.05);
  clean.push(run.stop);
  return {startedAt:performance.now()+(run.startAt-ctx.currentTime)*1000,phases:run.schedule.map(s=>({label:which==='sentence'?'sentence':`rep ${s.index}`,start:s.start,end:s.end})),notes:`${buffer.duration.toFixed(2)} s buffer × ${p.repetitions}`};
}
