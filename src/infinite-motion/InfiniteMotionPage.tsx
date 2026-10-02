import {useEffect,useRef,useState,type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {KEYBOARD_MAP,parseMidi,ccToBipolar,xyToBipolar} from './core.js';
import {MotionInstrument} from './instrument';
import {pitchLayers,tempoLayers,spatialCues,createMotionState,SPEED} from './engine.js';
import './styles.css';

type Lanes={pitch:number;tempo:number;pan:number;distance:number;spectrum:number};
type LaneKey=keyof Lanes;
const LANE_INFO:Record<LaneKey,{label:string;unit:string}>={
  pitch:{label:'PITCH',unit:`endless glide · ±${SPEED.pitch} oct/s`},
  tempo:{label:'TEMPO',unit:`endless accel/decel · ±${SPEED.tempo} oct/s`},
  pan:{label:'PAN ORBIT',unit:`circles the head · ±${SPEED.pan} rev/s`},
  distance:{label:'DISTANCE',unit:`approach/recede · ±${SPEED.distance} cycle/s`},
  spectrum:{label:'SPECTRUM',unit:`brightness sweep · ±${SPEED.spectrum} cycle/s`}
};
const all=(v:number):Lanes=>({pitch:v,tempo:v,pan:v,distance:v,spectrum:v});
const initial=all(.35);
const factories:Record<string,Lanes>={'Coherent Rise':initial,'Coherent Fall':all(-.35),'Opposed Space':{pitch:.38,tempo:.18,pan:.55,distance:-.48,spectrum:-.3},'Slow Spiral':{pitch:.08,tempo:.06,pan:.16,distance:.1,spectrum:.12},'Contradiction':{pitch:.6,tempo:-.42,pan:.7,distance:.55,spectrum:-.65}};
const PRESET_KEY='ail.motion.user-scene.v1',MIDI_KEY='ail.motion.midi-map.v1';
const isLanes=(x:any):x is Lanes=>x&&['pitch','tempo','pan','distance','spectrum'].every(k=>typeof x[k]==='number'&&Number.isFinite(x[k]));

function MotionView({inst}:{inst:MotionInstrument}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{let raf=0;const idle=createMotionState();const draw=()=>{const c=ref.current;if(c){const dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr}const x=c.getContext('2d')!;x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
    const s:any=inst.running?inst.snapshot():idle,pl=pitchLayers(60,s),tl=tempoLayers(s),sc=spatialCues(s),third=w/3;
    x.font='10px ui-monospace,monospace';x.fillStyle='#7386a2';x.fillText('PITCH LAYERS (generated)',8,12);x.fillText('TEMPO LAYERS',third+8,12);x.fillText('SPACE / DISTANCE',2*third+8,12);
    for(const l of pl){const y=h-8-(l.position/8)*(h-24);x.fillStyle=`rgba(92,247,255,${Math.max(.06,l.gain)})`;x.fillRect(12,y-2,third-28,4)}
    for(const l of tl){const y=h-8-(l.position/5)*(h-24);x.fillStyle=`rgba(255,84,207,${Math.max(.06,l.gain)})`;x.fillRect(third+12,y-2,third-28,4);x.fillStyle='#7386a2';x.fillText(`${l.rateBpm.toFixed(0)}`,third+14,y-4)}
    const cx=2*third+third/2,cy=h/2+6,r=Math.min(third,h)/2-18,rr=r*(.35+.65*sc.distance);
    x.strokeStyle='#24304a';x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.stroke();x.fillStyle='#7386a2';x.fillText('L',cx-r-10,cy+3);x.fillText('R',cx+r+4,cy+3);
    const ang=2*Math.PI*s.pan;x.fillStyle='#a9ff68';x.beginPath();x.arc(cx+Math.sin(ang)*rr,cy-Math.cos(ang)*rr,5,0,Math.PI*2);x.fill();
    x.fillStyle='#7386a2';x.fillText(`ITD ${((sc.delayL||sc.delayR)*1000).toFixed(2)} ms · level ${sc.level.toFixed(2)}`,2*third+8,h-6);}
    raf=requestAnimationFrame(draw)};draw();return()=>cancelAnimationFrame(raf)},[inst]);
  return <canvas ref={ref} className="motion-canvas" aria-label="Infinite Motion layer and space view"/>;
}

export function InfiniteMotionPage(){
  const inst=useRef<MotionInstrument|null>(null);if(!inst.current)inst.current=new MotionInstrument();
  const [lanes,setLanes]=useState<Lanes>(initial),[linked,setLinked]=useState(true),[midi,setMidi]=useState('MIDI optional'),[hold,setHold]=useState(false),[preset,setPreset]=useState('Coherent Rise'),[learnTarget,setLearnTarget]=useState<LaneKey|null>(null),[octave,setOctave]=useState(0),[voices,setVoices]=useState(0),[tempoOn,setTempoOn]=useState(true);
  const linkedRef=useRef(linked),holdRef=useRef(hold),learnRef=useRef(learnTarget),octaveRef=useRef(octave),midiMap=useRef<Record<number,LaneKey>>({}),held=useRef(new Map<string,number>());
  useEffect(()=>{linkedRef.current=linked},[linked]);useEffect(()=>{holdRef.current=hold},[hold]);useEffect(()=>{learnRef.current=learnTarget},[learnTarget]);useEffect(()=>{octaveRef.current=octave},[octave]);
  useEffect(()=>{inst.current!.setLanes(lanes)},[lanes]);
  useEffect(()=>{inst.current!.tempoEnabled=tempoOn},[tempoOn]);
  useEffect(()=>{const i=inst.current!;i.onChange=()=>setVoices(i.voiceCount);try{midiMap.current=JSON.parse(localStorage.getItem(MIDI_KEY)||'{}')}catch{midiMap.current={}}return()=>{i.onChange=undefined;i.dispose()}},[]);
  const change=(k:LaneKey,v:number)=>setLanes(s=>linkedRef.current?all(v):{...s,[k]:v});
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.matches?.('input,textarea,select')||e.repeat||e.metaKey||e.ctrlKey||e.altKey)return;
      if(e.code==='KeyZ'){setOctave(o=>Math.max(-3,o-1));return}if(e.code==='KeyX'){setOctave(o=>Math.min(3,o+1));return}
      const n=KEYBOARD_MAP[e.code as keyof typeof KEYBOARD_MAP];if(n){const note=n+12*octaveRef.current;held.current.set(e.code,note);void inst.current!.noteOn(note)}};
    const up=(e:KeyboardEvent)=>{const note=held.current.get(e.code);if(note===undefined)return;held.current.delete(e.code);if(!holdRef.current)inst.current!.noteOff(note)};
    addEventListener('keydown',down);addEventListener('keyup',up);return()=>{removeEventListener('keydown',down);removeEventListener('keyup',up)}},[]);
  useEffect(()=>{const nav=navigator as Navigator&{requestMIDIAccess?:()=>Promise<MIDIAccess>};if(!nav.requestMIDIAccess){setMidi('Web MIDI unavailable; keyboard fully supported');return}let alive=true;
    nav.requestMIDIAccess().then(access=>{if(!alive)return;const wire=()=>{access.inputs.forEach(input=>input.onmidimessage=e=>{const m=parseMidi(Array.from(e.data??[]));if(m.type==='noteon')void inst.current!.noteOn(m.note,m.velocity);if(m.type==='noteoff'&&!holdRef.current)inst.current!.noteOff(m.note);
      if(m.type==='cc'){const target=learnRef.current;if(target){midiMap.current[m.cc]=target;try{localStorage.setItem(MIDI_KEY,JSON.stringify(midiMap.current))}catch{/* storage blocked */}setLearnTarget(null);setMidi(`CC ${m.cc} learned for ${target}`)}else{const lane=midiMap.current[m.cc];if(lane)change(lane,ccToBipolar((m.value??0)*127))}}})};
      wire();setMidi(`${access.inputs.size} MIDI input(s)`);access.onstatechange=()=>{wire();setMidi(`${access.inputs.size} MIDI input(s)`);if([...access.inputs.values()].some(i=>i.state==='disconnected'))inst.current!.stopAll()}}).catch(()=>setMidi('MIDI permission not granted'));
    return()=>{alive=false}},[]);
  const applyPreset=(name:string)=>{let scene:Lanes|undefined=factories[name];if(name==='User Scene'){try{const s=JSON.parse(localStorage.getItem(PRESET_KEY)||'null');scene=isLanes(s)?s:initial}catch{scene=initial}}if(scene){const coherent=new Set(Object.values(scene)).size===1;setLinked(coherent);setLanes(scene);setPreset(name)}};
  const saveScene=()=>{try{localStorage.setItem(PRESET_KEY,JSON.stringify(lanes));setPreset('User Scene')}catch{/* storage blocked */}};
  const toggleHold=()=>{const next=!hold;setHold(next);if(next)void inst.current!.noteOn(48+12*octave,.75);else inst.current!.stopAll()};
  const updateXY=(clientX:number,clientY:number,el:HTMLElement)=>{const r=el.getBoundingClientRect(),xy=xyToBipolar(clientX-r.left,clientY-r.top,r.width,r.height);setLinked(false);setLanes(s=>({...s,pitch:xy.x,spectrum:xy.y}))};
  const xyKey=(e:ReactKeyboardEvent<HTMLDivElement>)=>{const step=e.shiftKey?.2:.08,d:Record<string,[number,number]>={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowDown:[0,-step],ArrowUp:[0,step]};const m=d[e.key];if(!m)return;e.preventDefault();e.stopPropagation();setLinked(false);setLanes(v=>({...v,pitch:Math.max(-1,Math.min(1,v.pitch+m[0])),spectrum:Math.max(-1,Math.min(1,v.spectrum+m[1]))}))};
  return <main className="motion-page"><section className="hero"><div><span className="eyebrow">EXPERIMENTAL INSTRUMENT</span><h1>Infinite Motion</h1><p>Play a key and the note glides endlessly through Shepard–Risset layers while a Risset rhythm accelerates forever. Each lane is a speed: the sign sets direction and 0 holds still. Unlink the lanes to make the cues disagree.</p></div><div className="orb" style={{transform:`rotate(${lanes.pan*120}deg) scale(${1+lanes.distance*.15})`}}><i/><i/><i/></div></section>
    <section className="motion-toolbar"><label>Scene <select aria-label="Scene" value={preset} onChange={e=>applyPreset(e.target.value)}>{[...Object.keys(factories),'User Scene'].map(x=><option key={x}>{x}</option>)}</select></label><button onClick={saveScene}>Save Current</button><button className={hold?'active':''} onClick={toggleHold}>{hold?'Release Hold':'Drone Hold'}</button><label><input type="checkbox" checked={tempoOn} onChange={e=>setTempoOn(e.target.checked)}/> Rhythm layer</label><button onClick={()=>{setHold(false);inst.current!.stopAll()}}>Stop All</button><output className="motion-status" aria-label="Voices sounding">Voices: {voices}</output></section>
    <section className="analysis motion-view"><MotionView inst={inst.current}/></section>
    <section className="motion-field" tabIndex={0} role="application" aria-label="XY macro: horizontal pitch speed, vertical spectrum speed" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);updateXY(e.clientX,e.clientY,e.currentTarget)}} onPointerMove={e=>{if(e.buttons)updateXY(e.clientX,e.clientY,e.currentTarget)}} onKeyDown={xyKey}><div className="xy-dot" style={{left:`${(lanes.pitch+1)*50}%`,top:`${(1-lanes.spectrum)*50}%`}}/><span>PITCH SPEED →</span><b>SPECTRUM SPEED ↑</b></section>
    <div className="matrix"><div className="matrix-head"><h2>Perceptual Contradiction Matrix</h2><button onClick={()=>{setLinked(true);setLanes(initial);setPreset('Coherent Rise')}}>Restore coherent</button><label><input type="checkbox" checked={!linked} onChange={e=>setLinked(!e.target.checked)}/> Unlink cues</label></div>
      {(Object.entries(lanes) as [LaneKey,number][]).map(([k,v])=><div className="lane" key={k}><span title={LANE_INFO[k].unit}>{LANE_INFO[k].label}<small>{LANE_INFO[k].unit}</small></span><input aria-label={`${k} motion`} type="range" min="-1" max="1" step=".01" value={v} onChange={e=>change(k,+e.target.value)}/><output>{v.toFixed(2)}</output><button className={learnTarget===k?'active':''} onClick={()=>setLearnTarget(k)}>MIDI Learn</button></div>)}</div>
    <section className="keyboard"><h2>Performance input</h2><p><kbd>A</kbd><kbd>W</kbd><kbd>S</kbd><kbd>E</kbd><kbd>D</kbd><kbd>F</kbd><kbd>T</kbd><kbd>G</kbd><kbd>Y</kbd><kbd>H</kbd><kbd>U</kbd><kbd>J</kbd><kbd>K</kbd> play C to C · <kbd>Z</kbd>/<kbd>X</kbd> octave down/up</p><p aria-label="Keyboard octave">Octave shift: {octave>0?`+${octave}`:octave}</p><small>{learnTarget?`Move a MIDI CC to map ${learnTarget}. `:''}{midi}</small></section>
    <p className="lab-note">Contradictory cue routing is an experimental sound-design system, not a canonical psychoacoustic demonstration. Because the pitch is circular, the octave of a key moves the spectral envelope (brightness and register) rather than adding a fixed octave.</p></main>;
}
