import test from 'node:test';
import assert from 'node:assert/strict';
import {SCALE_CLASSIC,SCALE_HISTORICAL_HZ,scalePitches,scaleDichoticEvents,renderScaleLoop,scaleLoopSeconds} from '../src/experiments/scale.js';
import {rms,magnitudeAt} from '../src/audio/render.js';
import {byId} from '../src/experiments/catalog.js';
const semis=(a,b)=>Math.abs(12*Math.log2(a/b));

test('Classic scale uses the historical Deutsch 1975 frequencies at 250 ms per position',()=>{
  assert.deepEqual([...SCALE_HISTORICAL_HZ],[259,290,326,345,388,435,488,517]);
  assert.deepEqual(scalePitches(SCALE_CLASSIC),[...SCALE_HISTORICAL_HZ]);
  assert.equal(SCALE_CLASSIC.positionSeconds,.25);
  assert.equal(scaleLoopSeconds(SCALE_CLASSIC),2);
});

test('every position has one ascending tone in one ear and the descending tone in the other, alternating ears',()=>{
  const ev=scaleDichoticEvents(SCALE_CLASSIC);
  assert.equal(ev.length,16);
  for(let i=0;i<8;i++){
    const pos=ev.filter(e=>e.position===i);
    assert.equal(pos.length,2);
    assert.notEqual(pos[0].channel,pos[1].channel);
    const asc=pos.find(e=>e.line==='ascending'),desc=pos.find(e=>e.line==='descending');
    assert.equal(asc.frequencyHz,SCALE_HISTORICAL_HZ[i]);assert.equal(desc.frequencyHz,SCALE_HISTORICAL_HZ[7-i]);
    assert.equal(asc.channel,i%2===0?'right':'left');
  }
});

test('each isolated ear leaps while the regrouped higher and lower lines are stepwise',()=>{
  const ev=scaleDichoticEvents(SCALE_CLASSIC);
  for(const ch of ['left','right']){
    const seq=ev.filter(e=>e.channel===ch).sort((a,b)=>a.position-b.position).map(e=>e.frequencyHz);
    const maxLeap=Math.max(...seq.slice(1).map((f,i)=>semis(f,seq[i])));
    assert.ok(maxLeap>=5,`${ch} should leap, max ${maxLeap}`);
  }
  for(let i=0;i<8;i++){const pair=ev.filter(e=>e.position===i).map(e=>e.frequencyHz);const hi=Math.max(...pair),lo=Math.min(...pair);if(i>0){const prev=ev.filter(e=>e.position===i-1).map(e=>e.frequencyHz);assert.ok(semis(hi,Math.max(...prev))<=2.2);assert.ok(semis(lo,Math.min(...prev))<=2.2)}}
});

test('rendered loop has energy in both ears at every position and correct tones in the right ear',()=>{
  const r=renderScaleLoop(SCALE_CLASSIC,48000),sr=r.sampleRate,q=Math.round(.25*sr),m=Math.round(.015*sr);
  for(let i=0;i<8;i++){assert.ok(rms(r.left,i*q+m,(i+1)*q-m)>.05);assert.ok(rms(r.right,i*q+m,(i+1)*q-m)>.05)}
  assert.ok(magnitudeAt(r.right,sr,259,m,q-m)>.08);assert.ok(magnitudeAt(r.right,sr,517,m,q-m)<.01);
  assert.ok(magnitudeAt(r.left,sr,517,m,q-m)>.08);
  assert.equal(r.frames,2*sr);
});

test('equal-tempered Lab tuning and channel swap work',()=>{
  const eq=scalePitches({tuning:'equal'});assert.ok(Math.abs(eq[0]-261.63)<.01);assert.ok(Math.abs(eq[7]-523.25)<.01);
  assert.equal(scaleDichoticEvents({...SCALE_CLASSIC,channelSwap:true}).find(e=>e.position===0&&e.line==='ascending').channel,'left');
});

test('catalog entry explains the regrouping and headphone requirement',()=>{
  const e=byId('scale');assert.equal(e.outputGuidance,'headphones');
  assert.match(e.description,/ascending/i);assert.match(e.howToUse,/headphones/i);assert.match(e.whatToListenFor,/higher/i);
  assert.deepEqual(e.classicParams,SCALE_CLASSIC);
});
