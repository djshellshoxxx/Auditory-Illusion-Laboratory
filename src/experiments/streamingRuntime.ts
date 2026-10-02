import {renderStreamingCycle,streamingEvents,streamingCycleSeconds} from './streaming.js';
import {loopRendered} from '../audio/scheduler';
import type {ExperimentSession} from './session';
type Cleanup=()=>void;
export function startStreaming(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const rendered=renderStreamingCycle(params,ctx.sampleRate);
  const play=loopRendered(ctx,bus,rendered,{loop:true});
  clean.push(play.stop);
  return {startedAt:performance.now()+(play.startAt-ctx.currentTime)*1000,loopSeconds:streamingCycleSeconds(params),events:streamingEvents(params).filter((e:any)=>!e.silent).map((e:any)=>({time:e.time,duration:e.duration,channel:'both' as const,frequencyHz:e.frequencyHz,label:e.label,gain:1}))};
}
