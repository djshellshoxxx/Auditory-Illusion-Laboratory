import type {FC} from 'react';
import type {PlaybackMode} from '../../types';
import type {ExperimentSession} from '../../experiments/session';
export type Params=Record<string,any>;
export interface PanelProps{
  id:string;exp:any;params:Params;
  setParams:(p:Params|((current:Params)=>Params))=>void;
  report:(response:unknown)=>void;
  setMsg:(message:string)=>void;
  running:boolean;mode:PlaybackMode;session:ExperimentSession|null;
  /** Start playback with optional parameter overrides (used by trial-based experiments). */
  play:(override?:Params)=>Promise<void>;
}
/** Every experiment declares its own Lab controls, analysis panels and perception-response UI. */
export interface ExperimentPanels{Controls?:FC<PanelProps>;Analysis?:FC<PanelProps>;Responses?:FC<PanelProps>}
export const Num=({label,k,min,max,step,params,setParams}:{label:string;k:string;min:number;max:number;step:number;params:Params;setParams:PanelProps['setParams']})=>
  <label><span>{label}</span><input aria-label={label} type="number" min={min} max={max} step={step} value={params[k]??''} onChange={e=>setParams({...params,[k]:+e.target.value})}/></label>;
export const Sel=({label,k,options,params,setParams}:{label:string;k:string;options:[string,string][];params:Params;setParams:PanelProps['setParams']})=>
  <label><span>{label}</span><select aria-label={label} value={params[k]??options[0][0]} onChange={e=>setParams({...params,[k]:e.target.value})}>{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>;
export const Chk=({label,k,params,setParams}:{label:string;k:string;params:Params;setParams:PanelProps['setParams']})=>
  <label><input aria-label={label} type="checkbox" checked={Boolean(params[k])} onChange={e=>setParams({...params,[k]:e.target.checked})}/> {label}</label>;
