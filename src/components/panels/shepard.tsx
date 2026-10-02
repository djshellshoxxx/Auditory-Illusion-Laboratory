import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
import {shepardSequence,PITCH_CLASSES} from '../../experiments/shepard.js';
function Controls(p:PanelProps){return <div className="param-grid">
  <Sel label="Start pitch class" k="startPitchClass" options={PITCH_CLASSES.map((n,i)=>[String(i),n] as [string,string])} {...p}/>
  <Sel label="Direction" k="direction" options={[['1','Ascending'],['-1','Descending']]} {...p}/>
  <Num label="Step size (semitones)" k="stepSemitones" min={1} max={6} step={1} {...p}/>
  <Num label="Step duration (seconds)" k="stepSeconds" min={.1} max={2} step={.05} {...p}/>
  <Num label="Octave components" k="components" min={6} max={10} step={1} {...p}/>
  <Num label="Envelope center (Hz)" k="envelopeCenterHz" min={200} max={4000} step={10} {...p}/>
  <Num label="Envelope width (octaves)" k="envelopeWidthOctaves" min={.5} max={3} step={.05} {...p}/>
  <Sel label="Waveform" k="waveform" options={[['sine','Sine (Classic)'],['triangle','Triangle (exploratory)']]} {...p}/>
  <Num label="Detune (cents)" k="detuneCents" min={-50} max={50} step={1} {...p}/>
  <small>Classic: 12 semitone steps of 500 ms, 10 octave components, fixed Gaussian envelope centred at 1 kHz.</small></div>}
function Analysis({params}:PanelProps){const seq=shepardSequence(params);const first=seq[0];return <section className="analysis"><h3>Generated components of step 1 ({first.name})</h3><p>{first.components.map((c:any)=>`${c.frequencyHz<1000?c.frequencyHz.toFixed(1):(c.frequencyHz/1000).toFixed(2)+'k'} Hz ×${c.gain.toFixed(3)}`).join(' · ')}</p><p>Sequence: {seq.map((s:any)=>s.name).join(' → ')} → (repeat)</p><small>Every tone is exact octaves under one fixed envelope. At the wrap only a near-silent component re-enters at the bottom, so the step from the last tone back to the first is physically the same size as every other step.</small></section>}
function Responses({report}:PanelProps){return <section className="reports phantom-reports"><h2>Your perception</h2><p>Does the sequence seem to keep rising forever, keep falling, or neither?</p><button onClick={()=>report('rising')}>Rising endlessly</button><button onClick={()=>report('falling')}>Falling endlessly</button><button onClick={()=>report('ambiguous')}>Ambiguous / resets</button></section>}
export const shepardPanels:ExperimentPanels={Controls,Analysis,Responses};
