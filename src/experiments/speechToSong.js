const clamp=(v,min,max,fallback=min)=>{const n=Number(v);return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));};
export const SPEECH_TO_SONG_CLASSIC=Object.freeze({repetitions:10,intervalSeconds:.15});
export function normalizeSpeechToSongParams(input={}){return {repetitions:Math.round(clamp(input.repetitions,1,40,SPEECH_TO_SONG_CLASSIC.repetitions)),intervalSeconds:clamp(input.intervalSeconds??input.interval,0,2,SPEECH_TO_SONG_CLASSIC.intervalSeconds)};}
/** Exact start times of each identical repetition. */
export function repetitionSchedule(durationSeconds,input={}){const p=normalizeSpeechToSongParams(input),d=Math.max(.01,Number(durationSeconds)||.01);return Array.from({length:p.repetitions},(_,i)=>({index:i+1,start:+(i*(d+p.intervalSeconds)).toFixed(6),end:+(i*(d+p.intervalSeconds)+d).toFixed(6)}));}
/** Schedules N buffer sources that all reference the same AudioBuffer. Returns {sources, stop, schedule}. */
export function scheduleRepetitions(ctx,bus,buffer,input={},startAt=ctx.currentTime+.05,gain=.9){
  const schedule=repetitionSchedule(buffer.duration,input),sources=[];
  const g=ctx.createGain();g.gain.value=gain;g.connect(bus);
  for(const s of schedule){const src=ctx.createBufferSource();src.buffer=buffer;src.connect(g);src.start(startAt+s.start);sources.push(src)}
  const stop=()=>{for(const s of sources){try{s.stop()}catch{/* already stopped */}try{s.disconnect()}catch{/* detached */}}try{g.disconnect()}catch{/* detached */}};
  return {sources,schedule,stop,startAt,gainNode:g};
}
