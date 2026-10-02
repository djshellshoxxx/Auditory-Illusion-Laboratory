import {renderContinuityCycle} from './continuity.js';
import {loopRendered} from '../audio/scheduler';
import type {ExperimentSession,LaneEvent} from './session';
type Cleanup=()=>void;
export function startContinuity(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const rendered=renderContinuityCycle(params,ctx.sampleRate),p=rendered.params;
  const play=loopRendered(ctx,bus,rendered,{loop:true});
  clean.push(play.stop);
  const events:LaneEvent[]=rendered.segments.filter((s:any)=>s.kind==='target').map((s:any)=>({time:s.start,duration:s.end-s.start,channel:'both' as const,frequencyHz:p.targetHz,label:'target'}));
  for(const s of rendered.segments.filter((x:any)=>x.kind==='masker'))events.push({time:s.start,duration:s.end-s.start,channel:'both',frequencyHz:p.targetHz*2.5,label:'masker',gain:.6},{time:s.start,duration:s.end-s.start,channel:'both',frequencyHz:p.targetHz/2.5,label:'',gain:.6});
  return {startedAt:performance.now()+(play.startAt-ctx.currentTime)*1000,loopSeconds:p.cycleSeconds,events};
}
