export const ZWICKER_CLASSIC=Object.freeze({
  centerHz:4000,
  notchOctaves:1,
  noiseSeconds:5,
  listenSeconds:4,
  level:.18,
  filterStages:4
});

export function zwickerNotchEdges(centerHz,notchOctaves){
  const center=Math.max(200,Math.min(12000,Number(centerHz)||4000));
  const octaves=Math.max(.1,Math.min(2,Number(notchOctaves)||1));
  const ratio=2**(octaves/2);
  return {lowHz:center/ratio,highHz:center*ratio};
}

export function zwickerPhaseAt(seconds,params=ZWICKER_CLASSIC){
  const t=Math.max(0,Number(seconds)||0);
  const noise=Math.max(.25,Number(params.noiseSeconds)||ZWICKER_CLASSIC.noiseSeconds);
  const listen=Math.max(.25,Number(params.listenSeconds)||ZWICKER_CLASSIC.listenSeconds);
  if(t<noise)return 'noise';
  if(t<noise+listen)return 'listen';
  return 'done';
}
