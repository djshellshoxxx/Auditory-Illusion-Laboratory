import {useEffect,useRef} from 'react';
import type {ExperimentSession} from '../experiments/session';

const C={left:'#5cf7ff',right:'#ff54cf',both:'#a9ff68'} as const;

/** Draws the physical left/right event timeline of the current stimulus with a cycling playhead. */
export function EventLanes({session,running}:{session:ExperimentSession|null;running:boolean}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    let raf=0;
    const draw=()=>{
      const c=ref.current;if(!c){raf=requestAnimationFrame(draw);return}
      const dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;
      if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr}
      const x=c.getContext('2d');if(!x){raf=requestAnimationFrame(draw);return}
      x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
      const ev=session?.events??[],loop=session?.loopSeconds??(ev.length?Math.max(...ev.map(e=>e.time+e.duration)):0);
      if(session&&ev.length&&loop>0){
        const freqs=ev.map(e=>e.frequencyHz).filter(f=>f>0);
        const lo=Math.log2(Math.min(...freqs)/1.3),hi=Math.log2(Math.max(...freqs)*1.3);
        const laneH=(h-26)/2,lane=(ch:string)=>ch==='right'?26+laneH:26;
        x.font='10px ui-monospace,monospace';x.fillStyle='#7386a2';
        x.fillText('LEFT CHANNEL',8,20);x.fillText('RIGHT CHANNEL',8,26+laneH+14);
        x.strokeStyle='#24304a';x.beginPath();x.moveTo(0,26+laneH);x.lineTo(w,26+laneH);x.stroke();
        for(const e of ev){
          const chans=e.channel==='both'?['left','right']:[e.channel];
          for(const ch of chans){
            const px=(e.time/loop)*w,pw=Math.max(2,(e.duration/loop)*w-1);
            const fy=e.frequencyHz>0?1-(Math.log2(e.frequencyHz)-lo)/(hi-lo):.5;
            const py=lane(ch)+fy*(laneH-14)+4;
            x.fillStyle=C[ch as 'left'|'right'];x.globalAlpha=.25+.7*(e.gain??1);
            x.fillRect(px,py,pw,8);x.globalAlpha=1;
            if(e.label&&pw>18){x.fillStyle='#dce8f7';x.fillText(e.label,px+2,py-2)}
          }
        }
        if(running){
          const t=((performance.now()-session.startedAt)/1000)%loop,px=(t/loop)*w;
          x.strokeStyle='#ffffffaa';x.beginPath();x.moveTo(px,0);x.lineTo(px,h);x.stroke();
        }
      }else if(session?.phases?.length){
        const end=Math.max(...session.phases.map(p=>p.end));
        session.phases.forEach((p,i)=>{const px=(p.start/end)*w,pw=(p.end-p.start)/end*w;x.fillStyle=i%2?'#1a2235':'#14243b';x.fillRect(px,10,pw,h-20);x.fillStyle='#9fd6ff';x.font='11px ui-monospace,monospace';x.fillText(p.label,px+6,26)});
        if(running){const t=Math.min(end,(performance.now()-session.startedAt)/1000),px=(t/end)*w;x.strokeStyle='#ffffffaa';x.beginPath();x.moveTo(px,0);x.lineTo(px,h);x.stroke()}
      }
      raf=requestAnimationFrame(draw);
    };
    draw();return()=>cancelAnimationFrame(raf);
  },[session,running]);
  return <canvas className="lane-canvas" ref={ref} aria-label="Physical left/right event lanes"/>;
}
