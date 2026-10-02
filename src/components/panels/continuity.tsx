import {useEffect,useRef} from 'react';
import {Num,Sel,type ExperimentPanels,type PanelProps} from './types';
import {renderContinuityCycle,normalizeContinuityParams} from '../../experiments/continuity.js';
const COND:[string,string][]=[['continuous','A · Uninterrupted target'],['silent-gap','B · Silent gap (target absent)'],['masked','C · Masked gap (target absent + noise)']];
function Controls(p:PanelProps){return <div className="param-grid">
  <Sel label="Condition" k="condition" options={COND} {...p}/>
  <Num label="Target frequency (Hz)" k="targetHz" min={100} max={4000} step={1} {...p}/>
  <Num label="Target level" k="targetLevel" min={.01} max={.2} step={.01} {...p}/>
  <Num label="Gap duration (ms)" k="gapMs" min={30} max={600} step={10} {...p}/>
  <Sel label="Masker type" k="maskerType" options={[['white','Broadband white noise (Classic)'],['bandpass','Band-pass noise around the target'],['notched','Notched noise (target band removed)']]} {...p}/>
  <Num label="Masker level" k="maskerLevel" min={0} max={.6} step={.01} {...p}/>
  <Num label="Masker bandwidth / notch width (octaves)" k="maskerBandwidthOctaves" min={.25} max={3} step={.05} {...p}/>
  <small>A notched masker has no energy where the target is, so it should not produce the illusion; a band-pass masker centred on the target should.</small></div>}
function Waveform({params}:PanelProps){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{const c=ref.current;if(!c)return;const r=renderContinuityCycle(params,8000),dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;const x=c.getContext('2d')!;x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
    const draw=(d:Float32Array,y0:number,hh:number,col:string)=>{x.strokeStyle=col;x.beginPath();for(let px=0;px<w;px++){const a=Math.floor(px/w*d.length),b=Math.floor((px+1)/w*d.length);let mx=0;for(let i=a;i<b;i++)mx=Math.max(mx,Math.abs(d[i]));x.moveTo(px,y0-mx/.6*hh);x.lineTo(px,y0+mx/.6*hh)}x.stroke()};
    draw(r.masker,h*.25,h*.2,'#ff54cf');draw(r.target,h*.72,h*.2,'#5cf7ff');x.fillStyle='#7386a2';x.font='10px ui-monospace,monospace';x.fillText('MASKER (separate render)',6,12);x.fillText('TARGET (separate render) — exact zero during the gap in B and C',6,h*.5+10)},[params]);
  const p=normalizeContinuityParams(params);
  return <section className="analysis"><h3>Rendered cycle: target and masker kept separate</h3><canvas ref={ref} className="track-canvas" aria-label="Continuity target and masker envelopes"/><small>Condition {p.condition}: gap {p.gapMs} ms starting at {p.gapStartSeconds.toFixed(2)} s of a {p.cycleSeconds} s cycle. In conditions B and C every target sample inside the gap is 0.0, not merely attenuated.</small></section>;
}
function Responses({report,params}:PanelProps){const p=normalizeContinuityParams(params);return <section className="reports phantom-reports"><h2>Your perception</h2><p>Condition {p.condition}. Did the tone seem to continue through the gap, or did it stop and restart?</p>
  <button onClick={()=>report({condition:p.condition,judgment:'continuous'})}>Continuous through the gap</button><button onClick={()=>report({condition:p.condition,judgment:'interrupted'})}>Interrupted</button><button onClick={()=>report({condition:p.condition,judgment:'uncertain'})}>Uncertain</button>
  <small>Compare all three conditions. The tone is physically absent during the gap in both B and C; only the masker differs.</small></section>}
export const continuityPanels:ExperimentPanels={Controls,Analysis:Waveform,Responses};
