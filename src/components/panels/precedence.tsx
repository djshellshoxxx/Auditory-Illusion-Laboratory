import {useState} from 'react';
import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
function Controls(p:PanelProps){return <div className="param-grid precedence-controls">
  <Num label="Lead-lag delay (ms)" k="delayMs" min={0} max={40} step={.1} {...p}/>
  <Sel label="Lead side" k="first" options={[['left','Left'],['right','Right']]} {...p}/>
  <Sel label="Source type" k="sourceType" options={[['noise-burst','Broadband noise burst'],['click','Click'],['tone-pip','1 kHz tone pip']]} {...p}/>
  <Num label="Transient duration (ms)" k="burstMs" min={.125} max={20} step={.125} {...p}/>
  <Num label="Repetition interval (ms)" k="repetitionMs" min={250} max={3000} step={10} {...p}/>
  <Num label="Lead-vs-lag level difference (dB)" k="ildDb" min={-12} max={12} step={.5} {...p}/>
  <small>Classic uses identical equal-level bursts. Positive level difference makes the lead event stronger; negative values make it weaker. Delay, not a browser timer, controls the intra-pair timing.</small></div>}
function Responses({report}:PanelProps){const [loc,setLoc]=useState('lead-side');return <section className="reports phantom-reports"><h2>Your perception</h2><p>Judge fusion and location separately. The same physical pair can sound fused while still being localized toward the lead.</p>
  <label>Perceived location<select aria-label="Precedence perceived location" value={loc} onChange={e=>setLoc(e.target.value)}><option value="lead-side">Toward lead side</option><option value="center">Center / intermediate</option><option value="lag-side">Toward lag side</option><option value="two-locations">Two locations</option><option value="uncertain">Uncertain</option></select></label>
  <button onClick={()=>report({fusion:'one-fused',location:loc})}>One fused sound</button><button onClick={()=>report({fusion:'two-distinct',location:loc})}>Two distinct sounds</button><button onClick={()=>report({fusion:'uncertain',location:loc})}>Uncertain</button></section>}
export const precedencePanels:ExperimentPanels={Controls,Responses};
