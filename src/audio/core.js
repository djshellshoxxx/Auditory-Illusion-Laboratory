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
