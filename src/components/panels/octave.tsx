import {useState} from 'react';
import {Num,Chk,type ExperimentPanels,type PanelProps} from './types';
import {octaveStates,normalizeOctaveParams} from '../../experiments/octave.js';
function Controls(p:PanelProps){return <div className="param-grid">
  <Num label="Low tone (Hz)" k="lowHz" min={100} max={4000} step={1} {...p}/>
  <Num label="High tone (Hz)" k="highHz" min={100} max={8000} step={1} {...p}/>
  <Num label="State duration (seconds)" k="stateSeconds" min={.05} max={2} step={.01} {...p}/>
  <Num label="Interaural level difference (dB, + = left louder)" k="levelDifferenceDb" min={-12} max={12} step={.5} {...p}/>
  <Chk label="Swap left/right channels" k="channelSwap" {...p}/>
  <small>Classic: 400/800 Hz, 250 ms per state, equal level. Lab changes are exploratory and the stimulus is re-rendered sample-accurately each Start.</small></div>}
function Analysis({params}:PanelProps){const p=normalizeOctaveParams(params),s=octaveStates(p);return <section className="analysis"><h3>Physical stimulus</h3><p>{s.map((x,i)=>`State ${i+1} (${(p.stateSeconds*1000).toFixed(0)} ms): left ${x.left.toFixed(0)} Hz · right ${x.right.toFixed(0)} Hz`).join('  →  ')}</p><small>Both ears always receive one tone; there is no silence between states. Each ear alternates between the two frequencies while the two ears stay complementary.</small></section>}
const sides:[string,string][]=[['left','Left ear'],['right','Right ear'],['center','Centre / both'],['alternating','Alternating sides'],['unsure','Unsure']];
function Responses({report}:PanelProps){const [high,setHigh]=useState('right'),[low,setLow]=useState('left'),[desc,setDesc]=useState('');return <section className="reports phantom-reports"><h2>Your perception</h2><p>Many listeners hear a single high tone in one ear alternating with a single low tone in the other, even though each ear physically receives both frequencies. Report what you hear; nothing is scored.</p>
  <label>Where is the high tone heard?<select aria-label="Octave perceived high side" value={high} onChange={e=>setHigh(e.target.value)}>{sides.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <label>Where is the low tone heard?<select aria-label="Octave perceived low side" value={low} onChange={e=>setLow(e.target.value)}>{sides.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <label>Pattern description<textarea aria-label="Octave pattern description" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="For example: high tone right, low tone left, alternating; or a single tone jumping between ears"/></label>
  <button onClick={()=>report({highSide:high,lowSide:low,description:desc})}>Save perception report</button></section>}
export const octavePanels:ExperimentPanels={Controls,Analysis,Responses};
