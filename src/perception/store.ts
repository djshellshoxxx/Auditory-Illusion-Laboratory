import type {PerceptionRecord} from '../types'; const KEY='ail.perception.v1'; let memory:PerceptionRecord[]=[];
const read=():PerceptionRecord[]=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return memory}};
const write=(v:PerceptionRecord[])=>{memory=v;try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}};
export const PerceptionStore={record(r:PerceptionRecord){write([...read(),r])},list:()=>read(),clear(){write([])},exportJson:()=>JSON.stringify(read(),null,2)};
