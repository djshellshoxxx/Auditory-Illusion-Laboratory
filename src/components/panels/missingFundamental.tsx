import {useState} from 'react';
import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
import {buildMissingFundamentalComponents} from '../../experiments/missingFundamental.js';
function Controls(p:PanelProps){return <div className="param-grid missing-fundamental-controls">
  <Num label="Fundamental reference (Hz)" k="f0" min={40} max={2000} step={1} {...p}/>
  <Num label="First generated harmonic" k="firstHarmonic" min={2} max={16} step={1} {...p}/>
  <Num label="Last generated harmonic" k="lastHarmonic" min={2} max={24} step={1} {...p}/>
  <Num label="Amplitude rolloff (dB/octave)" k="amplitudeRolloffDbPerOctave" min={0} max={18} step={.5} {...p}/>
  <Sel label="Phase mode" k="phaseMode" options={[['sine','Aligned sine'],['alternating','Alternating 0 / π'],['random','Deterministic random']]} {...p}/>
  <small>The reference f0 is never synthesized. Changing phase alters waveform shape while preserving the harmonic frequencies.</small></div>}
function Analysis({params}:PanelProps){const harms=buildMissingFundamentalComponents(params);return <section className="analysis"><h3>Generated harmonics</h3><p><strong>Missing f0: {params.f0} Hz</strong> · no oscillator is generated at this frequency.</p><p>{harms.map((h:any)=>`${h.harmonic}× ${h.frequencyHz.toFixed(1)} Hz`).join(' · ')}</p><small>The listed components are the physical oscillator frequencies. The missing f0 is shown separately as a perceptual reference.</small></section>}
function Responses({report}:PanelProps){const [pitch,setPitch]=useState('');return <section className="reports phantom-reports"><h2>Your perception</h2><p>Enter the pitch of the combined sound as you perceive it. The displayed f0 is a reference, not a scored answer.</p>
  <label>Perceived pitch<input aria-label="Missing Fundamental perceived pitch (Hz)" type="number" min="20" max="16000" step="1" value={pitch} onChange={e=>setPitch(e.target.value)} placeholder="Hz"/></label>
  <button disabled={!pitch} onClick={()=>report({perceivedPitchHz:+pitch})}>Save perceived pitch</button></section>}
export const missingFundamentalPanels:ExperimentPanels={Controls,Analysis,Responses};
