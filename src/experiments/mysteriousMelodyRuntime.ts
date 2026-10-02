import {renderMysteriousMelody,mysteriousMelodySeconds,midiToHz} from './mysteriousMelody.js';
import {loopRendered} from '../audio/scheduler';
import type {ExperimentSession} from './session';
type Cleanup=()=>void;
export function startMysteriousMelody(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const rendered=renderMysteriousMelody(params,ctx.sampleRate);
  const play=loopRendered(ctx,bus,rendered,{loop:false});
  clean.push(play.stop);
  return {startedAt:performance.now()+(play.startAt-ctx.currentTime)*1000,loopSeconds:mysteriousMelodySeconds(params)+.1,events:rendered.notes.map((n:any)=>({time:n.time,duration:n.duration,channel:'both' as const,frequencyHz:midiToHz(n.midi),gain:1}))};
}
