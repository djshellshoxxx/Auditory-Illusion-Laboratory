import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSING_FUNDAMENTAL_CLASSIC, buildMissingFundamentalComponents, normalizeMissingFundamentalParams} from '../src/experiments/missingFundamental.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic Missing Fundamental fixture uses low resolved harmonics and omits f0',()=>{
  assert.equal(MISSING_FUNDAMENTAL_CLASSIC.f0,110);
  assert.equal(MISSING_FUNDAMENTAL_CLASSIC.firstHarmonic,2);
  assert.equal(MISSING_FUNDAMENTAL_CLASSIC.lastHarmonic,8);
  const components=buildMissingFundamentalComponents(MISSING_FUNDAMENTAL_CLASSIC);
  assert.deepEqual(components.map(x=>x.harmonic),[2,3,4,5,6,7,8]);
  assert.deepEqual(components.map(x=>x.frequencyHz),[220,330,440,550,660,770,880]);
  assert.ok(!components.some(x=>x.frequencyHz===110));
});

test('component gains are finite and phase modes never reintroduce the missing f0',()=>{
  for(const phaseMode of ['sine','alternating','random']){
    const p={...MISSING_FUNDAMENTAL_CLASSIC,phaseMode,amplitudeRolloffDbPerOctave:6};
    const components=buildMissingFundamentalComponents(p,12345);
    assert.ok(components.every(x=>Number.isFinite(x.gain)&&x.gain>0&&x.gain<=1));
    assert.ok(components.every(x=>Number.isFinite(x.phaseRadians)));
    assert.ok(!components.some(x=>x.frequencyHz===p.f0));
  }
});

test('parameter normalization keeps the generated spectrum below Nyquist and harmonic range valid',()=>{
  const p=normalizeMissingFundamentalParams({f0:5000,firstHarmonic:1,lastHarmonic:40,amplitudeRolloffDbPerOctave:99,phaseMode:'bogus'},48000);
  assert.ok(p.firstHarmonic>=2);
  assert.ok(p.lastHarmonic>=p.firstHarmonic);
  assert.ok(p.f0*p.lastHarmonic<24000);
  assert.equal(p.phaseMode,'sine');
  assert.ok(p.amplitudeRolloffDbPerOctave<=18);
});

test('catalog explains physical harmonics, absent f0, and listener variability',()=>{
  const exp=byId('missing-fundamental');
  assert.match(exp.description,/physically absent/i);
  assert.match(exp.howToUse,/110 Hz/i);
  assert.match(exp.whatToListenFor,/110 Hz/i);
  assert.match(exp.whatToListenFor,/individual/i);
  assert.equal(exp.classicParams.f0,110);
  assert.equal(exp.classicParams.firstHarmonic,2);
  assert.equal(exp.classicParams.lastHarmonic,8);
});
