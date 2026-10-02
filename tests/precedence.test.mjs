import test from 'node:test';
import assert from 'node:assert/strict';
import {PRECEDENCE_CLASSIC,normalizePrecedenceParams,buildPrecedencePair} from '../src/experiments/precedence.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic precedence fixture uses discrete 1 ms broadband bursts with a 3 ms lag',()=>{
  assert.deepEqual(PRECEDENCE_CLASSIC,{delayMs:3,first:'left',sourceType:'noise-burst',burstMs:1,repetitionMs:800,ildDb:0});
  const pair=buildPrecedencePair(PRECEDENCE_CLASSIC);
  assert.equal(pair.events.length,2);
  assert.deepEqual(pair.events.map(e=>e.side),['left','right']);
  assert.equal(pair.events[0].timeSeconds,0);
  assert.equal(pair.events[1].timeSeconds,.003);
  assert.equal(pair.events[0].stimulusId,pair.events[1].stimulusId);
  assert.equal(pair.events[0].sourceType,'noise-burst');
});

test('right-leading condition reverses space but preserves timing and identical stimulus',()=>{
  const pair=buildPrecedencePair({...PRECEDENCE_CLASSIC,first:'right'});
  assert.deepEqual(pair.events.map(e=>e.side),['right','left']);
  assert.deepEqual(pair.events.map(e=>e.timeSeconds),[0,.003]);
  assert.equal(pair.events[0].stimulusId,pair.events[1].stimulusId);
});

test('precedence normalization bounds fusion delay, transient duration and repetition interval',()=>{
  const p=normalizePrecedenceParams({delayMs:99,first:'bogus',sourceType:'bogus',burstMs:99,repetitionMs:1,ildDb:99});
  assert.equal(p.delayMs,40);
  assert.equal(p.first,'left');
  assert.equal(p.sourceType,'noise-burst');
  assert.equal(p.burstMs,20);
  assert.ok(p.repetitionMs>=250);
  assert.equal(p.ildDb,12);
});

test('catalog explains fusion, lead localization and speaker/headphone distinction',()=>{
  const exp=byId('precedence');
  assert.match(exp.description,/fusion/i);
  assert.match(exp.description,/lead|first-arriving/i);
  assert.match(exp.howToUse,/stereo speakers/i);
  assert.match(exp.howToUse,/headphones/i);
  assert.match(exp.whatToListenFor,/one|two/i);
  assert.equal(exp.classicParams.delayMs,3);
  assert.equal(exp.classicParams.burstMs,1);
});
