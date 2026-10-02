import {useState} from 'react';
import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
import {MELODIES,mysteriousMelodyNotes,parseMelody,normalizeMysteriousMelodyParams} from '../../experiments/mysteriousMelody.js';
function Controls(p:PanelProps){const {params,setParams}=p;return <div className="param-grid">
  <Sel label="Melody" k="melody" options={[...Object.entries(MELODIES).map(([k,v])=>[k,(v as any).name] as [string,string]),['user','Your own (below)']]} {...p}/>
  <label><span>Your melody (e.g. C4:1 D4:0.5)</span><input aria-label="User melody" value={params.userMelody??''} onChange={e=>setParams({...params,userMelody:e.target.value})}/></label>
  {params.melody==='user'&&parseMelody(params.userMelody)===null&&<small>Could not parse; falling back to Yankee Doodle.</small>}
  <Sel label="Condition" k="condition" options={[['scrambled','Scrambled across octaves'],['original','Original register (reveal)']]} {...p}/>
  <Num label="Scramble seed" k="seed" min={1} max={999999} step={1} {...p}/>
  <Num label="Octave span (2 or 3)" k="octaveSpan" min={2} max={3} step={1} {...p}/>
  <Num label="Tempo (BPM)" k="tempoBpm" min={40} max={240} step={1} {...p}/>
  <small>Classic: Yankee Doodle, three octaves, seed 1, 120 BPM. The same seed always gives the same scramble.</small></div>}
function Analysis({params}:PanelProps){const p=normalizeMysteriousMelodyParams(params),n=mysteriousMelodyNotes(params);return <section className="analysis"><h3>Octave assignment ({p.condition})</h3><p>{n.map((x:any)=>x.octaveShift>0?'↑':x.octaveShift<0?'↓':'·').join(' ')}</p><small>↑ one octave up, ↓ one octave down, · original octave. Pitch classes and rhythm are identical to the source melody; the melody name is deliberately not shown until you reveal it.</small></section>}
function Responses({report,play,params}:PanelProps){const [guess,setGuess]=useState(''),[revealed,setRevealed]=useState(false);const p=normalizeMysteriousMelodyParams(params);const name=p.melody==='user'?'your melody':(MELODIES as any)[p.melody].name;
  return <section className="reports phantom-reports"><h2>Your perception</h2><p>Play the scrambled version and try to name the tune. Then reveal it in its normal register and replay the identical scramble: most people can now hear the tune in it.</p>
    <button onClick={()=>void play({condition:'scrambled'})}>Play scrambled</button><button onClick={()=>{setRevealed(true);void play({condition:'original'})}}>Reveal: play original register</button><button onClick={()=>void play({condition:'scrambled'})}>Replay the same scrambled version</button>
    {revealed&&<p>The melody is <strong>{name}</strong>.</p>}
    <label>Your guess<input aria-label="Melody guess" value={guess} onChange={e=>setGuess(e.target.value)} placeholder="What tune is it?"/></label>
    <button onClick={()=>report({condition:p.condition,recognized:true,guess,afterReveal:revealed})}>Recognized</button><button onClick={()=>report({condition:p.condition,recognized:false,guess,afterReveal:revealed})}>Not recognized</button></section>}
export const mysteriousMelodyPanels:ExperimentPanels={Controls,Analysis,Responses};
