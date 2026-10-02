import {useEffect,useRef} from 'react';
import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
import {createRissetRhythmSequencer,rissetRhythmState,rhythmCycleSeconds,normalizeRissetRhythmParams} from '../../experiments/rissetRhythm.js';
function Controls(p:PanelProps){return <div className="param-grid">
  <Num label="Root tempo (BPM)" k="rootBpm" min={30} max={240} step={1} {...p}/>
  <Num label="Layers" k="layers" min={3} max={7} step={1} {...p}/>
  <Num label="Cycle speed (octaves per second)" k="speedOctavesPerSecond" min={.01} max={.5} step={.01} {...p}/>
  <Sel label="Direction" k="direction" options={[['1','Accelerating'],['-1','Decelerating']]} {...p}/>
  <Num label="Density (fraction of beats sounded)" k="density" min={.1} max={1} step={.05} {...p}/>
  <Sel label="Pulse timbre" k="pulseTimbre" options={[['click','Broadband click (Classic)'],['tick','1.5 kHz tick'],['pitched','Pitched per layer (exploratory)']]} {...p}/>
  <Num label="Stereo spread (0–1)" k="stereoSpread" min={0} max={1} step={.05} {...p}/>
  <small>Classic: 90 BPM root, five layers at exact 2:1 ratios, tempo doubling every 10 s, every beat sounded.</small></div>}
function Raster({params,session,running}:PanelProps){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{let raf=0;const p=normalizeRissetRhythmParams(params),seq=createRissetRhythmSequencer(p,.001),pulses:any[]=[],win=8;
    const draw=()=>{const c=ref.current;if(!c){raf=requestAnimationFrame(draw);return}const dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr}const x=c.getContext('2d')!;x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
      const now=session&&running?(performance.now()-session.startedAt)/1000:0;
      if(now>0)pulses.push(...seq.pulsesUntil(now+.05));
      const laneH=(h-16)/p.layers;
      for(const q of pulses){if(q.time<now-win||q.time>now)continue;const px=((q.time-(now-win))/win)*w,py=14+q.layer*laneH;x.fillStyle=`rgba(92,247,255,${Math.max(.08,q.gain)})`;x.fillRect(px,py+2,2,laneH-4)}
      const st=rissetRhythmState(Math.max(0,now),p);x.fillStyle='#7386a2';x.font='10px ui-monospace,monospace';st.forEach(l=>x.fillText(`${l.rateBpm.toFixed(0)} bpm`,4,14+l.k*laneH+laneH/2+3));x.fillText(`generated pulses · last ${win} s · cycle ${rhythmCycleSeconds(p).toFixed(0)} s`,8,10);
      raf=requestAnimationFrame(draw)};draw();return()=>cancelAnimationFrame(raf)},[params,session,running]);
  return <section className="analysis"><h3>Pulse layers</h3><canvas ref={ref} className="track-canvas" aria-label="Generated rhythm pulse raster"/><small>One row per layer, drawn from the same deterministic sequencer that schedules the audio. Brightness = layer gain; each layer fades to silence before its rate wraps.</small></section>;
}
function Responses({report}:PanelProps){return <section className="reports phantom-reports"><h2>Your perception</h2><p>Does the tempo seem to keep speeding up (or slowing down) without limit?</p><button onClick={()=>report('accelerating')}>Accelerating endlessly</button><button onClick={()=>report('decelerating')}>Decelerating endlessly</button><button onClick={()=>report('ambiguous')}>Ambiguous / resets</button></section>}
export const rissetRhythmPanels:ExperimentPanels={Controls,Analysis:Raster,Responses};
