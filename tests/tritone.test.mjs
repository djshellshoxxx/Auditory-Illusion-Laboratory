import test from 'node:test';
import assert from 'node:assert/strict';
import {TRITONE_CLASSIC,tritoneTone,tritonePair,tritoneTrialOrder,renderTritonePair,aggregateTritoneResponses} from '../src/experiments/tritone.js';
import {rms,magnitudeAt} from '../src/audio/render.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic tritone tone: six exact octave components straddling the 370 Hz envelope',()=>{
  const c=tritoneTone(0,TRITONE_CLASSIC);assert.equal(c.length,6);
  for(let i=1;i<6;i++)assert.ok(Math.abs(c[i].frequencyHz/c[i-1].frequencyHz-2)<1e-12);
  const logs=c.map(x=>Math.log2(x.frequencyHz/370));assert.ok(Math.min(...logs)<-2&&Math.max(...logs)>2);
  assert.ok(c.every(x=>{const st=12*Math.log2(x.frequencyHz/261.6256)%12;return Math.abs(st)<1e-4||Math.abs(st-12)<1e-4}));
  const peak=c.reduce((a,b)=>b.gain>a.gain?b:a);assert.ok(peak.frequencyHz>200&&peak.frequencyHz<600);
});

test('pairs are exactly six semitones apart in pitch class and the run covers all twelve classes once',()=>{
  for(let pc=0;pc<12;pc++){const [a,b]=tritonePair(pc);assert.equal((b-a+12)%12,6)}
  const order=tritoneTrialOrder(TRITONE_CLASSIC);assert.deepEqual([...order].sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i));
  assert.deepEqual(tritoneTrialOrder(TRITONE_CLASSIC),order);assert.notDeepEqual(tritoneTrialOrder({...TRITONE_CLASSIC,seed:7}),order);
  assert.deepEqual(tritoneTrialOrder({order:'sequential'}),Array.from({length:12},(_,i)=>i));
});

test('rendered pair is two 500 ms tones with no silent gap at the junction',()=>{
  const r=renderTritonePair(0,TRITONE_CLASSIC,48000),sr=r.sampleRate,T=Math.round(.5*sr);
  assert.equal(r.frames,2*T);
  // each tone has its own 50 ms ramps, so the junction dips but there is no silent interval: within ±30 ms there is clear energy
  assert.ok(rms(r.left,T-Math.round(.03*sr),T+Math.round(.03*sr))>.004,'junction should not be silent');
  let zeros=0,maxZeros=0;for(let n=T-Math.round(.03*sr);n<T+Math.round(.03*sr);n++){zeros=Math.abs(r.left[n])<1e-9?zeros+1:0;maxZeros=Math.max(maxZeros,zeros)}assert.ok(maxZeros<=2,`silent run ${maxZeros} samples`);
  const c1=tritoneTone(0,TRITONE_CLASSIC),c2=tritoneTone(6,TRITONE_CLASSIC);
  const peak1=c1.reduce((a,b)=>b.gain>a.gain?b:a),peak2=c2.reduce((a,b)=>b.gain>a.gain?b:a);
  assert.ok(magnitudeAt(r.left,sr,peak1.frequencyHz,Math.round(.1*sr),Math.round(.4*sr))>.01);
  assert.ok(magnitudeAt(r.left,sr,peak2.frequencyHz,T+Math.round(.1*sr),T+Math.round(.4*sr))>.01);
  assert.ok(magnitudeAt(r.left,sr,peak2.frequencyHz,Math.round(.1*sr),Math.round(.4*sr))<.002);
});

test('aggregation keys judgments by first pitch class',()=>{
  const m=aggregateTritoneResponses([{response:{firstPitchClass:3,judgment:'up'}},{response:{firstPitchClass:3,judgment:'down'}},{response:{firstPitchClass:15,judgment:'ambiguous'}},{response:'junk'}]);
  assert.deepEqual(m[3],{pitchClass:3,name:'D#',up:1,down:1,ambiguous:1});assert.equal(m[0].up,0);
});

test('catalog documents construction and the no-right-answer policy',()=>{const e=byId('tritone');assert.match(e.description,/six/i);assert.match(e.whatToListenFor,/no (right|correct)/i);assert.deepEqual(e.classicParams,TRITONE_CLASSIC)});
