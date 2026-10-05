import {useEffect,useRef,useState} from 'react';
import {Num,type ExperimentPanels,type PanelProps} from './types';
import {repetitionSchedule} from '../../experiments/speechToSong.js';
function Controls(p:PanelProps){return <div className="param-grid">
  <Num label="Repetitions" k="repetitions" min={1} max={40} step={1} {...p}/>
  <Num label="Interval between repetitions (seconds)" k="intervalSeconds" min={0} max={2} step={.05} {...p}/>
  <small>Classic: ten identical repetitions with a 0.15 s interval. The recorded buffer is never processed.</small></div>}
function Recorder({params,setParams,setMsg,play,running}:PanelProps){
  const rec=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]),stream=useRef<MediaStream|null>(null),[target,setTarget]=useState<'phrase'|'sentence'|null>(null);
  useEffect(()=>()=>{const r=rec.current;if(r){r.ondataavailable=null;r.onstop=null;if(r.state==='recording'){try{r.stop()}catch{}}}stream.current?.getTracks().forEach(t=>t.stop());stream.current=null},[]);
  const record=async(which:'phrase'|'sentence')=>{if(target!==null)return;try{const s=await navigator.mediaDevices.getUserMedia({audio:true});stream.current=s;chunks.current=[];const r=new MediaRecorder(s);rec.current=r;r.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data)};r.onstop=()=>{const b=new Blob(chunks.current,{type:r.mimeType||'audio/webm'});const url=URL.createObjectURL(b);setParams(c=>({...c,[`${which}Url`]:url}));s.getTracks().forEach(t=>t.stop());stream.current=null;setTarget(null);setMsg(`${which==='phrase'?'Phrase':'Sentence'} recorded (kept in browser memory only)`)};r.start();setTarget(which);setMsg(which==='phrase'?'Recording phrase… say a few words, then stop':'Recording full sentence… then stop')}catch{setMsg('Microphone permission unavailable; other experiments still work')}};
  const stop=()=>{if(rec.current?.state==='recording')rec.current.stop()};
  const sched=repetitionSchedule(1,params);
  return <section className="analysis"><h3>Record (local only)</h3>
    <p><button onClick={()=>void record('phrase')} disabled={target!==null}>Record short phrase</button> <button onClick={()=>void record('sentence')} disabled={target!==null}>Record full sentence (optional)</button> <button onClick={stop} disabled={target===null}>Stop recording</button></p>
    <p>Phrase: {params.phraseUrl?'ready':'not recorded'} · Sentence: {params.sentenceUrl?'ready':'not recorded'}</p>
    <p><button disabled={!params.sentenceUrl||running} onClick={()=>void play({playWhich:'sentence'})}>Play sentence once</button> <small>Then press Start to hear the phrase repeated {sched.length} times unchanged; afterwards play the sentence again and notice whether the phrase now sounds sung.</small></p>
    <small>Recordings are object URLs in this tab’s memory and are never uploaded. Playback goes through the laboratory’s master level, limiter and Panic stop.</small></section>;
}
function Responses({report}:PanelProps){const [n,setN]=useState('');return <section className="reports phantom-reports"><h2>Your perception</h2><p>After the repetitions, did the phrase sound like speech or like singing?</p>
  <label>Repetition where it started to sound like song (optional)<input aria-label="Transition repetition" type="number" min="1" max="40" step="1" value={n} onChange={e=>setN(e.target.value)}/></label>
  <button onClick={()=>report({judgment:'speech',transitionRepetition:n?+n:null})}>Still speech</button><button onClick={()=>report({judgment:'song',transitionRepetition:n?+n:null})}>Song-like</button><button onClick={()=>report({judgment:'mixed',transitionRepetition:n?+n:null})}>Mixed / unsure</button></section>}
export const speechToSongPanels:ExperimentPanels={Controls,Analysis:Recorder,Responses};
