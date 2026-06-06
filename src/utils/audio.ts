// Audio synthesizer helper for cute children-friendly game sounds using Web Audio API.
// Does not need any external assets, safe, lightweight, and responds with playful tones.

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  // Resume context if suspended (browser security autoplays require this)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playBubblePop(muted: boolean = false) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Cute bubble pop frequencies
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

export function playCorrectSound(muted: boolean = false) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Bubble sound of two pleasant, ascending notes
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.12); // G5 (C major chord swell)
    gain2.gain.setValueAtTime(0.1, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.4);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

export function playWrongSound(muted: boolean = false) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Cute falling 'boing' sliding down frequency
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.linearRampToValueAtTime(110, now + 0.3); // A2 sliding down

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.linearRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

export function playStreakCelebration(muted: boolean = false) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0 },    // C5
      { f: 659.25, t: 0.1 },  // E5
      { f: 783.99, t: 0.2 },  // G5
      { f: 1046.50, t: 0.3 }  // C6
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.08, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.005, now + note.t + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + 0.3);
    });
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}
