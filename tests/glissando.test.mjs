import test from 'node:test';
import assert from 'node:assert/strict';
import {GLISSANDO_CLASSIC, glissandoFrequencyAt, glissandoSpeakerAt} from '../src/experiments/glissando.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic Glissando fixture matches published reference values',()=>{
  assert.equal(GLISSANDO_CLASSIC.fixedHz,262);
  assert.equal(GLISSANDO_CLASSIC.lowHz,131);
  assert.equal(GLISSANDO_CLASSIC.highHz,523);
  assert.equal(GLISSANDO_CLASSIC.cycleSeconds,2.5);
  assert.equal(GLISSANDO_CLASSIC.swapSeconds,.238);
});

test('glissando completes low-high-low in one 2.5 second cycle',()=>{
  const p=GLISSANDO_CLASSIC;
  assert.equal(glissandoFrequencyAt(0,p),131);
  assert.ok(Math.abs(glissandoFrequencyAt(1.25,p)-523)<1e-9);
  assert.ok(Math.abs(glissandoFrequencyAt(2.5,p)-131)<1e-9);
  assert.ok(glissandoFrequencyAt(.625,p)>131 && glissandoFrequencyAt(.625,p)<523);
  assert.ok(glissandoFrequencyAt(1.875,p)>131 && glissandoFrequencyAt(1.875,p)<523);
});

test('fixed tone and glide exchange opposite speakers every 238 ms',()=>{
  const p=GLISSANDO_CLASSIC;
  assert.deepEqual(glissandoSpeakerAt(0,p),{fixed:'left',glide:'right'});
  assert.deepEqual(glissandoSpeakerAt(.237,p),{fixed:'left',glide:'right'});
  assert.deepEqual(glissandoSpeakerAt(.238,p),{fixed:'right',glide:'left'});
  assert.deepEqual(glissandoSpeakerAt(.476,p),{fixed:'left',glide:'right'});
});

test('Glissando page explains speaker setup and listening target',()=>{
  const exp=byId('glissando');
  assert.match(exp.description,/oboe/i);
  assert.match(exp.howToUse,/loudspeaker/i);
  assert.match(exp.howToUse,/reverberant/i);
  assert.match(exp.howToUse,/Headphones/i);
  assert.match(exp.whatToListenFor,/238 ms/i);
  assert.equal(exp.classicParams.fixedHz,262);
  assert.equal(exp.classicParams.lowHz,131);
  assert.equal(exp.classicParams.highHz,523);
});
