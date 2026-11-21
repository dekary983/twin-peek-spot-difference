export class Sfx {
  constructor() { this.ctx = null; this.enabled = true; }

  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(freq, dur, type = 'sine', vol = 0.15, when = 0) {
    const ctx = this.ensure(); if (!ctx) return;
    const start = ctx.currentTime + when, osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start); gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(start); osc.stop(start + dur + 0.02);
  }

  find() { this.tone(660,.09,'triangle'); this.tone(880,.09,'triangle',.15,.1); }
  miss() { this.tone(140,.16,'square',.12); }
  clear() { [523,659,784,1047].forEach((f,i)=>this.tone(f,.14,'triangle',.14,i*.09)); }
  complete() { this.clear(); this.tone(1318,.3,'triangle',.16,.42); }
  toggle() { this.enabled = !this.enabled; return this.enabled; }
}
