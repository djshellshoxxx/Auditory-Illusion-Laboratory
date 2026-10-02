import test from 'node:test';
import assert from 'node:assert/strict';
import {SPEECH_TO_SONG_CLASSIC,repetitionSchedule,scheduleRepetitions,normalizeSpeechToSongParams} from '../src/experiments/speechToSong.js';
import {byId} from '../src/experiments/catalog.js';

test('Classic schedule is ten identical repetitions spaced by duration plus 0.15 s',()=>{
  const s=repetitionSchedule(1.3,SPEECH_TO_SONG_CLASSIC);assert.equal(s.length,10);
  for(let i=1;i<10;i++)assert.ok(Math.abs((s[i].start-s[i-1].start)-1.45)<1e-6);assert.equal(s[0].start,0);assert.equal(s[9].end,+(9*1.45+1.3).toFixed(6));
  assert.deepEqual(normalizeSpeechToSongParams({repetitions:3,interval:.5}),{repetitions:3,intervalSeconds:.5});
});

test('every scheduled source references the same buffer object, starts at the exact time, and cleanup stops all',()=>{
  const started=[],stopped=[],buffer={duration:.8};
  const ctx={currentTime:10,createGain(){return {gain:{value:1},connect(){},disconnect(){}}},createBufferSource(){const src={buffer:null,connect(){},start(t){started.push({src,t})},stop(){stopped.push(src)},disconnect(){}};return src}};
  const run=scheduleRepetitions(ctx,{},buffer,SPEECH_TO_SONG_CLASSIC,10.05);
  assert.equal(run.sources.length,10);assert.ok(run.sources.every(s=>s.buffer===buffer));
  assert.deepEqual(started.map(x=>+(x.t-10.05).toFixed(6)),run.schedule.map(s=>s.start));
  run.stop();assert.equal(stopped.length,10);
});

test('catalog states the unchanged-buffer and local-recording invariants',()=>{const e=byId('speech-to-song');assert.match(e.description,/unchanged|identical|same/i);assert.match(e.howToUse,/record/i);assert.deepEqual(e.classicParams,SPEECH_TO_SONG_CLASSIC)});
