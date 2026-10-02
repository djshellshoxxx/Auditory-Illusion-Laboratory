/** What a running experiment tells the UI about itself so visualizations can show the physical stimulus. */
export interface LaneEvent{time:number;duration:number;channel:'left'|'right'|'both';frequencyHz:number;label?:string;gain?:number}
export interface ExperimentSession{
  startedAt:number;            // performance.now() when audio was scheduled to start
  loopSeconds?:number;         // length of the repeating physical cycle, if any
  events?:LaneEvent[];         // physical L/R events in one cycle
  phases?:{label:string;start:number;end:number}[]; // for non-looping trials (e.g. noise then silence)
  notes?:string;
}
