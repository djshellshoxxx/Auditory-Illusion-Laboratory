import {useEffect,useRef} from 'react';
import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
import {rissetGlideState,normalizeRissetGlideParams,bandLowHz,cycleSeconds} from '../../experiments/rissetGlide.js';
function Controls(p:PanelProps){return <div className="param-grid">
  <Num label="Layers (octaves)" k="layers" min={6} max={10} step={1} {...p}/>
  <Num label="Glide speed (octaves per second)" k="speedOctavesPerSecond" min={.01} max={1} step={.01} {...p}/>
  <Sel label="Direction" k="direction" options={[['1','Ascending'],['-1','Descending']]} {...p}/>
  <Num label="Envelope center (Hz)" k="envelopeCenterHz" min={200} max={4000} step={10} {...p}/>
  <Num label="Envelope width (octaves)" k="envelopeWidthOctaves" min={.5} max={3} step={.05} {...p}/>
  <Num label="Stereo spread (0–1)" k="stereoSpread" min={0} max={1} step={.05} {...p}/>
  <Sel label="Waveform" k="waveform" options={[['sine','Sine (Classic)'],['triangle','Triangle (exploratory)']]} {...p}/>
  <small>Classic: 8 layers, 0.12 octaves/s, envelope centred at 900 Hz. Each layer wraps on its own at the silent band edge.</small></div>}
function Tracks({params,session,running}:PanelProps){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{let raf=0;const p=normalizeRissetGlideParams(params),low=Math.log2(bandLowHz(p)),span=p.layers,win=8;
    const draw=()=>{const c=ref.current;if(!c){raf=requestAnimationFrame(draw);return}const dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr}const x=c.getContext('2d')!;x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
      const now=session&&running?(performance.now()-session.startedAt)/1000:0;
      for(let px=0;px<w;px+=2){const t=now-win+(px/w)*win;if(t<0)continue;const st=rissetGlideState(t,p);for(const l of st){if(l.gain<.005)continue;const y=h-((Math.log2(l.frequencyHz)-low)/span)*h;x.fillStyle=`rgba(92,247,255,${Math.min(1,l.gain)})`;x.fillRect(px,y-1,2,2)}}
      x.fillStyle='#7386a2';x.font='10px ui-monospace,monospace';x.fillText(`generated layer trajectories · last ${win} s · cycle ${cycleSeconds(p).toFixed(1)} s`,8,12);
      raf=requestAnimationFrame(draw)};draw();return()=>cancelAnimationFrame(raf)},[params,session,running]);
  return <section className="analysis"><h3>Layer trajectories</h3><canvas ref={ref} className="track-canvas" aria-label="Generated glide layer trajectories"/><small>Computed from the same deterministic schedule that drives the oscillators: log-frequency against time, brightness = layer gain. Each layer fades to exact silence before it wraps.</small></section>;
}
function Responses({report}:PanelProps){return <section className="reports phantom-reports"><h2>Your perception</h2><p>Does the glide seem to rise or fall without end?</p><button onClick={()=>report('rising')}>Rising endlessly</button><button onClick={()=>report('falling')}>Falling endlessly</button><button onClick={()=>report('ambiguous')}>Ambiguous / resets</button></section>}
export const rissetGlidePanels:ExperimentPanels={Controls,Analysis:Tracks,Responses};
