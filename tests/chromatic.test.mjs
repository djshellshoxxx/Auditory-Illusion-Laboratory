import test from 'node:test';
import assert from 'node:assert/strict';
import {CHROMATIC_CLASSIC,chromaticMidi,chromaticDichoticEvents,chromaticLoopSeconds,renderChromaticLoop} from '../src/experiments/chromatic.js';
import {rms,magnitudeAt} from '../src/audio/render.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic chromatic set spans two octaves C4–C6 at 250 ms per position',()=>{
  assert.deepEqual(chromaticMidi(CHROMATIC_CLASSIC),Array.from({length:25},(_,i)=>60+i));
  assert.equal(CHROMATIC_CLASSIC.positionSeconds,.25);
  assert.equal(chromaticLoopSeconds(CHROMATIC_CLASSIC),12.5); // two 25-position cycles keep alternation continuous
  assert.equal(chromaticMidi({spanOctaves:1}).length,13);
});

test('ascending and descending lines are reciprocal and ears alternate through the cycle boundary',()=>{
  const ev=chromaticDichoticEvents(CHROMATIC_CLASSIC);
  assert.equal(ev.length,100);
  for(let k=0;k<50;k++){
    const pos=ev.filter(e=>e.position===k);assert.equal(pos.length,2);assert.notEqual(pos[0].channel,pos[1].channel);
    const asc=pos.find(e=>e.line==='ascending'),desc=pos.find(e=>e.line==='descending');
    assert.equal(asc.midi,60+(k%25));assert.equal(desc.midi,84-(k%25));
    assert.equal(asc.channel,k%2===0?'right':'left');
  }
});

test('isolated ears leap while regrouped lines move by semitone',()=>{
  const ev=chromaticDichoticEvents(CHROMATIC_CLASSIC);
  for(const ch of ['left','right']){const seq=ev.filter(e=>e.channel===ch).sort((a,b)=>a.position-b.position).map(e=>e.midi);assert.ok(Math.max(...seq.slice(1).map((m,i)=>Math.abs(m-seq[i])))>=10)}
  for(let k=1;k<25;k++){const a=ev.filter(e=>e.position===k).map(e=>e.midi),b=ev.filter(e=>e.position===k-1).map(e=>e.midi);assert.equal(Math.abs(Math.max(...a)-Math.max(...b)),1);assert.equal(Math.abs(Math.min(...a)-Math.min(...b)),1)}
});

test('render has both ears active at every position with C4 in the right ear first',()=>{
  const r=renderChromaticLoop(CHROMATIC_CLASSIC,48000),sr=r.sampleRate,q=Math.round(.25*sr),m=Math.round(.015*sr);
  assert.equal(r.frames,Math.round(12.5*sr));
  for(let i=0;i<50;i++){assert.ok(rms(r.left,i*q+m,(i+1)*q-m)>.05);assert.ok(rms(r.right,i*q+m,(i+1)*q-m)>.05)}
  assert.ok(magnitudeAt(r.right,sr,261.63,m,q-m)>.08);assert.ok(magnitudeAt(r.left,sr,1046.5,m,q-m)>.08);assert.ok(magnitudeAt(r.right,sr,1046.5,m,q-m)<.01);
});

test('catalog entry explains the two-octave stimulus and regrouping',()=>{
  const e=byId('chromatic');assert.equal(e.outputGuidance,'headphones');
  assert.match(e.description,/two octaves/i);assert.match(e.howToUse,/headphones/i);assert.match(e.whatToListenFor,/higher/i);
  assert.deepEqual(e.classicParams,CHROMATIC_CLASSIC);
});
