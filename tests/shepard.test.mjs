import test from 'node:test';
import assert from 'node:assert/strict';
import {SHEPARD_CLASSIC,shepardTone,shepardSequence,shepardCycleSeconds,spectralCentroidOctaves,renderShepardCycle} from '../src/experiments/shepard.js';
import {rms} from '../src/audio/render.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic Shepard tone is exact octave components under a fixed envelope',()=>{
  const c=shepardTone(0,SHEPARD_CLASSIC);
  assert.equal(c.length,10);
  assert.ok(Math.abs(c[0].frequencyHz-32.703)<.01);
  for(let i=1;i<c.length;i++)assert.ok(Math.abs(c[i].frequencyHz/c[i-1].frequencyHz-2)<1e-12);
  const peak=c.reduce((a,b)=>b.gain>a.gain?b:a);assert.ok(peak.frequencyHz>500&&peak.frequencyHz<2100);
});

test('sequence is twelve semitone steps of 500 ms and the wrap re-enters only a near-silent component',()=>{
  const seq=shepardSequence(SHEPARD_CLASSIC);
  assert.equal(seq.length,12);assert.equal(shepardCycleSeconds(SHEPARD_CLASSIC),6);
  assert.deepEqual(seq.map(s=>s.name),['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']);
  for(let i=1;i<12;i++)assert.ok(Math.abs(seq[i].components[0].frequencyHz/seq[i-1].components[0].frequencyHz-Math.pow(2,1/12))<1e-9);
  // wrap: B's component k continues as C's component k+1 up a semitone; C's k=0 is new
  const B=seq[11].components,C=seq[0].components;
  for(let k=0;k<9;k++)assert.ok(Math.abs(C[k+1].frequencyHz/B[k].frequencyHz-Math.pow(2,1/12))<1e-9);
  assert.ok(C[0].gain<.01,`re-entering component gain ${C[0].gain}`);assert.ok(B[9].gain<.01);
});

test('spectral centroid stays fixed across pitch classes',()=>{
  const cents=shepardSequence(SHEPARD_CLASSIC).map(s=>spectralCentroidOctaves(s.components));
  assert.ok(Math.max(...cents)-Math.min(...cents)<.01);
});

test('descending is the exact reverse and step size changes the cycle',()=>{
  const down=shepardSequence({...SHEPARD_CLASSIC,direction:-1}).map(s=>s.name);
  assert.deepEqual(down,['C','B','A#','A','G#','G','F#','F','E','D#','D','C#']);
  assert.equal(shepardSequence({...SHEPARD_CLASSIC,stepSemitones:2}).length,6);
});

test('rendered cycle is mono-identical with energy in every 500 ms step',()=>{
  const r=renderShepardCycle(SHEPARD_CLASSIC,48000),sr=r.sampleRate,q=Math.round(.5*sr),m=Math.round(.02*sr);
  assert.equal(r.frames,6*sr);
  for(let i=0;i<12;i++)assert.ok(rms(r.left,i*q+m,(i+1)*q-m)>.01);
  for(let i=0;i<r.frames;i+=997)assert.equal(r.left[i],r.right[i]);
});

test('catalog explains construction and listening',()=>{
  const e=byId('shepard');assert.match(e.description,/octave/i);assert.match(e.howToUse,/Start/);assert.match(e.whatToListenFor,/ris/i);
  assert.deepEqual(e.classicParams,SHEPARD_CLASSIC);
});
