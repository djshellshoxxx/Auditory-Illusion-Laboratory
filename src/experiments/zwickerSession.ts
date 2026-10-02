import {ZWICKER_CLASSIC} from './zwicker.js';
import type {ExperimentSession} from './session';
export function zwickerSession(params:Record<string,any>):ExperimentSession{
  const noise=Math.max(.25,Number(params.noiseSeconds)||ZWICKER_CLASSIC.noiseSeconds),listen=Math.max(.25,Number(params.listenSeconds)||ZWICKER_CLASSIC.listenSeconds);
  return {startedAt:performance.now(),phases:[{label:'NOTCHED NOISE (inducer)',start:0,end:noise},{label:'DIGITAL SILENCE — listen now',start:noise,end:noise+listen}]};
}
