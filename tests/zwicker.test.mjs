import test from 'node:test';
import assert from 'node:assert/strict';
import {ZWICKER_CLASSIC, zwickerNotchEdges, zwickerPhaseAt} from '../src/experiments/zwicker.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic Zwicker preset uses the research-supported 4 kHz one-octave notch',()=>{
  assert.equal(ZWICKER_CLASSIC.centerHz,4000);
  assert.equal(ZWICKER_CLASSIC.notchOctaves,1);
  assert.equal(ZWICKER_CLASSIC.noiseSeconds,5);
  assert.equal(ZWICKER_CLASSIC.listenSeconds,4);
});

test('one-octave notch edges are geometrically centered around 4 kHz',()=>{
  const {lowHz,highHz}=zwickerNotchEdges(4000,1);
  assert.ok(Math.abs(lowHz-(4000/Math.sqrt(2)))<1e-9);
  assert.ok(Math.abs(highHz-(4000*Math.sqrt(2)))<1e-9);
  assert.ok(Math.abs(Math.sqrt(lowHz*highHz)-4000)<1e-9);
});

test('Zwicker trial has an explicit noise phase followed by a silent listening window',()=>{
  const p=ZWICKER_CLASSIC;
  assert.equal(zwickerPhaseAt(0,p),'noise');
  assert.equal(zwickerPhaseAt(4.999,p),'noise');
  assert.equal(zwickerPhaseAt(5,p),'listen');
  assert.equal(zwickerPhaseAt(8.999,p),'listen');
  assert.equal(zwickerPhaseAt(9,p),'done');
});

test('Zwicker page explains the afterimage and how to listen for it',()=>{
  const exp=byId('zwicker');
  assert.match(exp.description,/after/i);
  assert.match(exp.description,/notch/i);
  assert.match(exp.howToUse,/silence/i);
  assert.match(exp.whatToListenFor,/faint/i);
  assert.match(exp.whatToListenFor,/decay/i);
  assert.equal(exp.classicParams.centerHz,4000);
  assert.equal(exp.classicParams.notchOctaves,1);
});
