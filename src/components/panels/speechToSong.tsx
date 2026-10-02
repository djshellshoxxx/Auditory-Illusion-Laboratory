import {useRef,useState} from 'react';
import type {ExperimentPanels,PanelProps} from './types';
// Interim panel: preserved from v1 while the engine-routed repetition runtime is built.
function Analysis({setMsg}:PanelProps){
  const rec=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]),[url,setUrl]=useState('');
  const record=async()=>{try{const s=await navigator.mediaDevices.getUserMedia({audio:true});chunks.current=[];rec.current=new MediaRecorder(s);rec.current.ondataavailable=e=>chunks.current.push(e.data);rec.current.onstop=()=>{const b=new Blob(chunks.current,{type:'audio/webm'});setUrl(URL.createObjectURL(b));s.getTracks().forEach(t=>t.stop());setMsg('Phrase recorded; replay is unchanged audio')};rec.current.start();setMsg('Recording…')}catch{setMsg('Microphone permission unavailable; other experiments still work')}};
  return <section className="analysis"><button onClick={record}>Record phrase</button><button disabled={!rec.current} onClick={()=>rec.current?.stop()}>Stop recording</button><button disabled={!url} onClick={()=>{const a=new Audio(url);a.loop=true;a.play();setTimeout(()=>{a.pause();a.loop=false},12000)}}>Repeat unchanged phrase</button></section>;
}
export const speechToSongPanels:ExperimentPanels={Analysis};
