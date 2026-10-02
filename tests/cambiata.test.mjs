import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMBIATA_CLASSIC,parseNoteNames,cambiataDichoticEvents,cambiataEarSequences,cambiataLoopSeconds,renderCambiataLoop,midiName} from '../src/experiments/cambiata.js';
import {rms} from '../src/audio/render.js';
import {byId} from '../src/experiments/catalog.js';

test('note-name parser handles accidentals and rejects malformed input',()=>{
  assert.deepEqual(parseNoteNames('G5 E5 F5'),[79,76,77]);
  assert.deepEqual(parseNoteNames('Bb3, C#4'),[58,61]);
  assert.equal(parseNoteNames('G5 X5'),null);assert.equal(parseNoteNames(''),null);
});

test('committed fixture snapshot: two three-note cambiata figures, six-position cycle',()=>{
  assert.equal(CAMBIATA_CLASSIC.higherFigure,'G5 E5 F5');assert.equal(CAMBIATA_CLASSIC.lowerFigure,'D4 B3 C4');
  assert.equal(CAMBIATA_CLASSIC.fixtureStatus,'reconstructed');
  assert.equal(cambiataLoopSeconds(CAMBIATA_CLASSIC),1.5);
  const s=cambiataEarSequences(CAMBIATA_CLASSIC);
  assert.deepEqual(s.right.map(midiName),['G5','B3','F5','D4','E5','C4']);
  assert.deepEqual(s.left.map(midiName),['D4','E5','C4','G5','B3','F5']);
});

test('each isolated ear leaps while each figure is locally close in pitch',()=>{
  const s=cambiataEarSequences(CAMBIATA_CLASSIC);
  for(const seq of [s.left,s.right]){const leaps=seq.slice(1).map((m,i)=>Math.abs(m-seq[i]));assert.ok(Math.min(...leaps)>=12,`leaps ${leaps}`)}
  const ev=cambiataDichoticEvents(CAMBIATA_CLASSIC);
  for(const fig of ['higher','lower']){const seq=ev.filter(e=>e.figure===fig).sort((a,b)=>a.position-b.position).map(e=>e.midi);assert.ok(Math.max(...seq.slice(1).map((m,i)=>Math.abs(m-seq[i])))<=4)}
  for(let k=0;k<6;k++){const pos=ev.filter(e=>e.position===k);assert.equal(pos.length,2);assert.notEqual(pos[0].channel,pos[1].channel);assert.ok(pos.find(e=>e.figure==='higher').midi>pos.find(e=>e.figure==='lower').midi)}
});

test('render keeps both ears active at every 250 ms position',()=>{
  const r=renderCambiataLoop(CAMBIATA_CLASSIC,48000),sr=r.sampleRate,q=Math.round(.25*sr),m=Math.round(.015*sr);
  assert.equal(r.frames,Math.round(1.5*sr));
  for(let i=0;i<6;i++){assert.ok(rms(r.left,i*q+m,(i+1)*q-m)>.05);assert.ok(rms(r.right,i*q+m,(i+1)*q-m)>.05)}
});

test('catalog is explicit that the pattern is a reconstruction',()=>{
  const e=byId('cambiata');assert.equal(e.outputGuidance,'headphones');
  assert.match(e.description,/reconstruct/i);assert.match(e.howToUse,/headphones/i);
  assert.deepEqual(e.classicParams,CAMBIATA_CLASSIC);
});
