import {renderTritonePair,normalizeTritoneParams,PITCH_CLASSES,tritonePair} from './tritone.js';
import {loopRendered} from '../audio/scheduler';
import type {ExperimentSession} from './session';
type Cleanup=()=>void;
export function startTritone(ctx:AudioContext,bus:AudioNode,params:Record<string,unknown>,clean:Cleanup[]):ExperimentSession{
  const p=normalizeTritoneParams(params),first=Number(params.firstPitchClass??0)||0;
  const rendered=renderTritonePair(first,p,ctx.sampleRate);
  const play=loopRendered(ctx,bus,rendered,{loop:false});
  clean.push(play.stop);
  const [a,b]=tritonePair(first),T=p.toneSeconds,G=p.gapSeconds;
  return {startedAt:performance.now()+(play.startAt-ctx.currentTime)*1000,phases:[{label:`tone 1: ${PITCH_CLASSES[a]}`,start:0,end:T},{label:`tone 2: ${PITCH_CLASSES[b]}`,start:T+G,end:2*T+G}]};
}
