import {useState} from 'react';
import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
import {buildCombinationToneStimulus} from '../../experiments/combinationTones.js';
function Controls(p:PanelProps){return <div className="param-grid combination-tone-controls">
  <Num label="Primary f1 (Hz)" k="f1" min={80} max={10000} step={1} {...p}/>
  <Num label="Primary f2 (Hz)" k="f2" min={80} max={12000} step={1} {...p}/>
  <Num label="Primary level" k="level" min={.01} max={.18} step={.01} {...p}/>
  <label><span>Primary balance (f1 ← 0 → f2)</span><input aria-label="Primary balance" type="number" min="-1" max="1" step="0.05" value={p.params.balance??0} onChange={e=>p.setParams({...p.params,balance:+e.target.value})}/></label>
  <Sel label="Waveform" k="waveform" options={[['sine','Sine (clean reference)'],['triangle','Triangle'],['square','Square'],['sawtooth','Sawtooth']]} {...p}/>
  {p.params.waveform!=='sine'&&<small>Exploratory warning: non-sine sources contain ordinary source harmonics. Those harmonics can overlap predicted combination products, so this is not a clean Classic demonstration.</small>}</div>}
function Analysis({params}:PanelProps){const s=buildCombinationToneStimulus(params),products=s.predictedProducts;return <>
  <section className="analysis"><h3>Generated digital primaries</h3><p>{s.voices.map((v:any)=>`${v.id}: ${v.frequencyHz.toFixed(1)} Hz`).join(' · ')}</p><small>Only these two oscillator frequencies are intentionally generated in Classic mode.</small></section>
  <section className="analysis"><h3>Predicted auditory products</h3><p>Difference: {products.differenceHz.toFixed(1)} Hz · 2f1−f2: {products.twoF1MinusF2Hz.toFixed(1)} Hz · 2f2−f1: {products.twoF2MinusF1Hz.toFixed(1)} Hz</p><small>These are mathematical predictions and are not intentionally synthesized in Classic mode.</small></section></>}
function Responses({report}:PanelProps){const [pitch,setPitch]=useState(''),[desc,setDesc]=useState('');return <section className="reports phantom-reports"><h2>Your perception</h2><p>Report an additional pitch only if you actually hear one. The predicted frequencies are not scored answers.</p>
  <label>Estimated additional pitch<input aria-label="Combination tone perceived pitch (Hz)" type="number" min="20" max="16000" step="1" value={pitch} onChange={e=>setPitch(e.target.value)} placeholder="Hz (optional)"/></label>
  <label>Description<textarea aria-label="Combination tone description" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe any additional pitch, beating, or uncertainty"/></label>
  <button onClick={()=>report({heard:true,estimatedPitchHz:pitch?+pitch:null,description:desc})}>Heard an additional tone</button><button onClick={()=>report({heard:false,estimatedPitchHz:null,description:desc})}>No clear additional tone</button></section>}
export const combinationTonesPanels:ExperimentPanels={Controls,Analysis,Responses};
