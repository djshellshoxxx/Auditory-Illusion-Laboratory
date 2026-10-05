import {useEffect,useRef,useState} from 'react';
import type {ExperimentPanels,PanelProps} from './types';

function Controls({params,setParams,setMsg,exp}:PanelProps){
  const rec=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]),stream=useRef<MediaStream|null>(null),target=useRef<'A'|'B'|null>(null);
  const [recording,setRecording]=useState(false);
  useEffect(()=>()=>{const r=rec.current;if(r){r.ondataavailable=null;r.onstop=null;if(r.state==='recording'){try{r.stop()}catch{}}}stream.current?.getTracks().forEach(x=>x.stop());stream.current=null;target.current=null},[]);
  const setTokenFile=(which:'A'|'B',file?:File)=>{if(!file)return;const url=URL.createObjectURL(file);setParams({...params,[`token${which}Url`]:url,[`token${which}Label`]:file.name});setMsg(`Token ${which} loaded from ${file.name}`)};
  const recordToken=async(which:'A'|'B')=>{if(recording)return;try{const s=await navigator.mediaDevices.getUserMedia({audio:true});stream.current=s;target.current=which;chunks.current=[];const r=new MediaRecorder(s);rec.current=r;r.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data)};r.onstop=()=>{const t=target.current;if(t){const blob=new Blob(chunks.current,{type:r.mimeType||'audio/webm'});const url=URL.createObjectURL(blob);setParams(c=>({...c,[`token${t}Url`]:url,[`token${t}Label`]:`recorded token ${t}`}));setMsg(`Recorded token ${t}`)}stream.current?.getTracks().forEach(x=>x.stop());stream.current=null;target.current=null;setRecording(false)};r.start();setRecording(true);setMsg(`Recording token ${which}… say one short word or syllable`)}catch{setMsg('Microphone permission unavailable')}};
  return <div className="param-grid phantom-controls">
    <label><span>Token A name</span><input value={params.tokenALabel??'no'} onChange={e=>setParams({...params,tokenALabel:e.target.value})}/></label>
    <label><span>Token A audio</span><input aria-label="Token A audio" type="file" accept="audio/*" onChange={e=>setTokenFile('A',e.target.files?.[0])}/></label>
    <button type="button" disabled={recording} onClick={()=>void recordToken('A')}>Record token A</button>
    <label><span>Token B name</span><input value={params.tokenBLabel??'way'} onChange={e=>setParams({...params,tokenBLabel:e.target.value})}/></label>
    <label><span>Token B audio</span><input aria-label="Token B audio" type="file" accept="audio/*" onChange={e=>setTokenFile('B',e.target.files?.[0])}/></label>
    <button type="button" disabled={recording} onClick={()=>void recordToken('B')}>Record token B</button>
    <button type="button" disabled={!recording} onClick={()=>{if(rec.current?.state==='recording')rec.current.stop()}}>Stop token recording</button>
    <label><span>Token period (seconds)</span><input type="number" min="0.15" max="2" step="0.01" value={params.tokenPeriod??.4} onChange={e=>setParams({...params,tokenPeriod:+e.target.value})}/></label>
    <label><span>Stereo track offset (seconds)</span><input type="number" min="0" max="4" step="0.01" value={params.offset??params.tokenPeriod??.4} onChange={e=>setParams({...params,offset:+e.target.value})}/></label>
    <label><span>Repeat cycles</span><input type="number" min="2" max="80" step="1" value={params.repetitions??24} onChange={e=>setParams({...params,repetitions:+e.target.value})}/></label>
    <label><input type="checkbox" checked={Boolean(params.channelSwap)} onChange={e=>setParams({...params,channelSwap:e.target.checked})}/> Swap left/right channels</label>
    <button type="button" onClick={()=>setParams({...exp.classicParams})}>Use built-in NO / WAY tokens</button>
    <small>For the classic relationship, keep the stereo offset equal to one token period. Uploaded or recorded tokens remain local to this browser session.</small>
  </div>;
}
function Responses({report}:PanelProps){
  const [left,setLeft]=useState(''),[right,setRight]=useState(''),[center,setCenter]=useState('');
  return <section className="reports phantom-reports"><h2>Your perception</h2><p>Write what you actually hear. These reports are stored only in local browser data.</p>
    <label>Left side<textarea aria-label="Left-side words or phrases" value={left} onChange={e=>setLeft(e.target.value)} placeholder="Words or phrases that seem to come from the left"/></label>
    <label>Right side<textarea aria-label="Right-side words or phrases" value={right} onChange={e=>setRight(e.target.value)} placeholder="Words or phrases that seem to come from the right"/></label>
    <label>Center / other<textarea aria-label="Center words or phrases" value={center} onChange={e=>setCenter(e.target.value)} placeholder="Any center stream, other words, accents or sounds"/></label>
    <button onClick={()=>report({left,right,center})}>Save perception report</button></section>;
}
export const phantomWordsPanels:ExperimentPanels={Controls,Responses};
