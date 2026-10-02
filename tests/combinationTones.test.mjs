import test from 'node:test';
import assert from 'node:assert/strict';
import {COMBINATION_TONES_CLASSIC, normalizeCombinationToneParams, buildCombinationToneStimulus, predictedCombinationProducts} from '../src/experiments/combinationTones.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic combination-tone fixture contains exactly two sine primaries',()=>{
  assert.deepEqual(COMBINATION_TONES_CLASSIC,{f1:700,f2:900,level:.16,balance:0,waveform:'sine'});
  const s=buildCombinationToneStimulus(COMBINATION_TONES_CLASSIC);
  assert.equal(s.voices.length,2);
  assert.deepEqual(s.voices.map(v=>v.frequencyHz),[700,900]);
  assert.ok(s.voices.every(v=>v.waveform==='sine'));
  assert.ok(!s.voices.some(v=>[200,500,1100].includes(v.frequencyHz)));
});

test('predicted products are calculated but not synthesized',()=>{
  const products=predictedCombinationProducts(700,900);
  assert.deepEqual(products,{differenceHz:200,twoF1MinusF2Hz:500,twoF2MinusF1Hz:1100});
  const s=buildCombinationToneStimulus(COMBINATION_TONES_CLASSIC);
  const generated=new Set(s.voices.map(v=>v.frequencyHz));
  for(const frequency of Object.values(products))assert.equal(generated.has(frequency),false);
});

test('normalization orders primaries, clamps level and keeps balance bipolar',()=>{
  const p=normalizeCombinationToneParams({f1:1200,f2:400,level:9,balance:-9,waveform:'square'});
  assert.equal(p.f1,400);
  assert.equal(p.f2,1200);
  assert.equal(p.level,.18);
  assert.equal(p.balance,-1);
  assert.equal(p.waveform,'square');
});

test('balance changes only primary gains, not product calculation or frequency content',()=>{
  const left=buildCombinationToneStimulus({...COMBINATION_TONES_CLASSIC,balance:-1});
  const right=buildCombinationToneStimulus({...COMBINATION_TONES_CLASSIC,balance:1});
  assert.deepEqual(left.voices.map(v=>v.frequencyHz),right.voices.map(v=>v.frequencyHz));
  assert.ok(left.voices[0].gain>left.voices[1].gain);
  assert.ok(right.voices[0].gain<right.voices[1].gain);
  assert.deepEqual(left.predictedProducts,right.predictedProducts);
});

test('catalog explains that predicted products are auditory and absent from the digital stimulus',()=>{
  const exp=byId('combination-tones');
  assert.match(exp.description,/not intentionally present/i);
  assert.match(exp.howToUse,/headphones|speakers/i);
  assert.match(exp.whatToListenFor,/2f1|difference tone/i);
  assert.equal(exp.classicParams.waveform,'sine');
  assert.equal(exp.classicParams.balance,0);
});
