import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotionState,advanceMotion,pitchLayers,tempoLayers,spatialCues,normalizeLanes,registerShift,wrapped,PITCH_LAYERS,MAX_ITD,SPEED,BAND_LOW_HZ} from '../src/infinite-motion/engine.js';
const zero={pitch:0,tempo:0,pan:0,distance:0,spectrum:0};

test('lanes are velocities: zero holds every lane still, sign sets direction, speed scales with magnitude',()=>{
  const s=createMotionState();advanceMotion(s,zero,5);assert.deepEqual([s.pitch,s.tempo,s.pan,s.distance,s.spectrum],[0,0,0,0,0]);
  const up=createMotionState(),down=createMotionState(),half=createMotionState();
  advanceMotion(up,{...zero,pitch:1},1);advanceMotion(down,{...zero,pitch:-1},1);advanceMotion(half,{...zero,pitch:.5},1);
  assert.ok(Math.abs(up.pitch-SPEED.pitch)<1e-9);assert.ok(Math.abs(down.pitch-(PITCH_LAYERS-SPEED.pitch))<1e-9);assert.ok(Math.abs(half.pitch-SPEED.pitch/2)<1e-9);
  assert.deepEqual(normalizeLanes({pitch:9,tempo:-9,pan:NaN}),{pitch:1,tempo:-1,pan:0,distance:0,spectrum:0});
});

test('pitch keeps rising: after 40 s at full speed it has travelled 20 octaves without the layers ever leaving the band',()=>{
  const s=createMotionState();let travelled=0,prev=0;
  for(let i=0;i<4000;i++){advanceMotion(s,{...zero,pitch:1},.01);let d=s.pitch-prev;if(d<-PITCH_LAYERS/2)d+=PITCH_LAYERS;travelled+=d;prev=s.pitch;
    const l=pitchLayers(60,s);for(const x of l){assert.ok(x.frequencyHz>=BAND_LOW_HZ-1e-9&&x.frequencyHz<=BAND_LOW_HZ*256+1e-6)}}
  assert.ok(Math.abs(travelled-20)<1e-6,`travelled ${travelled}`);
});

test('pitch layers are exact octaves, carry the key pitch class, and the octave moves the envelope',()=>{
  const s=createMotionState();advanceMotion(s,{...zero,pitch:.7},3.3);
  for(const midi of [60,61,67]){const l=pitchLayers(midi,s).sort((a,b)=>a.frequencyHz-b.frequencyHz);for(let i=1;i<l.length;i++)assert.ok(Math.abs(l[i].frequencyHz/l[i-1].frequencyHz-2)<1e-9)}
  const a=createMotionState(),c=pitchLayers(60,a),cs=pitchLayers(61,a);assert.ok(Math.abs(12*Math.log2(cs[0].frequencyHz/c[0].frequencyHz)-1)<1e-9);
  assert.equal(registerShift(60),0);assert.equal(registerShift(72),.6);assert.equal(registerShift(0),-2);
  const centroid=l=>l.reduce((t,x)=>t+x.gain*Math.log2(x.frequencyHz),0)/l.reduce((t,x)=>t+x.gain,0);
  assert.ok(centroid(pitchLayers(72,a))>centroid(pitchLayers(60,a))+.4);
});

test('every pitch layer wraps silently and on its own, at variable and reversed speed',()=>{
  const s=createMotionState();let prev=pitchLayers(64,s),wraps=0;
  for(let i=0;i<3000;i++){const v=Math.sin(i/300)*1;advanceMotion(s,{...zero,pitch:v,spectrum:.4},.02);const cur=pitchLayers(64,s);
    let simultaneous=0;cur.forEach((l,k)=>{if(wrapped(prev[k].position,l.position,PITCH_LAYERS)){wraps++;simultaneous++;assert.ok(prev[k].gain<1e-3&&l.gain<1e-3,`audible wrap: ${prev[k].gain} ${l.gain}`)}});
    assert.ok(simultaneous<=1,'layers must not wrap together');prev=cur}
  assert.ok(wraps>5);
});

test('tempo layers keep exact 2:1 ratios and the rhythm keeps accelerating',()=>{
  const s=createMotionState(),pulses=advanceMotion(s,{...zero,tempo:1},8);
  const t=tempoLayers(s).sort((a,b)=>a.rateBpm-b.rateBpm);for(let i=1;i<t.length;i++)assert.ok(Math.abs(t[i].rateBpm/t[i-1].rateBpm-2)<1e-9);
  assert.ok(pulses.length>20&&pulses.every(p=>p.gain>0&&p.gain<=1&&Number.isFinite(p.time)));
  const mid=pulses.filter(p=>p.layer===2),iv=mid.slice(1).map((p,i)=>p.time-mid[i].time);
  for(let i=1;i<iv.length;i++)assert.ok(iv[i]<=iv[i-1]+1e-6,'layer intervals shrink while accelerating');
  const still=createMotionState();assert.ok(advanceMotion(still,zero,4).length>0,'static tempo still plays a steady rhythm');
});

test('spatial cues: equal-power level, far ear delayed by at most 0.65 ms, distance mappings bounded',()=>{
  for(let i=0;i<200;i++){const s=createMotionState();advanceMotion(s,{pitch:1,tempo:-1,pan:1,distance:-1,spectrum:1},i*.037);const c=spatialCues(s);
    assert.ok(Math.abs(c.gainL**2+c.gainR**2-1)<1e-9);assert.ok(c.delayL>=0&&c.delayL<=MAX_ITD+1e-12&&c.delayR>=0&&c.delayR<=MAX_ITD+1e-12);assert.ok(c.delayL===0||c.delayR===0);
    assert.ok(c.distance>=0&&c.distance<=1&&c.level>=.25-1e-9&&c.level<=1&&c.cutoffHz>=2000-1e-6&&c.cutoffHz<=16000&&c.reverbSend>=.05&&c.reverbSend<=.55+1e-9);}
  const right=createMotionState();right.pan=.25;const c=spatialCues(right);assert.ok(Math.abs(c.azimuth-1)<1e-9);assert.ok(c.gainR>c.gainL);assert.equal(c.delayR,0);assert.ok(Math.abs(c.delayL-MAX_ITD)<1e-12);
});

test('opposed lanes stay finite at maximum speed for a long run',()=>{
  const s=createMotionState();advanceMotion(s,{pitch:1,tempo:-1,pan:-1,distance:1,spectrum:-1},600);
  for(const v of [s.pitch,s.tempo,s.pan,s.distance,s.spectrum])assert.ok(Number.isFinite(v));
  assert.ok(pitchLayers(48,s).every(l=>Number.isFinite(l.frequencyHz)&&Number.isFinite(l.gain)));
});
