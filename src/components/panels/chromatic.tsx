import {useState} from 'react';
import {Num,Sel,Chk,type ExperimentPanels,type PanelProps} from './types';
import {chromaticDichoticEvents,chromaticMidi} from '../../experiments/chromatic.js';
const NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];const nm=(m:number)=>`${NAMES[m%12]}${Math.floor(m/12)-1}`;
function Controls(p:PanelProps){return <div className="param-grid">
  <Sel label="Span" k="spanOctaves" options={[['2','Two octaves (Classic)'],['1','One octave']]} {...p}/>
  <Num label="Transpose (semitones)" k="transposeSemitones" min={-24} max={24} step={1} {...p}/>
  <Num label="Position duration (seconds)" k="positionSeconds" min={.08} max={1} step={.01} {...p}/>
  <Chk label="Swap left/right channels" k="channelSwap" {...p}/>
  <small>Classic: C4–C6 chromatic, 250 ms per position, ascending tone starts in the right ear.</small></div>}
function Analysis({params}:PanelProps){const ev=chromaticDichoticEvents(params),n=chromaticMidi(params).length;const ear=(c:string)=>ev.filter((e:any)=>e.channel===c&&e.position<n).sort((a:any,b:any)=>a.position-b.position).map((e:any)=>nm(e.midi)).join(' ');return <section className="analysis"><h3>Physical ear sequences (first cycle)</h3><p>Left ear: {ear('left')}</p><p>Right ear: {ear('right')}</p><small>Each ear leaps by up to two octaves on consecutive tones. The two smooth converging and diverging lines that most listeners hear are a perceptual regrouping by pitch proximity.</small></section>}
const sides:[string,string][]=[['right','Right'],['left','Left'],['center','Centre / both'],['unsure','Unsure']];
function Responses({report}:PanelProps){const [hi,setHi]=useState('right'),[lo,setLo]=useState('left'),[n,setN]=useState('2'),[d,setD]=useState('');return <section className="reports phantom-reports"><h2>Your perception</h2><p>Report where the higher line and the lower line seem to come from and how many streams you hear.</p>
  <label>Higher line side<select aria-label="Chromatic higher stream side" value={hi} onChange={e=>setHi(e.target.value)}>{sides.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <label>Lower line side<select aria-label="Chromatic lower stream side" value={lo} onChange={e=>setLo(e.target.value)}>{sides.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <label>Number of streams<select aria-label="Chromatic stream count" value={n} onChange={e=>setN(e.target.value)}><option value="1">One</option><option value="2">Two</option><option value="3+">Three or more</option><option value="unsure">Unsure</option></select></label>
  <label>Description<textarea aria-label="Chromatic illusion description" value={d} onChange={e=>setD(e.target.value)} placeholder="For example: two smooth lines that converge in the middle and separate again"/></label>
  <button onClick={()=>report({higherSide:hi,lowerSide:lo,streams:n,description:d})}>Save perception report</button></section>}
export const chromaticPanels:ExperimentPanels={Controls,Analysis,Responses};
