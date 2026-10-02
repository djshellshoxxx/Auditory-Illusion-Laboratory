import {startExperiment as startLegacy,stopExperiment as stopLegacy} from './runtime';
import {startGlissando,stopGlissando} from './glissandoRuntime';

export async function startExperiment(id:string,p:Record<string,any>){
  stopExperiment();
  if(id==='glissando')return startGlissando(p);
  return startLegacy(id,p);
}

export function stopExperiment(){
  stopGlissando();
  stopLegacy();
}
