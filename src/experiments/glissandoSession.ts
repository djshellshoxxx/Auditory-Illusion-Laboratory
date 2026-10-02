import {GLISSANDO_CLASSIC,glissandoFrequencyAt,glissandoSpeakerAt} from './glissando.js';
import type {ExperimentSession,LaneEvent} from './session';
/** Physical lanes for one glissando cycle: which speaker carries the fixed tone and the glide in each 238 ms slot. */
export function glissandoSession(params:Record<string,any>):ExperimentSession{
  const p={...GLISSANDO_CLASSIC,...params},cycle=Math.max(.5,Number(p.cycleSeconds)||2.5),swap=Math.max(.05,Number(p.swapSeconds)||.238),events:LaneEvent[]=[];
  for(let t=0;t<cycle-1e-9;t+=swap){const d=Math.min(swap,cycle-t),s=glissandoSpeakerAt(t,p);
    events.push({time:t,duration:d,channel:s.fixed as 'left'|'right',frequencyHz:Number(p.fixedHz)||262,label:'oboe'});
    events.push({time:t,duration:d,channel:s.glide as 'left'|'right',frequencyHz:glissandoFrequencyAt(t+d/2,p),label:'glide'});}
  return {startedAt:performance.now()+30,loopSeconds:cycle,events,notes:'swap phase drifts against the 2.5 s cycle; lanes show the first cycle'};
}
