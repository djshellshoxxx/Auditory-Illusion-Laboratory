import test from 'node:test';
import assert from 'node:assert/strict';
import {STREAMING_CLASSIC,streamingEvents,renderStreamingCycle,normalizeStreamingParams,streamingBoundaryPoints,streamingCycleSeconds} from '../src/experiments/streaming.js';
import {rms,magnitudeAt} from '../src/audio/render.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic pattern is exactly A B A rest with equal 120 ms slots and a bistable 6-semitone separation',()=>{
  const ev=streamingEvents(STREAMING_CLASSIC);assert.deepEqual(ev.map(e=>e.label),['A','B','A','rest']);
  assert.deepEqual(ev.map(e=>+e.time.toFixed(6)),[0,.12,.24,.36]);assert.equal(streamingCycleSeconds(STREAMING_CLASSIC),.48);
  const n=normalizeStreamingParams(STREAMING_CLASSIC);assert.equal(n.aHz,440);assert.ok(Math.abs(n.bHz-622.254)<.01);
});

test('rest slot renders to exact digital zero and tones sit in their slots',()=>{
  const r=renderStreamingCycle(STREAMING_CLASSIC,48000),sr=48000,slot=Math.round(.12*sr);
  for(let i=3*slot;i<4*slot;i++){assert.equal(r.left[i],0);assert.equal(r.right[i],0)}
  for(let i=Math.round(.05*sr);i<slot;i++)assert.equal(r.left[i],0); // tone is 50 ms inside a 120 ms slot
  assert.ok(magnitudeAt(r.left,sr,440,0,Math.round(.05*sr))>.03);assert.ok(magnitudeAt(r.left,sr,622.254,slot,slot+Math.round(.05*sr))>.03);
  assert.ok(rms(r.left,0,Math.round(.05*sr))>.02);
});

test('separation and rate are independent and stereo/level differences apply',()=>{
  const a=normalizeStreamingParams({...STREAMING_CLASSIC,separationSemitones:12}),b=normalizeStreamingParams({...STREAMING_CLASSIC,slotMs:80});
  assert.equal(a.slotMs,120);assert.ok(Math.abs(a.bHz-880)<1e-9);assert.equal(b.separationSemitones,6);assert.equal(b.slotMs,80);
  const r=renderStreamingCycle({...STREAMING_CLASSIC,stereoSeparation:1},48000),slot=Math.round(.12*48000);
  assert.ok(rms(r.left,0,slot)>rms(r.right,0,slot)*5);assert.ok(rms(r.right,slot,2*slot)>rms(r.left,slot,2*slot)*5);
  const q=renderStreamingCycle({...STREAMING_CLASSIC,levelDifferenceDb:-12},48000);assert.ok(rms(q.left,slot,2*slot)<rms(q.left,0,slot)*.3);
  assert.equal(normalizeStreamingParams({a:440,b:659.25,rate:6}).slotMs.toFixed(2),'166.67');
});

test('boundary map extracts settings and response from stored reports',()=>{
  const pts=streamingBoundaryPoints([{experimentId:'streaming',params:{...STREAMING_CLASSIC,separationSemitones:9},response:'two-streams'},{params:{},response:'junk'}]);
  assert.deepEqual(pts,[{separationSemitones:9,slotMs:120,response:'two-streams'}]);
});

test('catalog explains ABA_ and bistability',()=>{const e=byId('streaming');assert.match(e.description,/ABA|A-B-A/i);assert.match(e.whatToListenFor,/gallop/i);assert.deepEqual(e.classicParams,STREAMING_CLASSIC)});
