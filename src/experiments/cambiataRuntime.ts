import {renderCambiataLoop,cambiataDichoticEvents,cambiataLoopSeconds,midiName} from './cambiata.js';
import {loopRendered} from '../audio/scheduler';
import type {ExperimentSession} from './session';
type Cleanup=()=>void;
export function startCambiata(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const rendered=renderCambiataLoop(params,ctx.sampleRate);
  const play=loopRendered(ctx,bus,rendered,{loop:true});
  clean.push(play.stop);
  return {startedAt:performance.now()+(play.startAt-ctx.currentTime)*1000,loopSeconds:cambiataLoopSeconds(params),events:cambiataDichoticEvents(params).map((e:any)=>({time:e.time,duration:e.duration,channel:e.channel,frequencyHz:e.frequencyHz,label:midiName(e.midi)}))};
}
