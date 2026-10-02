export type PlaybackMode='classic'|'lab';
export type Guidance='headphones'|'stereo-speakers'|'either'|'room-dependent';
export interface ExperimentDescriptor{id:string;name:string;category:string;summary:string;outputGuidance:Guidance;classicParams:Record<string,unknown>;references:{label:string;url:string}[]}
export interface PerceptionRecord{experimentId:string;timestamp:number;mode:PlaybackMode;params:Record<string,unknown>;response:unknown}
