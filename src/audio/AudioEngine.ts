export class AudioEngine {
  private ctx?:AudioContext; private input?:GainNode; private master?:GainNode; private analyser?:AnalyserNode; private cleanups=new Set<()=>void>(); private panicListeners=new Set<()=>void>();
  level=.18;
  async ensureRunning(){if(!this.ctx){this.ctx=new AudioContext();this.input=this.ctx.createGain();this.master=this.ctx.createGain();const comp=this.ctx.createDynamicsCompressor();comp.threshold.value=-9;comp.knee.value=8;comp.ratio.value=12;comp.attack.value=.003;comp.release.value=.16;this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=2048;this.master.gain.value=this.level;this.input.connect(comp).connect(this.master).connect(this.analyser).connect(this.ctx.destination);}if(this.ctx.state==='suspended')await this.ctx.resume();return this.ctx;}
  async createInputBus(){await this.ensureRunning();return this.input!;}
  context(){if(!this.ctx)throw new Error('Audio engine not started');return this.ctx;}
  getAnalyser(){return this.analyser}
  registerCleanup(fn:()=>void){this.cleanups.add(fn);return()=>this.cleanups.delete(fn)}
  registerPanicListener(fn:()=>void){this.panicListeners.add(fn);return()=>this.panicListeners.delete(fn)}
  setMasterLevel(v:number){this.level=Math.min(.5,Math.max(0,Number.isFinite(v)?v:0));if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.level,this.ctx.currentTime,.02)}
  stopActiveGraph(){for(const fn of [...this.cleanups]){try{fn()}catch{}}this.cleanups.clear()}
  panic(){if(this.input&&this.ctx){this.input.gain.cancelScheduledValues(this.ctx.currentTime);this.input.gain.setTargetAtTime(0,this.ctx.currentTime,.008);setTimeout(()=>{if(this.input&&this.ctx)this.input.gain.setValueAtTime(1,this.ctx.currentTime)},80)}this.stopActiveGraph();for(const fn of [...this.panicListeners]){try{fn()}catch{}}}
}
export const audioEngine=new AudioEngine();
