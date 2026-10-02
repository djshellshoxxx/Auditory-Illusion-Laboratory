import {useState} from 'react';
import {Num,Chk,type ExperimentPanels,type PanelProps} from './types';
import {cambiataEarSequences,parseNoteNames,midiName} from '../../experiments/cambiata.js';
function Controls(p:PanelProps){const {params,setParams}=p;const bad=(k:string)=>parseNoteNames(params[k])===null;return <div className="param-grid">
  <label><span>Higher figure (note names)</span><input aria-label="Higher cambiata figure" value={params.higherFigure??''} onChange={e=>setParams({...params,higherFigure:e.target.value})}/></label>
  {bad('higherFigure')&&<small>Could not parse; use names like G5 E5 F5 (Classic figure will be used).</small>}
  <label><span>Lower figure (note names)</span><input aria-label="Lower cambiata figure" value={params.lowerFigure??''} onChange={e=>setParams({...params,lowerFigure:e.target.value})}/></label>
  {bad('lowerFigure')&&<small>Could not parse; use names like D4 B3 C4.</small>}
  <Num label="Transpose (semitones)" k="transposeSemitones" min={-24} max={24} step={1} {...p}/>
  <Num label="Position duration (seconds)" k="positionSeconds" min={.08} max={1} step={.01} {...p}/>
  <Chk label="Swap left/right channels" k="channelSwap" {...p}/>
  <small>If you have the official recording, enter its two three-note figures here to match it exactly.</small></div>}
function Analysis({params}:PanelProps){const s=cambiataEarSequences(params);return <>
  <section className="analysis"><h3>Physical ear sequences (one cycle)</h3><p>Left ear: {s.left.map(midiName).join(' ')}</p><p>Right ear: {s.right.map(midiName).join(' ')}</p><small>Each ear leaps between registers on every tone. The two close-pitched three-note figures many listeners hear are a perceptual regrouping.</small></section>
  <section className="analysis"><h3>Fixture status</h3><p>This pattern is a structural reconstruction built from Deutsch’s published description (two interleaved three-tone cambiata figures with alternating ears). It is not an audio-verified transcription of the 2003 recording; use Lab mode to enter the official figures if you have them.</p></section></>}
const sides:[string,string][]=[['right','Right'],['left','Left'],['center','Centre / both'],['unsure','Unsure']];
function Responses({report}:PanelProps){const [n,setN]=useState('2'),[hi,setHi]=useState('right'),[lo,setLo]=useState('left'),[d,setD]=useState('');return <section className="reports phantom-reports"><h2>Your perception</h2><p>How many repeating melodies do you hear, and where does each seem to come from?</p>
  <label>Number of streams<select aria-label="Cambiata stream count" value={n} onChange={e=>setN(e.target.value)}><option value="1">One</option><option value="2">Two</option><option value="3">Three</option><option value="unsure">Unsure</option></select></label>
  <label>Higher figure side<select aria-label="Cambiata higher stream side" value={hi} onChange={e=>setHi(e.target.value)}>{sides.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <label>Lower figure side<select aria-label="Cambiata lower stream side" value={lo} onChange={e=>setLo(e.target.value)}>{sides.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <label>Description<textarea aria-label="Cambiata description" value={d} onChange={e=>setD(e.target.value)} placeholder="For example: a high three-note figure repeating on the right, a low one on the left"/></label>
  <button onClick={()=>report({streams:n,higherSide:hi,lowerSide:lo,description:d})}>Save perception report</button></section>}
export const cambiataPanels:ExperimentPanels={Controls,Analysis,Responses};
