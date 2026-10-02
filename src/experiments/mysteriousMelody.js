import {renderStereoEvents} from '../audio/render.js';
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
const NAMES={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
export const midiToHz=m=>440*Math.pow(2,(m-69)/12);
/** "C4:1 D4:0.5" → [{midi,beats}]. Returns null on malformed input. */
export function parseMelody(text){
  if(typeof text!=='string')return null;const tokens=text.trim().split(/[\s,]+/).filter(Boolean);if(!tokens.length)return null;const out=[];
  for(const t of tokens){const m=/^([A-Ga-g])([#b]?)(-?\d)(?::([\d.]+))?$/.exec(t);if(!m)return null;const beats=m[4]?Number(m[4]):1;if(!(beats>0))return null;out.push({midi:(Number(m[3])+1)*12+NAMES[m[1].toUpperCase()]+(m[2]==='#'?1:m[2]==='b'?-1:0),beats})}
  return out;
}
export const MELODIES=Object.freeze({
  'yankee-doodle':{name:'Yankee Doodle',notes:'C4:.5 C4:.5 D4:.5 E4:.5 C4:.5 E4:.5 D4:1 C4:.5 C4:.5 D4:.5 E4:.5 C4:1 B3:1 C4:.5 C4:.5 D4:.5 E4:.5 F4:.5 E4:.5 D4:.5 C4:.5 B3:.5 G3:.5 A3:.5 B3:.5 C4:1 C4:1'},
  'twinkle':{name:'Twinkle Twinkle',notes:'C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2'},
  'ode-to-joy':{name:'Ode to Joy',notes:'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:.5 D4:2'},
  'frere-jacques':{name:'Frère Jacques',notes:'C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4:2 E4 F4 G4:2'}
});
export const MYSTERIOUS_MELODY_CLASSIC=Object.freeze({melody:'yankee-doodle',userMelody:'',condition:'scrambled',seed:1,octaveSpan:3,tempoBpm:120});

export function normalizeMysteriousMelodyParams(input={}){
  const melody=Object.keys(MELODIES).includes(input.melody)?input.melody:input.melody==='user'?'user':'yankee-doodle';
  return {melody,userMelody:typeof input.userMelody==='string'?input.userMelody:'',condition:input.condition==='original'?'original':'scrambled',seed:Math.round(clamp(input.seed,1,1e9,1)),octaveSpan:Math.round(clamp(input.octaveSpan,2,3,3)),tempoBpm:clamp(input.tempoBpm??(input.tempo?Number(input.tempo)*20:undefined),40,240,120)};
}
export function sourceMelody(input={}){const p=normalizeMysteriousMelodyParams(input);if(p.melody==='user'){const u=parseMelody(p.userMelody);if(u)return u}return parseMelody(MELODIES[p.melody==='user'?'yankee-doodle':p.melody].notes);}
/** Scrambled: same pitch classes, octave chosen haphazardly from the span, never the same octave twice in a row. */
export function mysteriousMelodyNotes(input={}){
  const p=normalizeMysteriousMelodyParams(input),src=sourceMelody(p);let s=p.seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
  const offsets=p.octaveSpan===3?[-12,0,12]:[0,12];let prev=null,t=0;
  return src.map((n,i)=>{let shift=0;
    if(p.condition==='scrambled'){const choices=offsets.filter(o=>o!==prev);shift=choices[Math.floor(rand()*choices.length)];prev=shift}
    const seconds=n.beats*60/p.tempoBpm,note={index:i,sourceMidi:n.midi,midi:n.midi+shift,octaveShift:shift,beats:n.beats,time:+t.toFixed(6),duration:+seconds.toFixed(6)};t+=seconds;return note});
}
export function mysteriousMelodySeconds(input={}){const n=mysteriousMelodyNotes(input);return n.length?+(n[n.length-1].time+n[n.length-1].duration).toFixed(6):0;}
export function renderMysteriousMelody(input={},sampleRate=48000){
  const notes=mysteriousMelodyNotes(input);
  const events=notes.map(n=>({time:n.time,duration:n.duration*.9,channel:'both',frequencyHz:midiToHz(n.midi),gain:.07,partials:[{ratio:1,gain:1},{ratio:2,gain:.25}]}));
  return {...renderStereoEvents(events,{sampleRate,rampSeconds:.01,totalSeconds:mysteriousMelodySeconds(input)+.1}),notes};
}
