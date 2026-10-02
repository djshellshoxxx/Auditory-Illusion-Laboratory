// Pure, UI-independent renderers for sample-stable stereo stimuli.
// Everything here runs in Node tests and in the browser. Output is plain Float32Array
// channel data that a runtime can copy into an AudioBuffer and loop.
const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};

export function rampGain(i,frames,rampFrames){
  if(rampFrames<=0)return 1;
  const a=Math.min(1,(i+1)/rampFrames),b=Math.min(1,(frames-i)/rampFrames);
  return Math.min(a,b);
}

function sampleWave(waveform,phase){
  const x=phase%1;
  if(waveform==='square')return x<.5?1:-1;
  if(waveform==='sawtooth')return 2*x-1;
  if(waveform==='triangle')return 1-4*Math.abs(x-.5);
  return Math.sin(2*Math.PI*x);
}

/**
 * Render a list of discrete stereo tone events into L/R sample arrays.
 * event: {time, duration, channel:'left'|'right'|'both', frequencyHz, gain=1, waveform='sine', partials=[{ratio,gain}], phase=0}
 * Each event is windowed with linear onset/offset ramps of rampSeconds (inside its own duration).
 */
export function renderStereoEvents(events,{sampleRate=48000,rampSeconds=.005,totalSeconds}={}){
  const sr=clamp(sampleRate,8000,384000,48000);
  const end=totalSeconds??events.reduce((m,e)=>Math.max(m,e.time+e.duration),0);
  const frames=Math.max(1,Math.round(end*sr));
  const left=new Float32Array(frames),right=new Float32Array(frames);
  const rampFrames=Math.round(clamp(rampSeconds,0,.1,.005)*sr);
  for(const e of events){
    const start=Math.round(e.time*sr),len=Math.round(e.duration*sr);
    const partials=e.partials&&e.partials.length?e.partials:[{ratio:1,gain:1}];
    const gain=e.gain??1,wave=e.waveform??'sine',phase0=e.phase??0;
    const toL=e.channel==='left'||e.channel==='both',toR=e.channel==='right'||e.channel==='both';
    for(let i=0;i<len;i++){
      const n=start+i;if(n<0||n>=frames)continue;
      const t=i/sr;let s=0;
      for(const p of partials)s+=p.gain*sampleWave(wave,e.frequencyHz*p.ratio*t+phase0);
      s*=gain*rampGain(i,len,rampFrames);
      if(toL)left[n]+=s;if(toR)right[n]+=s;
    }
  }
  return {left,right,frames,sampleRate:sr,seconds:frames/sr};
}

/**
 * Render continuous per-ear tone states with gain crossfades instead of gaps.
 * states: [{duration, left:frequencyHz, right:frequencyHz}] presented back to back.
 * Each distinct frequency is a phase-continuous oscillator for the whole render; ears crossfade
 * between oscillators over crossfadeSeconds so no ear is ever silent.
 */
export function renderCrossfadedDichotic(states,{sampleRate=48000,crossfadeSeconds=.003,gain=1}={}){
  const sr=clamp(sampleRate,8000,384000,48000);
  const total=states.reduce((s,x)=>s+x.duration,0);
  const frames=Math.max(1,Math.round(total*sr));
  const left=new Float32Array(frames),right=new Float32Array(frames);
  const xf=Math.max(1,Math.round(clamp(crossfadeSeconds,0,.05,.003)*sr));
  const bounds=[];let acc=0;for(const s of states){bounds.push({start:Math.round(acc*sr),end:Math.round((acc+s.duration)*sr),left:s.left,right:s.right});acc+=s.duration;}
  const weight=(n,target,ear)=>{
    // target weight 1 inside states whose ear frequency equals target, crossfaded at boundaries
    let w=0;
    for(let k=0;k<bounds.length;k++){
      const b=bounds[k];if(b[ear]!==target)continue;
      if(n<b.start-xf||n>=b.end+xf)continue;
      const prevSame=k>0&&bounds[k-1][ear]===target,nextSame=k<bounds.length-1&&bounds[k+1][ear]===target;
      let v=1;
      if(!prevSame&&n<b.start+xf)v=Math.min(v,(n-b.start+xf)/(2*xf));
      if(!nextSame&&n>=b.end-xf)v=Math.min(v,(b.end+xf-n)/(2*xf));
      if(n<b.start||n>=b.end)v=prevSame||nextSame?0:v;
      w=Math.max(w,Math.max(0,Math.min(1,v)));
    }
    return w;
  };
  const freqs=[...new Set(states.flatMap(s=>[s.left,s.right]))];
  for(const f of freqs){
    for(let n=0;n<frames;n++){
      const s=Math.sin(2*Math.PI*f*n/sr)*gain;
      const wl=weight(n,f,'left'),wr=weight(n,f,'right');
      if(wl)left[n]+=s*wl;if(wr)right[n]+=s*wr;
    }
  }
  return {left,right,frames,sampleRate:sr,seconds:frames/sr};
}

export function rms(samples,from=0,to=samples.length){let s=0,c=0;for(let i=Math.max(0,from);i<Math.min(samples.length,to);i++){s+=samples[i]*samples[i];c++}return c?Math.sqrt(s/c):0;}

/** Goertzel-style magnitude of one frequency inside a sample window. */
export function magnitudeAt(samples,sampleRate,frequencyHz,from=0,to=samples.length){
  let re=0,im=0,c=0;
  for(let i=Math.max(0,from);i<Math.min(samples.length,to);i++){const ph=2*Math.PI*frequencyHz*i/sampleRate;re+=samples[i]*Math.cos(ph);im-=samples[i]*Math.sin(ph);c++}
  return c?2*Math.hypot(re,im)/c:0;
}

export function toAudioBuffer(ctx,rendered){
  const buffer=ctx.createBuffer(2,rendered.frames,rendered.sampleRate);
  buffer.copyToChannel(rendered.left,0);buffer.copyToChannel(rendered.right,1);
  return buffer;
}
