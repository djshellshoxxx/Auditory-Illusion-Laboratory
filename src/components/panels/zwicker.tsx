import {useState} from 'react';
import {Num,type ExperimentPanels,type PanelProps} from './types';
function Controls(p:PanelProps){return <div className="param-grid zwicker-controls">
  <Num label="Notch center (Hz)" k="centerHz" min={500} max={8000} step={10} {...p}/>
  <Num label="Notch width (octaves)" k="notchOctaves" min={.2} max={1.5} step={.05} {...p}/>
  <Num label="Noise duration (seconds)" k="noiseSeconds" min={.25} max={60} step={.05} {...p}/>
  <Num label="Silent listening window (seconds)" k="listenSeconds" min={.25} max={12} step={.05} {...p}/>
  <Num label="Noise level" k="level" min={.01} max={.3} step={.01} {...p}/>
  <Num label="Filter steepness (stages)" k="filterStages" min={1} max={6} step={1} {...p}/>
  <small>The report window is digitally silent. If you do not hear a tone, do not compensate by pushing the listening level higher.</small></div>}
function Responses({report}:PanelProps){const [pitch,setPitch]=useState('');return <section className="reports phantom-reports"><h2>Your perception</h2><p>Report only what remains after the physical noise stops. An estimated pitch is optional.</p>
  <label>Estimated pitch<input aria-label="Zwicker estimated pitch (Hz)" type="number" min="20" max="16000" step="1" value={pitch} onChange={e=>setPitch(e.target.value)} placeholder="Hz (optional)"/></label>
  <button onClick={()=>report({heard:true,estimatedPitchHz:pitch?+pitch:null})}>Heard a phantom tone</button><button onClick={()=>report({heard:false,estimatedPitchHz:null})}>No clear phantom tone</button></section>}
export const zwickerPanels:ExperimentPanels={Controls,Responses};
