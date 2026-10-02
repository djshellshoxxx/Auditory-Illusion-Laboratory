import {useEffect,useMemo,useRef,useState} from 'react';
import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
import {normalizeStreamingParams,streamingBoundaryPoints} from '../../experiments/streaming.js';
import {PerceptionStore} from '../../perception/store';
function Controls(p:PanelProps){return <div className="param-grid">
  <Num label="A frequency (Hz)" k="aHz" min={100} max={4000} step={1} {...p}/>
  <Num label="B above A (semitones)" k="separationSemitones" min={0} max={24} step={.5} {...p}/>
  <Num label="Slot duration (ms, onset to onset)" k="slotMs" min={50} max={500} step={5} {...p}/>
  <Num label="Tone duration (ms)" k="toneMs" min={20} max={500} step={5} {...p}/>
  <Sel label="B timbre" k="bTimbre" options={[['sine','Sine (same as A)'],['triangle','Triangle'],['square','Square']]} {...p}/>
  <Num label="Stereo separation (0 = both centred, 1 = A left / B right)" k="stereoSeparation" min={0} max={1} step={.05} {...p}/>
  <Num label="B level relative to A (dB)" k="levelDifferenceDb" min={-20} max={20} step={1} {...p}/>
  <small>Classic: 440 Hz, +6 semitones, 120 ms slots, 50 ms tones, identical timbre and position. Faster rates and wider separations favour two streams.</small></div>}
function Analysis({params}:PanelProps){const n=normalizeStreamingParams(params);return <section className="analysis"><h3>Physical pattern</h3><p>A {n.aHz.toFixed(1)} Hz · B {n.bHz.toFixed(1)} Hz · A · silence — slot {n.slotMs} ms, tone {n.toneMs} ms, cycle {(4*n.slotMs)} ms</p><small>The fourth slot is digitally silent. The pattern is rendered once and looped, so the timing is exact.</small></section>}
function Responses({report,setMsg}:PanelProps){
  const [tick,setTick]=useState(0);const pts=useMemo(()=>streamingBoundaryPoints(PerceptionStore.list().filter(r=>r.experimentId==='streaming')),[tick]);
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{const c=ref.current;if(!c)return;const dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;const x=c.getContext('2d')!;x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);x.strokeStyle='#24304a';x.strokeRect(30,8,w-40,h-30);x.fillStyle='#7386a2';x.font='10px ui-monospace,monospace';x.fillText('slot ms →',w-70,h-6);x.save();x.translate(10,h/2);x.rotate(-Math.PI/2);x.fillText('semitones →',-30,0);x.restore();
    for(const q of pts){const px=30+((q.slotMs-50)/450)*(w-40),py=8+(1-q.separationSemitones/24)*(h-30);x.fillStyle=q.response==='one-stream'?'#5cf7ff':q.response==='two-streams'?'#ff54cf':'#a9ff68';x.beginPath();x.arc(px,py,4,0,Math.PI*2);x.fill()}},[pts]);
  const send=(r:string)=>{report(r);setTick(t=>t+1);setMsg('Report stored; boundary map updated')};
  return <section className="reports phantom-reports"><h2>Your perception</h2><p>Do you hear one galloping rhythm (A-B-A, A-B-A…) or two separate streams (A-A-A… and B…B…)? Perception can flip while the sound stays the same.</p>
    <button onClick={()=>send('one-stream')}>One stream (galloping)</button><button onClick={()=>send('two-streams')}>Two streams</button><button onClick={()=>send('switching')}>Switching between them</button>
    <h3>Your local boundary map</h3><canvas ref={ref} className="track-canvas" aria-label="Streaming boundary map"/><small>Each stored report is plotted by its separation and slot duration: cyan = one stream, magenta = two streams, green = switching. Collect reports at several settings to see your own coherence/fission boundaries.</small></section>;
}
export const streamingPanels:ExperimentPanels={Controls,Analysis,Responses};
