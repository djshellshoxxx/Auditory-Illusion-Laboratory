import {useEffect,useMemo,useState} from 'react';
import {experiments} from '../experiments/catalog.js';
import {startExperiment,stopExperiment} from '../experiments/runtime';
import {audioEngine} from '../audio/AudioEngine';
import {PerceptionStore} from '../perception/store';
import type {PlaybackMode} from '../types';
import type {ExperimentSession} from '../experiments/session';
import {SignalCanvas} from './SignalCanvas';
import {EventLanes} from './EventLanes';
import {experimentPanels} from './panels';
import type {PanelProps,Params} from './panels/types';

function ParamEditor({params,setParams}:{params:Params;setParams:(p:Params)=>void}){
  return <div className="param-grid">{Object.entries(params).map(([k,v])=>typeof v==='number'?<label key={k}><span>{k}</span><input type="number" step="any" value={v} onChange={e=>setParams({...params,[k]:+e.target.value})}/></label>:typeof v==='string'?<label key={k}><span>{k}</span><input value={v} onChange={e=>setParams({...params,[k]:e.target.value})}/></label>:typeof v==='boolean'?<label key={k}><span>{k}</span><input type="checkbox" checked={v} onChange={e=>setParams({...params,[k]:e.target.checked})}/></label>:null)}</div>;
}
function GenericResponses({report}:PanelProps){
  return <section className="reports"><button onClick={()=>report('rising')}>Rising</button><button onClick={()=>report('falling')}>Falling</button><button onClick={()=>report('ambiguous')}>Ambiguous</button><button onClick={()=>report('one-stream')}>One stream</button><button onClick={()=>report('two-streams')}>Two streams</button><button onClick={()=>report('tone-heard')}>Tone heard</button></section>;
}

export function LabPage(){
  const [id,setId]=useState(experiments[0].id),[mode,setMode]=useState<PlaybackMode>('classic'),[running,setRunning]=useState(false),[msg,setMsg]=useState('Audio idle'),[session,setSession]=useState<ExperimentSession|null>(null);
  const exp:any=useMemo(()=>experiments.find(e=>e.id===id)!,[id]);
  const [params,setParams]=useState<Params>({...exp.classicParams});
  const panels=experimentPanels[id]??{};
  useEffect(()=>audioEngine.registerPanicListener(()=>{setRunning(false);setSession(null);setMsg('Panic stop: audio halted')}),[]);
  const select=(x:string)=>{stopExperiment();setRunning(false);setSession(null);setId(x);const e:any=experiments.find(q=>q.id===x)!;setParams({...e.classicParams});setMsg('Audio idle')};
  const play=async(override?:Params)=>{try{const s=await startExperiment(id,override?{...params,...override}:params,setMsg);setSession(s??{startedAt:performance.now()});setRunning(true);if(id!=='zwicker')setMsg('Playing')}catch(e){setMsg((e as Error).message)}};
  const start=()=>play();
  const stop=()=>{stopExperiment();setRunning(false);setMsg('Stopped')};
  const report=(response:unknown)=>{PerceptionStore.record({experimentId:id,timestamp:Date.now(),mode,params,response});setMsg('Perception report recorded locally')};
  const exportData=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([PerceptionStore.exportJson()],{type:'application/json'}));a.download='auditory-perception-records.json';a.click()};
  const props:PanelProps={id,exp,params,setParams,report,setMsg,running,mode,session,play};
  const Controls=panels.Controls,Analysis=panels.Analysis,Responses=panels.Responses??GenericResponses;
  const hasLanes=Boolean(session?.events?.length||session?.phases?.length);

  return <div className="lab-layout">
    <aside className="browser"><h2>Experiments</h2>{[...new Set(experiments.map(e=>e.category))].map(cat=><section key={cat}><h3>{cat}</h3>{experiments.filter(e=>e.category===cat).map(e=><button className={id===e.id?'active':''} onClick={()=>select(e.id)} key={e.id}>{e.name}</button>)}</section>)}</aside>
    <main className="workspace">
      <div className="workspace-head"><div><span className="eyebrow">{exp.category}</span><h1>{exp.name}</h1><p>{exp.summary}</p></div><span className="guidance">Output: {exp.outputGuidance}</span></div>
      {exp.description&&<section className="analysis experiment-guide"><h2>About this illusion</h2><p>{exp.description}</p><h3>How to listen</h3><p>{exp.howToUse}</p><h3>What to listen for</h3><p>{exp.whatToListenFor}</p></section>}
      <section className="visualizer" aria-label="signal visualization"><div className="scope-grid"/>{hasLanes?<EventLanes session={session} running={running}/>:<><SignalCanvas/><div className="signal-orbit"/></>}<div className="legend"><span>{hasLanes?'PHYSICAL L/R EVENTS':'GENERATED / MEASURED SIGNAL'}</span>{id==='combination-tones'&&<span className="predicted">PREDICTED AUDITORY PRODUCTS</span>}<span className="percept">YOUR PERCEPTION</span></div></section>
      {hasLanes&&<section className="visualizer measured" aria-label="measured output spectrum"><div className="scope-grid"/><SignalCanvas/><div className="legend"><span>MEASURED OUTPUT SPECTRUM</span></div></section>}
      {Analysis&&<Analysis key={id} {...props}/>}
      <Responses key={`r-${id}`} {...props}/>
      <section className="references"><h3>Research references</h3>{exp.references.map((r:any)=><a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.label}</a>)}</section>
    </main>
    <aside className="params"><div className="mode-switch"><button className={mode==='classic'?'active':''} onClick={()=>{setMode('classic');setParams({...exp.classicParams})}}>CLASSIC</button><button className={mode==='lab'?'active':''} onClick={()=>setMode('lab')}>LAB</button></div><h2>Parameters</h2>{mode==='classic'?<pre>{JSON.stringify(params,null,2)}</pre>:Controls?<Controls key={id} {...props}/>:<ParamEditor params={params} setParams={setParams}/>}<button onClick={()=>setParams({...exp.classicParams})}>Reset reference</button><hr/><h3>Perception data</h3><button onClick={exportData}>Export JSON</button><button onClick={()=>{PerceptionStore.clear();setMsg('Local perception data cleared')}}>Clear local data</button><div className="status">{msg}</div></aside>
    <footer className="transport"><button className="play" disabled={running} onClick={start}>Start</button><button disabled={!running} onClick={stop}>Stop</button></footer>
  </div>;
}
