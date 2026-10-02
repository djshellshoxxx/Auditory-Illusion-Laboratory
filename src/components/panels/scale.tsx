import {useState} from 'react';
import {Num,Sel,Chk,type ExperimentPanels,type PanelProps} from './types';
import {scaleDichoticEvents} from '../../experiments/scale.js';
function Controls(p:PanelProps){return <div className="param-grid">
  <Sel label="Tuning" k="tuning" options={[['historical','Historical (Deutsch 1975 Hz)'],['equal','Equal-tempered C major']]} {...p}/>
  <Num label="Transpose (semitones)" k="transposeSemitones" min={-24} max={24} step={1} {...p}/>
  <Num label="Position duration (seconds)" k="positionSeconds" min={.08} max={1} step={.01} {...p}/>
  <Chk label="Swap left/right channels" k="channelSwap" {...p}/>
  <small>Classic: historical frequencies, 250 ms per position, ascending tone starts in the right ear.</small></div>}
function Analysis({params}:PanelProps){const ev=scaleDichoticEvents(params);const ear=(c:string)=>ev.filter((e:any)=>e.channel===c).sort((a:any,b:any)=>a.position-b.position).map((e:any)=>Math.round(e.frequencyHz)).join(' ');return <section className="analysis"><h3>Physical ear sequences (one cycle)</h3><p>Left ear: {ear('left')}</p><p>Right ear: {ear('right')}</p><small>Each ear physically leaps up and down. The smooth higher and lower lines many people hear are a perceptual regrouping, not what either ear receives.</small></section>}
const sides:[string,string][]=[['right','Right'],['left','Left'],['center','Centre / both'],['unsure','Unsure']];
function Responses({report}:PanelProps){const [hi,setHi]=useState('right'),[lo,setLo]=useState('left'),[n,setN]=useState('2'),[d,setD]=useState('');return <section className="reports phantom-reports"><h2>Your perception</h2><p>Report where the higher melody and the lower melody seem to come from, and how many separate streams you hear.</p>
  <label>Higher melody side<select aria-label="Scale higher stream side" value={hi} onChange={e=>setHi(e.target.value)}>{sides.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <label>Lower melody side<select aria-label="Scale lower stream side" value={lo} onChange={e=>setLo(e.target.value)}>{sides.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <label>Number of streams<select aria-label="Scale stream count" value={n} onChange={e=>setN(e.target.value)}><option value="1">One</option><option value="2">Two</option><option value="3+">Three or more</option><option value="unsure">Unsure</option></select></label>
  <label>Description<textarea aria-label="Scale illusion description" value={d} onChange={e=>setD(e.target.value)} placeholder="For example: a smooth line going down then up on the right, another going up then down on the left"/></label>
  <button onClick={()=>report({higherSide:hi,lowerSide:lo,streams:n,description:d})}>Save perception report</button></section>}
export const scalePanels:ExperimentPanels={Controls,Analysis,Responses};
