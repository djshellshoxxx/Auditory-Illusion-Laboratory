import {renderScaleLoop,scaleDichoticEvents,scaleLoopSeconds} from './scale.js';
import {loopRendered} from '../audio/scheduler';
import type {ExperimentSession} from './session';
type Cleanup=()=>void;
export function startScale(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const rendered=renderScaleLoop(params,ctx.sampleRate);
  const play=loopRendered(ctx,bus,rendered,{loop:true});
  clean.push(play.stop);
  return {startedAt:performance.now()+(play.startAt-ctx.currentTime)*1000,loopSeconds:scaleLoopSeconds(params),events:scaleDichoticEvents(params).map((e:any)=>({time:e.time,duration:e.duration,channel:e.channel,frequencyHz:e.frequencyHz,label:`${Math.round(e.frequencyHz)}`}))};
}
