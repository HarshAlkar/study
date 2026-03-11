export class AlarmAudio {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;

  async start() {
    if (this.interval) return;
    
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    
    const playBeep = () => {
      if (!this.ctx || this.ctx.state === "suspended") return;
      
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      
      g.gain.setValueAtTime(0, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      
      osc.connect(g);
      g.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    };

    playBeep();
    this.interval = setInterval(playBeep, 800);
  }

  async resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

export const alarmAudio = new AlarmAudio();
