export class Soundscape {
  private ctx?: AudioContext;
  private master?: GainNode;
  private ambient?: AudioBufferSourceNode;
  private enabled = false;
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && !this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      const buffer = this.ctx.createBuffer(
        1,
        this.ctx.sampleRate * 8,
        this.ctx.sampleRate,
      );
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        last = (last + (Math.random() * 2 - 1) * 0.035) / 1.035;
        data[i] = last * (0.28 + 0.12 * Math.sin(i / this.ctx.sampleRate));
      }
      this.ambient = this.ctx.createBufferSource();
      this.ambient.buffer = buffer;
      this.ambient.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 650;
      this.ambient.connect(filter).connect(this.master);
      this.ambient.start();
    }
    if (this.ctx && this.master) {
      void this.ctx.resume();
      this.master.gain.setTargetAtTime(
        enabled ? 0.3 : 0,
        this.ctx.currentTime,
        0.2,
      );
    }
  }
  play(kind: "metal" | "wood" | "water" | "take" | "success") {
    if (!this.enabled || !this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator(),
      gain = this.ctx.createGain(),
      now = this.ctx.currentTime;
    osc.type = kind === "wood" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(
      { metal: 330, wood: 105, water: 62, take: 460, success: 520 }[kind],
      now,
    );
    osc.frequency.exponentialRampToValueAtTime(
      kind === "success" ? 700 : 45,
      now + 0.18,
    );
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain).connect(this.master);
    osc.start();
    osc.stop(now + 0.32);
  }
}
