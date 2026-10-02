import test from 'node:test';
import assert from 'node:assert/strict';
import {RISSET_GLIDE_CLASSIC,rissetGlideState,nextWrapTime,cycleSeconds,layerGain,normalizeRissetGlideParams} from '../src/experiments/rissetGlide.js';
import {byId} from '../src/experiments/catalog.js';
const P=RISSET_GLIDE_CLASSIC;

test('Classic glide: eight layers, exact octaves apart at any instant, band centred on 900 Hz',()=>{
  for(const t of [0,1.7,13.9,40.2,66.6]){const s=rissetGlideState(t,P);assert.equal(s.length,8);for(let i=1;i<8;i++){const r=Math.log2(s[i].frequencyHz/s[0].frequencyHz);assert.ok(Math.abs(r-Math.round(r))<1e-9,`layers not octave related at ${t}`)}}
  const s=rissetGlideState(0,P);assert.ok(Math.abs(s[4].frequencyHz-900)<1e-9);assert.equal(cycleSeconds(P),8/.12);
});

test('layers wrap at distinct instants and always at zero gain',()=>{
  const p=normalizeRissetGlideParams(P),wraps=Array.from({length:8},(_,k)=>nextWrapTime(k,0,P));
  assert.equal(new Set(wraps.map(w=>w.toFixed(6))).size,8);
  for(let k=0;k<8;k++){const w=wraps[k];const before=rissetGlideState(w-1e-4,P)[k],after=rissetGlideState(w+1e-4,P)[k];assert.ok(before.gain<1e-3&&after.gain<1e-3,`layer ${k} wraps audibly: ${before.gain} ${after.gain}`);assert.ok(Math.abs(before.position-8)<.01&&after.position<.01)}
  assert.equal(layerGain(0,p),0);assert.equal(layerGain(8,p),0);
});

test('non-wrapping layers glide continuously at the configured speed and total gain is bounded',()=>{
  const dt=.01,sums=[];
  for(let t=0;t<cycleSeconds(P);t+=.25){const a=rissetGlideState(t,P),b=rissetGlideState(t+dt,P);for(let k=0;k<8;k++){if(nextWrapTime(k,t,P)<t+dt)continue;assert.ok(Math.abs(b[k].frequencyHz/a[k].frequencyHz-Math.pow(2,.12*dt))<1e-9)}sums.push(a.reduce((s,l)=>s+l.gain,0))}
  assert.ok(Math.max(...sums)/Math.min(...sums)<1.05);
});

test('descending is the exact counterpart',()=>{
  const up=rissetGlideState(3,P),down=rissetGlideState(3,{...P,direction:-1});
  const upPos=up.map(l=>l.position).sort((a,b)=>a-b),downPos=down.map(l=>(8-l.position)%8).sort((a,b)=>a-b);
  for(let i=0;i<8;i++)assert.ok(Math.abs(upPos[i]-downPos[i])<1e-9);
});

test('catalog documents the independent-wrap construction',()=>{const e=byId('risset-glide');assert.match(e.description,/independent|its own|separately/i);assert.deepEqual(e.classicParams,RISSET_GLIDE_CLASSIC)});
