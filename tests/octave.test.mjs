import test from 'node:test';
import assert from 'node:assert/strict';
import {OCTAVE_CLASSIC,octaveStates,octaveLoopSeconds,renderOctaveLoop,normalizeOctaveParams} from '../src/experiments/octave.js';
import {rms,magnitudeAt} from '../src/audio/render.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic octave fixture is 400/800 Hz at 250 ms per state with complementary ears',()=>{
  assert.deepEqual(OCTAVE_CLASSIC,{lowHz:400,highHz:800,stateSeconds:.25,levelDifferenceDb:0,channelSwap:false});
  const s=octaveStates(OCTAVE_CLASSIC);
  assert.deepEqual(s,[{duration:.25,left:400,right:800},{duration:.25,left:800,right:400}]);
  assert.equal(octaveLoopSeconds(OCTAVE_CLASSIC),.5);
});

test('rendered Classic loop has no silent gaps in either ear',()=>{
  const r=renderOctaveLoop(OCTAVE_CLASSIC,48000);
  const win=Math.round(.01*r.sampleRate);
  for(let s=0;s+win<=r.frames;s+=win){
    assert.ok(rms(r.left,s,s+win)>.04,`left silent near ${s/r.sampleRate}s`);
    assert.ok(rms(r.right,s,s+win)>.04,`right silent near ${s/r.sampleRate}s`);
  }
});

test('ears swap frequencies exactly at the 250 ms state boundary',()=>{
  const r=renderOctaveLoop(OCTAVE_CLASSIC,48000),sr=r.sampleRate,q=Math.round(.25*sr),m=Math.round(.01*sr);
  const A=(ch,f,from,to)=>magnitudeAt(ch,sr,f,from,to);
  // inside state A (avoid the 3 ms crossfades)
  assert.ok(A(r.left,400,m,q-m)>.1&&A(r.left,800,m,q-m)<.01);
  assert.ok(A(r.right,800,m,q-m)>.1&&A(r.right,400,m,q-m)<.01);
  // inside state B
  assert.ok(A(r.left,800,q+m,2*q-m)>.1&&A(r.left,400,q+m,2*q-m)<.01);
  assert.ok(A(r.right,400,q+m,2*q-m)>.1&&A(r.right,800,q+m,2*q-m)<.01);
});

test('loop wrap is sample-continuous for the Classic pair',()=>{
  const r=renderOctaveLoop(OCTAVE_CLASSIC,48000);
  // last sample of loop followed by first sample should be a small step (continuous 400 Hz sine at .12 gain)
  const step=Math.abs(r.left[0]-r.left[r.frames-1]);
  assert.ok(step<.12*2*Math.PI*800/48000*1.5,`wrap step ${step}`);
});

test('lab normalization keeps high above low and honours legacy keys',()=>{
  const p=normalizeOctaveParams({low:500,high:300,rate:8});
  assert.equal(p.lowHz,500);assert.equal(p.highHz,1000);assert.equal(p.stateSeconds,.125);
  assert.deepEqual(octaveStates({...OCTAVE_CLASSIC,channelSwap:true})[0],{duration:.25,left:800,right:400});
});

test('catalog entry documents the dichotic structure and headphone requirement',()=>{
  const e=byId('octave');
  assert.equal(e.outputGuidance,'headphones');
  assert.match(e.description,/400/);assert.match(e.description,/800/);
  assert.match(e.howToUse,/headphones/i);
  assert.match(e.whatToListenFor,/high/i);
  assert.deepEqual(e.classicParams,OCTAVE_CLASSIC);
});
