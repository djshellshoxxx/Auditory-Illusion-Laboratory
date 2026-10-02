import test from 'node:test';
import assert from 'node:assert/strict';
import {phantomWordSchedule} from '../src/audio/core.js';
import {experiments} from '../src/experiments/catalog.js';

test('phantom words schedule presents the same two-token sequence to both channels with a one-token offset',()=>{
  const s=phantomWordSchedule(['no','way'],0.4,3);
  assert.equal(s.length,12);
  const left=s.filter(e=>e.channel==='left');
  const right=s.filter(e=>e.channel==='right');
  assert.deepEqual(left.map(e=>e.token),['no','way','no','way','no','way']);
  assert.deepEqual(right.map(e=>e.token),['way','no','way','no','way','no']);
  for(let i=0;i<left.length;i++) assert.equal(right[i].time-left[i].time,0);
  assert.equal(left[1].time-left[0].time,0.4);
});

test('phantom words schedule is deterministic and alternates simultaneous opposite tokens',()=>{
  const s=phantomWordSchedule(['high','low'],0.25,2);
  for(let t=0;t<4;t++){
    const pair=s.filter(e=>e.time===t*0.25);
    assert.equal(pair.length,2);
    assert.notEqual(pair[0].token,pair[1].token);
  }
});

test('phantom words catalog entry explains the illusion and loudspeaker setup',()=>{
  const exp=experiments.find(e=>e.id==='phantom-words');
  assert.ok(exp);
  assert.match(exp.description,/speech|word/i);
  assert.match(exp.howToUse,/speaker/i);
  assert.match(exp.howToUse,/headphones/i);
  assert.match(exp.whatToListenFor,/word|phrase|stream/i);
  assert.equal(exp.outputGuidance,'stereo-speakers');
  assert.equal(exp.classicParams.tokenPeriod,.4);
  assert.equal(exp.classicParams.repetitions,24);
});
