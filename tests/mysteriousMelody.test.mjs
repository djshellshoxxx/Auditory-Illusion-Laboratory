import test from 'node:test';
import assert from 'node:assert/strict';
import {MYSTERIOUS_MELODY_CLASSIC,MELODIES,parseMelody,mysteriousMelodyNotes,sourceMelody,renderMysteriousMelody,mysteriousMelodySeconds} from '../src/experiments/mysteriousMelody.js';
import {byId} from '../src/experiments/catalog.js';

test('melody parser handles durations and every bundled melody parses',()=>{
  assert.deepEqual(parseMelody('C4:1 D4:0.5 Bb3'),[{midi:60,beats:1},{midi:62,beats:.5},{midi:58,beats:1}]);assert.equal(parseMelody('C4 X'),null);
  for(const m of Object.values(MELODIES))assert.ok(parseMelody(m.notes).length>10);
});

test('scrambled notes keep pitch class and rhythm, move only by whole octaves, never two in the same octave',()=>{
  const src=sourceMelody(MYSTERIOUS_MELODY_CLASSIC),n=mysteriousMelodyNotes(MYSTERIOUS_MELODY_CLASSIC);
  assert.equal(n.length,src.length);
  n.forEach((x,i)=>{assert.equal(((x.midi-src[i].midi)%12+12)%12,0);assert.ok([-12,0,12].includes(x.octaveShift));assert.equal(x.beats,src[i].beats);if(i)assert.notEqual(x.octaveShift,n[i-1].octaveShift)});
  assert.ok(new Set(n.map(x=>x.octaveShift)).size===3);
});

test('same seed reproduces the identical scramble; different seed differs; reveal restores the source register',()=>{
  const a=mysteriousMelodyNotes(MYSTERIOUS_MELODY_CLASSIC),b=mysteriousMelodyNotes(MYSTERIOUS_MELODY_CLASSIC),c=mysteriousMelodyNotes({...MYSTERIOUS_MELODY_CLASSIC,seed:99});
  assert.deepEqual(a,b);assert.notDeepEqual(a.map(x=>x.midi),c.map(x=>x.midi));
  const o=mysteriousMelodyNotes({...MYSTERIOUS_MELODY_CLASSIC,condition:'original'});assert.deepEqual(o.map(x=>x.midi),sourceMelody(MYSTERIOUS_MELODY_CLASSIC).map(x=>x.midi));assert.ok(o.every(x=>x.octaveShift===0));
  assert.deepEqual(o.map(x=>x.time),a.map(x=>x.time));
});

test('render length follows tempo and user melodies are honoured',()=>{
  const sec=mysteriousMelodySeconds(MYSTERIOUS_MELODY_CLASSIC),r=renderMysteriousMelody(MYSTERIOUS_MELODY_CLASSIC,8000);assert.equal(r.frames,Math.round((sec+.1)*8000));
  assert.ok(Math.abs(mysteriousMelodySeconds({...MYSTERIOUS_MELODY_CLASSIC,tempoBpm:60})-2*sec)<1e-6);
  const u=mysteriousMelodyNotes({melody:'user',userMelody:'A4 B4 C5',condition:'original'});assert.deepEqual(u.map(x=>x.midi),[69,71,72]);
});

test('catalog explains octave scrambling, reveal and the no-regeneration rule',()=>{const e=byId('mysterious-melody');assert.match(e.description,/octave/i);assert.match(e.howToUse,/reveal/i);assert.deepEqual(e.classicParams,MYSTERIOUS_MELODY_CLASSIC)});
