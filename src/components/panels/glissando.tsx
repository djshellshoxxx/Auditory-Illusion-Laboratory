import {useState} from 'react';
import {Num,Sel,Chk,type ExperimentPanels,type PanelProps} from './types';
function Controls(p:PanelProps){return <div className="param-grid">
  <Num label="Fixed tone (Hz)" k="fixedHz" min={80} max={1200} step={1} {...p}/>
  <Sel label="Fixed tone timbre" k="fixedTimbre" options={[['oboe-like','Oboe-like (Classic)'],['triangle','Triangle'],['sine','Sine']]} {...p}/>
  <Num label="Glide low (Hz)" k="lowHz" min={40} max={4000} step={1} {...p}/>
  <Num label="Glide high (Hz)" k="highHz" min={80} max={8000} step={1} {...p}/>
  <Num label="Up-and-down cycle (seconds)" k="cycleSeconds" min={.5} max={20} step={.1} {...p}/>
  <Num label="Speaker swap interval (seconds)" k="swapSeconds" min={.05} max={2} step={.001} {...p}/>
  <Chk label="Swap left/right channels" k="channelSwap" {...p}/></div>}
function Responses({report}:PanelProps){const [t,setT]=useState('');return <section className="reports phantom-reports"><h2>Your perception</h2><p>Describe the apparent path of the moving glissando. There is no correct answer; room acoustics and listeners can change the percept.</p>
  <textarea aria-label="Glissando perceived trajectory" value={t} onChange={e=>setT(e.target.value)} placeholder="For example: rises toward the right and falls toward the left"/><button onClick={()=>report({trajectory:t})}>Save trajectory report</button></section>}
export const glissandoPanels:ExperimentPanels={Controls,Responses};
