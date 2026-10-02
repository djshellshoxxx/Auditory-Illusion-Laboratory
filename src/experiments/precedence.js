const clamp=(value,min,max,fallback=min)=>{
  const n=Number(value);
  return Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));
};

export const PRECEDENCE_CLASSIC=Object.freeze({
  delayMs:3,
  first:'left',
  sourceType:'noise-burst',
  burstMs:1,
  repetitionMs:800,
  ildDb:0
});

export function normalizePrecedenceParams(input={}){
  const delayMs=clamp(input.delayMs,0,40,PRECEDENCE_CLASSIC.delayMs);
  const first=input.first==='right'?'right':'left';
  const sourceType=['noise-burst','click','tone-pip'].includes(input.sourceType)?input.sourceType:PRECEDENCE_CLASSIC.sourceType;
  const burstMs=clamp(input.burstMs,.125,20,PRECEDENCE_CLASSIC.burstMs);
  const repetitionMs=clamp(input.repetitionMs,250,3000,PRECEDENCE_CLASSIC.repetitionMs);
  const ildDb=clamp(input.ildDb,-12,12,PRECEDENCE_CLASSIC.ildDb);
  return {delayMs,first,sourceType,burstMs,repetitionMs,ildDb};
}

export function buildPrecedencePair(input={}){
  const p=normalizePrecedenceParams(input);
  const lag=p.first==='left'?'right':'left';
  const stimulusId=`${p.sourceType}:${p.burstMs}`;
  return {
    params:p,
    events:[
      {role:'lead',side:p.first,timeSeconds:0,stimulusId,sourceType:p.sourceType},
      {role:'lag',side:lag,timeSeconds:+(p.delayMs/1000).toFixed(6),stimulusId,sourceType:p.sourceType}
    ]
  };
}
