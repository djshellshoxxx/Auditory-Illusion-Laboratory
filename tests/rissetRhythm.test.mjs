import test from 'node:test';
import assert from 'node:assert/strict';
import {RISSET_RHYTHM_CLASSIC,rissetRhythmState,rhythmNextWrapTime,rhythmCycleSeconds,createRissetRhythmSequencer,pulseKept} from '../src/experiments/rissetRhythm.js';
import {byId} from '../src/experiments/catalog.js';
const P=RISSET_RHYTHM_CLASSIC;

test('Classic layers keep exact 2:1 rate ratios and wrap independently at zero gain',()=>{
  const s0=rissetRhythmState(0,P);assert.deepEqual(s0.map(l=>+l.rateBpm.toFixed(3)),[22.5,45,90,180,360]);
  for(const t of [3.3,17,41.9]){const s=rissetRhythmState(t,P).sort((a,b)=>a.rateBpm-b.rateBpm);for(let i=1;i<5;i++)assert.ok(Math.abs(s[i].rateBpm/s[i-1].rateBpm-2)<1e-9)}
  const wraps=Array.from({length:5},(_,k)=>rhythmNextWrapTime(k,0,P));assert.equal(new Set(wraps.map(w=>w.toFixed(5))).size,5);
  for(let k=0;k<5;k++){const w=wraps[k];assert.ok(rissetRhythmState(w-1e-4,P)[k].gain<1e-3);assert.ok(rissetRhythmState(w+1e-4,P)[k].gain<1e-3)}
  assert.equal(rhythmCycleSeconds(P),50);
});

test('sequencer pulses accelerate within a layer and match the instantaneous rate',()=>{
  const seq=createRissetRhythmSequencer(P),pulses=seq.pulsesUntil(12);
  const mid=pulses.filter(q=>q.layer===2);assert.ok(mid.length>15);
  const iv=mid.slice(1).map((q,i)=>q.time-mid[i].time);
  for(let i=1;i<iv.length;i++)assert.ok(iv[i]<iv[i-1]+1e-6,'intervals should shrink while accelerating');
  const expected=60/rissetRhythmState((mid[5].time+mid[6].time)/2,P)[2].rateBpm;assert.ok(Math.abs(iv[5]-expected)/expected<.01);
  assert.ok(pulses.every(q=>q.gain>0&&q.gain<=1));
});

test('density mask is deterministic and removes roughly the requested fraction',()=>{
  assert.ok(Array.from({length:200},(_,i)=>pulseKept(i,1)).every(Boolean));
  const kept=Array.from({length:1000},(_,i)=>pulseKept(i,.5)).filter(Boolean).length;assert.ok(kept>450&&kept<550);
  const a=createRissetRhythmSequencer({...P,density:.5}).pulsesUntil(10).length,b=createRissetRhythmSequencer(P).pulsesUntil(10).length;assert.ok(a<b*.65&&a>b*.35);
});

test('catalog documents independent layer wrap and listening',()=>{const e=byId('risset-rhythm');assert.match(e.description,/2:1|doubl|octave/i);assert.deepEqual(e.classicParams,RISSET_RHYTHM_CLASSIC)});
