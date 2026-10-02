import {renderStereoEvents} from '../audio/render.js';
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
const NAMES={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
export const midiToHz=m=>440*Math.pow(2,(m-69)/12);
export const midiName=m=>['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][((m%12)+12)%12]+(Math.floor(m/12)-1);

/** Parse "G5 E5 F5" / "Bb3,C4" into MIDI numbers. Returns null on any malformed token. */
export function parseNoteNames(text){
  if(typeof text!=='string')return null;
  const tokens=text.trim().split(/[\s,]+/).filter(Boolean);if(!tokens.length)return null;
  const out=[];
  for(const t of tokens){
    const m=/^([A-Ga-g])([#b]?)(-?\d)$/.exec(t);if(!m)return null;
    out.push((Number(m[3])+1)*12+NAMES[m[1].toUpperCase()]+(m[2]==='#'?1:m[2]==='b'?-1:0));
  }
  return out;
}

/** Reconstruction from the published description: two three-note cambiata figures. Not an audio-verified transcription. */
export const CAMBIATA_CLASSIC=Object.freeze({higherFigure:'G5 E5 F5',lowerFigure:'D4 B3 C4',transposeSemitones:0,positionSeconds:.25,channelSwap:false,fixtureStatus:'reconstructed'});

export function normalizeCambiataParams(input={}){
  const higher=parseNoteNames(input.higherFigure)??parseNoteNames(CAMBIATA_CLASSIC.higherFigure);
  const lower=parseNoteNames(input.lowerFigure)??parseNoteNames(CAMBIATA_CLASSIC.lowerFigure);
  const transposeSemitones=Math.round(clamp(input.transposeSemitones??input.transpose,-24,24,0));
  const positionSeconds=clamp(input.positionSeconds??(input.tempo?1/Number(input.tempo):undefined),.08,1,CAMBIATA_CLASSIC.positionSeconds);
  return {higher,lower,transposeSemitones,positionSeconds,channelSwap:Boolean(input.channelSwap)};
}

function cycleLength(a,b){const n=Math.max(a,b);const lcm=(x,y)=>{const g=(p,q)=>q?g(q,p%q):p;return x*y/g(x,y)};const L=lcm(a,b);return (n%2||L%2)?L*2:L;}
export function cambiataLoopSeconds(input={}){const p=normalizeCambiataParams(input);return +(cycleLength(p.higher.length,p.lower.length)*p.positionSeconds).toFixed(6);}

/** Each position: one higher-figure tone and one lower-figure tone in opposite ears, ear assignment alternating. */
export function cambiataDichoticEvents(input={}){
  const p=normalizeCambiataParams(input),n=cycleLength(p.higher.length,p.lower.length),out=[];
  for(let k=0;k<n;k++){
    const hi=p.higher[k%p.higher.length]+p.transposeSemitones,lo=p.lower[k%p.lower.length]+p.transposeSemitones;
    const hiRight=(k%2===0)!==p.channelSwap,t=k*p.positionSeconds;
    out.push({time:t,duration:p.positionSeconds,channel:hiRight?'right':'left',midi:hi,frequencyHz:midiToHz(hi),figure:'higher',position:k});
    out.push({time:t,duration:p.positionSeconds,channel:hiRight?'left':'right',midi:lo,frequencyHz:midiToHz(lo),figure:'lower',position:k});
  }
  return out;
}
export function cambiataEarSequences(input={}){
  const ev=cambiataDichoticEvents(input),ear=c=>ev.filter(e=>e.channel===c).sort((a,b)=>a.position-b.position).map(e=>e.midi);
  return {left:ear('left'),right:ear('right')};
}
export function renderCambiataLoop(input={},sampleRate=48000){
  const events=cambiataDichoticEvents(input).map(e=>({...e,gain:.11}));
  return {...renderStereoEvents(events,{sampleRate,rampSeconds:.005,totalSeconds:cambiataLoopSeconds(input)}),events};
}
