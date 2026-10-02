import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTINUITY_CLASSIC,continuitySchedule,renderContinuityCycle} from '../src/experiments/continuity.js';
import {rms,magnitudeAt} from '../src/audio/render.js';
import {byId} from '../src/experiments/catalog.js';
const sr=48000,g0=Math.round(.45*sr),g1=Math.round(.7*sr);

test('Classic schedule exposes three conditions with a 250 ms gap at 0.45 s of a 1.2 s cycle',()=>{
  assert.equal(CONTINUITY_CLASSIC.condition,'masked');assert.equal(CONTINUITY_CLASSIC.gapMs,250);
  const c=continuitySchedule({...CONTINUITY_CLASSIC,condition:'continuous'}).segments;assert.deepEqual(c,[{kind:'target',start:0,end:1.2}]);
  const m=continuitySchedule(CONTINUITY_CLASSIC).segments;assert.ok(m.some(s=>s.kind==='target-absent'&&s.start===.45&&s.end===.7));assert.ok(m.some(s=>s.kind==='masker'));
  assert.ok(!continuitySchedule({...CONTINUITY_CLASSIC,condition:'silent-gap'}).segments.some(s=>s.kind==='masker'));
});

test('target samples are exactly zero in the gap for silent-gap and masked conditions, non-zero when continuous',()=>{
  for(const condition of ['silent-gap','masked']){const r=renderContinuityCycle({...CONTINUITY_CLASSIC,condition},sr);for(let i=g0;i<g1;i++)assert.equal(r.target[i],0,`${condition} target leak at ${i}`);assert.ok(rms(r.target,0,g0-240)>.05);assert.ok(rms(r.target,g1+240,r.frames)>.05)}
  const c=renderContinuityCycle({...CONTINUITY_CLASSIC,condition:'continuous'},sr);assert.ok(rms(c.target,g0,g1)>.05);assert.equal(rms(c.masker),0);
});

test('masker exists only inside the gap and only in the masked condition, and masks the target band',()=>{
  const r=renderContinuityCycle(CONTINUITY_CLASSIC,sr);
  for(let i=0;i<g0;i++)assert.equal(r.masker[i],0);for(let i=g1;i<r.frames;i++)assert.equal(r.masker[i],0);
  assert.ok(rms(r.masker,g0,g1)>.15);assert.equal(rms(renderContinuityCycle({...CONTINUITY_CLASSIC,condition:'silent-gap'},sr).masker),0);
  const white=magnitudeAt(r.masker,sr,1000,g0+300,g1-300),bp=magnitudeAt(renderContinuityCycle({...CONTINUITY_CLASSIC,maskerType:'bandpass'},sr).masker,sr,1000,g0+300,g1-300),notch=magnitudeAt(renderContinuityCycle({...CONTINUITY_CLASSIC,maskerType:'notched'},sr).masker,sr,1000,g0+300,g1-300);
  assert.ok(bp>white*2,`bandpass ${bp} vs white ${white}`);assert.ok(notch<white*.3,`notch ${notch} vs white ${white}`);
  for(let i=0;i<r.frames;i+=1013)assert.equal(r.left[i],r.target[i]+r.masker[i]);
});

test('catalog describes three conditions and physical absence',()=>{const e=byId('continuity');assert.match(e.description,/exactly zero|absent/i);assert.match(e.howToUse,/three/i);assert.deepEqual(e.classicParams,CONTINUITY_CLASSIC)});
