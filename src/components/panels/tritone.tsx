import {useMemo,useState} from 'react';
import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
import {tritoneTrialOrder,tritonePair,tritoneTone,aggregateTritoneResponses,PITCH_CLASSES,DEUTSCH_ENVELOPES,normalizeTritoneParams} from '../../experiments/tritone.js';
import {PerceptionStore} from '../../perception/store';
function Controls(p:PanelProps){return <div className="param-grid">
  <Sel label="Envelope centre (Deutsch)" k="envelopeCenterHz" options={DEUTSCH_ENVELOPES.map(f=>[String(f),`${f} Hz (${f===262?'C4':f===370?'F#4':f===523?'C5':'F#5'})`] as [string,string])} {...p}/>
  <Num label="Envelope centre (free, Hz)" k="envelopeCenterHz" min={150} max={2000} step={1} {...p}/>
  <Num label="Envelope width (octaves)" k="envelopeWidthOctaves" min={.5} max={2.5} step={.05} {...p}/>
  <Num label="Octave components" k="components" min={4} max={8} step={1} {...p}/>
  <Num label="Tone duration (seconds)" k="toneSeconds" min={.2} max={1.5} step={.05} {...p}/>
  <Num label="Onset/offset ramp (seconds)" k="rampSeconds" min={.005} max={.1} step={.005} {...p}/>
  <Num label="Gap between the two tones (seconds)" k="gapSeconds" min={0} max={1} step={.05} {...p}/>
  <Sel label="Trial order" k="order" options={[['shuffled','Seeded shuffle (Classic)'],['sequential','Sequential C…B']]} {...p}/>
  <Num label="Shuffle seed" k="seed" min={1} max={999999} step={1} {...p}/>
  <small>Classic: six octave components under a 370 Hz envelope, 500 ms tones with no gap, all twelve pairs in shuffled order.</small></div>}
function Analysis({params}:PanelProps){const c=tritoneTone(0,params),p=normalizeTritoneParams(params);return <section className="analysis"><h3>Generated components for pitch class C</h3><p>{c.map((x:any)=>`${x.frequencyHz.toFixed(1)} Hz ×${x.gain.toFixed(2)}`).join(' · ')}</p><small>Six exact octaves under a fixed envelope centred at {p.envelopeCenterHz} Hz. The second tone of each pair uses the same envelope with its pitch class shifted by six semitones, so its height is ambiguous.</small></section>}
function Responses({params,report,play,running}:PanelProps){
  const order=useMemo(()=>tritoneTrialOrder(params),[params]);
  const [i,setI]=useState(0),[tick,setTick]=useState(0);
  const first=order[i%12],[a,b]=tritonePair(first);
  const map=useMemo(()=>aggregateTritoneResponses(PerceptionStore.list().filter(r=>r.experimentId==='tritone')),[tick]);
  const judge=(judgment:string)=>{report({firstPitchClass:a,secondPitchClass:b,judgment,envelopeCenterHz:normalizeTritoneParams(params).envelopeCenterHz});const next=i+1;setI(next);setTick(t=>t+1);if(next%12!==0)void play({firstPitchClass:order[next%12]})};
  return <section className="reports phantom-reports"><h2>Your perception</h2>
    <p>Trial {i%12+1} of 12 · pair {PITCH_CLASSES[a]} → {PITCH_CLASSES[b]}. Play the pair, then say whether the second tone sounded higher or lower. No answer is right or wrong; the point is your personal map.</p>
    <button onClick={()=>void play({firstPitchClass:a})}>{running?'Play pair again':'Play pair'}</button>
    <button onClick={()=>judge('up')}>Up (second tone higher)</button><button onClick={()=>judge('down')}>Down (second tone lower)</button><button onClick={()=>judge('ambiguous')}>Ambiguous</button>
    <button onClick={()=>setI(0)}>Restart run</button>
    <h3>Your local pitch-class map</h3>
    <div className="report-map" aria-label="Tritone paradox response map">{map.map(c=><div key={c.pitchClass}><strong>{c.name}</strong><br/>↑{c.up} ↓{c.down} ?{c.ambiguous}</div>)}</div>
    <small>Counts of your Up/Down/Ambiguous judgments by the first tone's pitch class, from reports stored in this browser. Deutsch found each listener has a characteristic peak region where pairs tend to be heard as descending.</small></section>;
}
export const tritonePanels:ExperimentPanels={Controls,Analysis,Responses};
