import {renderOctaveLoop,octaveLaneEvents,normalizeOctaveParams} from './octave.js';
import {loopRendered} from '../audio/scheduler';
import type {ExperimentSession} from './session';
type Cleanup=()=>void;
export function startOctave(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const p=normalizeOctaveParams(params);
  const rendered=renderOctaveLoop(p,ctx.sampleRate);
  const play=loopRendered(ctx,bus,rendered,{loop:true,gain:1});
  clean.push(play.stop);
  return {startedAt:performance.now()+(play.startAt-ctx.currentTime)*1000,loopSeconds:2*p.stateSeconds,events:octaveLaneEvents(p),notes:`Loop buffer ${rendered.loopSeconds.toFixed(2)} s`};
}
