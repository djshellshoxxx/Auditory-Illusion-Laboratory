import {renderShepardCycle,shepardCycleSeconds} from './shepard.js';
import {loopRendered} from '../audio/scheduler';
import type {ExperimentSession,LaneEvent} from './session';
type Cleanup=()=>void;
export function startShepard(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const rendered=renderShepardCycle(params,ctx.sampleRate);
  const play=loopRendered(ctx,bus,rendered,{loop:true});
  clean.push(play.stop);
  const events:LaneEvent[]=[];
  for(const e of rendered.events as any[])for(const c of e.components)if(c.gain>.02)events.push({time:e.time,duration:e.duration,channel:'both',frequencyHz:c.frequencyHz,gain:c.gain,label:c.k===0?e.label:undefined});
  return {startedAt:performance.now()+(play.startAt-ctx.currentTime)*1000,loopSeconds:shepardCycleSeconds(params),events};
}
