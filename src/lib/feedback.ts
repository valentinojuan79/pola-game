"use client";

// Procedural Web Audio API + Haptic feedback utility (zero external audio files)

const MUTE_STORAGE_KEY = "pola_muted";

class TactileFeedback {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private initialized: boolean = false;

  private ensureInit() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;
    try {
      this.muted = localStorage.getItem(MUTE_STORAGE_KEY) === "true";
    } catch {
      this.muted = false;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    this.ensureInit();
    return this.muted;
  }

  public setMuted(value: boolean): void {
    this.ensureInit();
    this.muted = value;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(value));
    } catch {
      // Ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted());
    if (!this.muted) {
      this.click();
    }
    return this.muted;
  }

  private vibrate(pattern: number | number[]) {
    if (this.isMuted()) return;
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported devices
      }
    }
  }

  /** Crisp subtle tick for placing an X or UI button press */
  public click() {
    this.ensureInit();
    if (this.muted) return;
    this.vibrate(8);
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.032);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.038);
  }

  /** Soft bubble pop for placing a Crown or key action */
  public pop() {
    this.ensureInit();
    if (this.muted) return;
    this.vibrate(14);
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.065);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  /** Light muted tap for clearing a cell */
  public erase() {
    this.ensureInit();
    if (this.muted) return;
    this.vibrate(5);
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(170, now + 0.03);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.038);
  }

  /** Gentle low double-thud for conflict / hint penalty */
  public warn() {
    this.ensureInit();
    if (this.muted) return;
    this.vibrate([12, 30, 12]);
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(165, now + 0.11);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  /** Warm iOS-like ascending triad chime on puzzle completion */
  public chime() {
    this.ensureInit();
    if (this.muted) return;
    this.vibrate([15, 45, 25]);
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, idx) => {
      const start = now + idx * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  }
}

export const feedback = new TactileFeedback();
