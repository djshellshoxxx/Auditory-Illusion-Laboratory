// Pure, deterministic Infinite Motion clock. Lanes are bipolar velocities: sign = direction, |v| = speed, 0 = hold.
import {rhythmLayerGain} from '../experiments/rissetRhythm.js';
const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number.isFinite(Number(v))?Number(v):0));
const wrap=(x,n)=>((x%n)+n)%n;

export const LANES=['pitch','tempo','pan','distance','spectrum'];
export const SPEED=Object.freeze({pitch:.5,tempo:.25,pan:.5,distance:.25,spectrum:.25}); // octave/s, octave/s, rev/s, cycle/s, cycle/s
export const PITCH_LAYERS=8,TEMPO_LAYERS=5,ROOT_BPM=90,EDGE_TAPER=.3,PITCH_WIDTH=1.3,SPECTRUM_RANGE=1.2,MAX_ITD=.00065;
export const BAND_CENTER_HZ=700;
const C1=440*Math.pow(2,(24-69)/12);
/** Bottom of the 8-octave band: the C closest to centre / 2^(N/2). */
export const BAND_LOW_HZ=C1*Math.pow(2,Math.round(Math.log2(BAND_CENTER_HZ/Math.pow(2,PITCH_LAYERS/2)/C1)));

export function normalizeLanes(l={}){const o={};for(const k of LANES)o[k]=clamp(l[k],-1,1);return o;}
export function createMotionState(){return {time:0,pitch:0,tempo:0,pan:0,distance:0,spectrum:0,beat:new Float64Array(TEMPO_LAYERS),tempoPos:Array.from({length:TEMPO_LAYERS},(_,k)=>k)};}

export function pitchEnvelopeGain(position,spectrumShift=0){
  const n=PITCH_LAYERS,g=Math.exp(-.5*Math.pow((position-(n/2+spectrumShift))/PITCH_WIDTH,2)),edge=Math.min(position,n-position);
  const taper=edge<=0?0:edge>=EDGE_TAPER?1:.5-.5*Math.cos(Math.PI*edge/EDGE_TAPER);return g*taper;
}
/** Layer frequencies/gains for one note at the current motion state. The note's pitch class sets the layer offset. */
/** A note's octave moves the envelope centre 0.6 octave per octave from C4 (clamped ±2), so register is audible. */
export const registerShift=midi=>clamp((Math.floor(Math.round(midi)/12)-5)*.6,-2,2);
export function pitchLayers(midi,state){
  const pc=wrap(Math.round(midi),12)/12,shift=spectrumShift(state)+registerShift(midi);
  return Array.from({length:PITCH_LAYERS},(_,k)=>{const position=wrap(k+pc+state.pitch,PITCH_LAYERS);return {k,position,frequencyHz:BAND_LOW_HZ*Math.pow(2,position),gain:pitchEnvelopeGain(position,shift)}});
}
export const spectrumShift=s=>SPECTRUM_RANGE*Math.sin(2*Math.PI*s.spectrum);
export function tempoLayers(state){return state.tempoPos.map((position,k)=>({k,position,rateBpm:ROOT_BPM*Math.pow(2,position-(TEMPO_LAYERS-1)/2),gain:rhythmLayerGain(position,TEMPO_LAYERS)}));}
/** Spatial cues: equal-power level, far-ear delay, distance level/damping/reverb. All finite and bounded. */
export function spatialCues(state){
  const azimuth=Math.sin(2*Math.PI*state.pan),theta=(azimuth+1)*Math.PI/4,d=(1-Math.cos(2*Math.PI*state.distance))/2;
  return {azimuth,gainL:Math.cos(theta),gainR:Math.sin(theta),delayL:Math.max(0,azimuth)*MAX_ITD,delayR:Math.max(0,-azimuth)*MAX_ITD,distance:d,level:1/(1+3*d),cutoffHz:16000*Math.pow(2,-3*d),reverbSend:.05+.5*d};
}

/** Advance the clock by dt seconds (sub-stepped at 1 ms). Returns pulses {time, layer, gain} emitted during the step. */
export function advanceMotion(state,lanes,dt,step=.001){
  const l=normalizeLanes(lanes),pulses=[];let remaining=clamp(dt,0,10);
  while(remaining>1e-12){
    const h=Math.min(step,remaining);
    state.pitch=wrap(state.pitch+l.pitch*SPEED.pitch*h,PITCH_LAYERS);
    state.pan=wrap(state.pan+l.pan*SPEED.pan*h,1);
    state.distance=wrap(state.distance+l.distance*SPEED.distance*h,1);
    state.spectrum=wrap(state.spectrum+l.spectrum*SPEED.spectrum*h,1);
    state.tempo=wrap(state.tempo+l.tempo*SPEED.tempo*h,TEMPO_LAYERS);
    for(let k=0;k<TEMPO_LAYERS;k++){
      const prevPos=state.tempoPos[k],pos=wrap(k+state.tempo,TEMPO_LAYERS);
      if(Math.abs(pos-prevPos)>TEMPO_LAYERS/2)state.beat[k]=0; // layer wrapped while silent: restart its beat cleanly
      state.tempoPos[k]=pos;
      const rate=ROOT_BPM*Math.pow(2,pos-(TEMPO_LAYERS-1)/2),prev=state.beat[k],next=prev+rate/60*h;
      if(Math.floor(next)>Math.floor(prev)){const gain=rhythmLayerGain(pos,TEMPO_LAYERS);if(gain>1e-4)pulses.push({time:+(state.time+(Math.floor(next)-prev)/(next-prev)*h).toFixed(6),layer:k,gain})}
      state.beat[k]=next%1e6;
    }
    state.time+=h;remaining-=h;
  }
  return pulses;
}
/** True when a layer's position jumped across the band edge between two snapshots. */
export const wrapped=(a,b,n)=>Math.abs(b-a)>n/2;
export function snapshot(state){return {time:state.time,pitch:state.pitch,tempo:state.tempo,pan:state.pan,distance:state.distance,spectrum:state.spectrum,tempoPos:[...state.tempoPos]};}
