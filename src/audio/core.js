export const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:min));
export const wrap01=v=>((v%1)+1)%1;
export const midiToHz=m=>440*Math.pow(2,(clamp(m,-128,255)-69)/12);
export function octavePartials(base,count=6){base=clamp(base,1,20000);count=Math.round(clamp(count,1,12));return Array.from({length:count},(_,i)=>base*Math.pow(2,i));}
export function shepardWeights(freqs,center=880,widthOct=1.25){center=clamp(center,20,20000);widthOct=clamp(widthOct,.1,8);const raw=freqs.map(f=>Math.exp(-.5*Math.pow(Math.log2(Math.max(1e-9,f)/center)/widthOct,2)));const m=Math.max(...raw,1e-12);return raw.map(x=>x/m);}
export function missingFundamental(f0,first=2,last=6){f0=clamp(f0,20,5000);first=Math.max(2,Math.round(first));last=Math.max(first,Math.round(last));return Array.from({length:last-first+1},(_,i)=>{const harmonic=first+i;return {harmonic,frequency:f0*harmonic,amplitude:1/harmonic};});}
export function predictedProducts(f1,f2){f1=clamp(f1,20,20000);f2=clamp(f2,20,20000);return {difference:Math.abs(f2-f1),twoF1MinusF2:Math.abs(2*f1-f2),twoF2MinusF1:Math.abs(2*f2-f1)};}
export function stereoAlternate(low,high,count=8){low=clamp(low,20,10000);high=clamp(high,20,20000);count=Math.max(1,Math.round(count));return Array.from({length:count},(_,i)=>i%2?{left:high,right:low}:{left:low,right:high});}
export function rissetLayerRates(rootBpm=90,layers=5){rootBpm=clamp(rootBpm,20,300);layers=Math.round(clamp(layers,2,8));const mid=(layers-1)/2;return Array.from({length:layers},(_,i)=>rootBpm*Math.pow(2,i-mid));}
export function cyclicWeight(phase,offset=0,width=.22){const d=Math.min(Math.abs(wrap01(phase-offset)),1-Math.abs(wrap01(phase-offset)));return Math.exp(-.5*Math.pow(d/clamp(width,.03,.5),2));}
export function noteClass(n){return ((Math.round(n)%12)+12)%12;}
export function scrambleOctaves(notes,depth=2,seed=1){let s=(seed|0)||1;const rand=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);return notes.map(n=>n+12*Math.round((rand()*2-1)*Math.max(0,Math.round(depth))));}
export function notchSpec(center=4000,width=1000){center=clamp(center,100,12000);width=clamp(width,50,Math.min(center*1.8,10000));return {center,width,low:Math.max(20,center-width/2),high:Math.min(20000,center+width/2)};}
export function shepardFrame(base,count=6,center=900,widthOct=1.3,phase=0,direction=1){base=clamp(base,20,1000);count=Math.round(clamp(count,3,10));phase=wrap01(phase);direction=direction<0?-1:1;const freqs=Array.from({length:count},(_,i)=>base*Math.pow(2,i+phase*direction));const weights=shepardWeights(freqs,center,widthOct);return freqs.map((frequency,i)=>({frequency,gain:weights[i]}));}
export function rissetFrame(rootBpm=90,layers=5,phase=0,direction=1){rootBpm=clamp(rootBpm,20,300);layers=Math.round(clamp(layers,2,8));phase=wrap01(phase);direction=direction<0?-1:1;const mid=(layers-1)/2;const rates=Array.from({length:layers},(_,i)=>rootBpm*Math.pow(2,i-mid+phase*direction));const logs=rates.map(r=>Math.log2(r/rootBpm));const raw=logs.map(x=>Math.exp(-.5*Math.pow(x/1.15,2)));const m=Math.max(...raw,1e-12);return rates.map((rate,i)=>({rate,gain:raw[i]/m}));}
export function scaleStereoEvents(root=60,steps=8){steps=Math.round(clamp(steps,2,12));const major=[0,2,4,5,7,9,11,12].slice(0,steps),asc=major.map(x=>root+x),desc=[...asc].reverse();return asc.map((n,i)=>i%2?{left:desc[i],right:n}:{left:n,right:desc[i]});}
export function chromaticStereoEvents(root=60,steps=12){steps=Math.round(clamp(steps,2,12));const asc=Array.from({length:steps},(_,i)=>root+i),desc=Array.from({length:steps},(_,i)=>root+steps-1-i);return asc.map((n,i)=>i%2?{left:desc[i],right:n}:{left:n,right:desc[i]});}
export function continuityCycle(total=1.2,gapStart=.45,gapDuration=.25){total=clamp(total,.5,5);gapStart=clamp(gapStart,.05,total-.1);gapDuration=clamp(gapDuration,.03,total-gapStart);return [{kind:'target',start:0,duration:gapStart,gain:1},{kind:'target',start:gapStart,duration:gapDuration,gain:0},{kind:'masker',start:gapStart,duration:gapDuration,gain:1},{kind:'target',start:gapStart+gapDuration,duration:Math.max(0,total-gapStart-gapDuration),gain:1}];}
export function phantomWordSchedule(tokens=['no','way'],tokenPeriod=.4,repetitions=24,offset=tokenPeriod){
  if(!Array.isArray(tokens)||tokens.length!==2)throw new Error('Phantom Words requires exactly two speech tokens');
  tokenPeriod=clamp(tokenPeriod,.15,2);repetitions=Math.max(1,Math.round(clamp(repetitions,1,200)));offset=clamp(offset,0,tokenPeriod*2);
  const out=[],slots=repetitions*2,duration=slots*tokenPeriod;
  for(let i=0;i<slots;i++)out.push({time:i*tokenPeriod,channel:'left',token:tokens[i%2]});
  const firstRightIndex=-Math.ceil(offset/tokenPeriod);
  for(let i=firstRightIndex;i<slots;i++){
    const time=i*tokenPeriod+offset;
    if(time<-1e-9||time>=duration-1e-9)continue;
    out.push({time:+time.toFixed(10),channel:'right',token:tokens[((i%2)+2)%2]});
  }
  return out.sort((a,b)=>a.time-b.time||(a.channel==='left'?-1:1));
}
