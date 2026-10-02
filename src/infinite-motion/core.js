import {wrap01,clamp} from '../audio/core.js';
export const clampLane=v=>clamp(v,-1,1);
export function advancePhase(phase,velocity,dt){phase=wrap01(phase);velocity=clampLane(velocity);dt=clamp(dt,0,10);return Number(wrap01(phase+velocity*dt).toFixed(12));}
export const bipolar=(phase,depth=1)=>Math.sin(wrap01(phase)*Math.PI*2)*clamp(depth,0,1);
export const coherentRoutes=v=>{v=clampLane(v);return {pitch:v,tempo:v,pan:v,distance:v,spectrum:v};};
export function contradictionRoutes(r={}){return {pitch:clampLane(r.pitch??0),tempo:clampLane(r.tempo??0),pan:clampLane(r.pan??0),distance:clampLane(r.distance??0),spectrum:clampLane(r.spectrum??0)};}
export const KEYBOARD_MAP={KeyA:60,KeyW:61,KeyS:62,KeyE:63,KeyD:64,KeyF:65,KeyT:66,KeyG:67,KeyY:68,KeyH:69,KeyU:70,KeyJ:71,KeyK:72};
export function parseMidi(data){const [status=0,d1=0,d2=0]=data;const type=status&0xf0;const channel=status&0x0f;if(type===0x90&&d2>0)return {type:'noteon',note:d1,velocity:d2/127,channel};if(type===0x80||(type===0x90&&d2===0))return {type:'noteoff',note:d1,velocity:0,channel};if(type===0xb0)return {type:'cc',cc:d1,value:d2/127,channel};return {type:'other',channel};}
export const ccToBipolar=value=>clampLane((clamp(value,0,127)/127)*2-1);
export function xyToBipolar(px,py,width,height){width=Math.max(1,width);height=Math.max(1,height);const x=clamp(px,0,width)/width*2-1;const y=1-clamp(py,0,height)/height*2;return {x:Number(clampLane(x).toFixed(12)),y:Number(clampLane(y).toFixed(12))};}
