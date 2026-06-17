/**
 * Elite Deals Hub — Audio Engine
 *
 * Layers:
 *  1. Pink noise crowd base (voice-formant filtered, breathing LFO)
 *  2. Sub-bass room rumble (80 Hz)
 *  3. Rare crowd swells every 45–90 s
 *  4. Enlivening 120 BPM beat (kick + snare + hi-hat + rising arpeggio)
 */

let ctx: AudioContext | null = null;
let ambientRunning = false;
let beatRunning = false;
let ambientNodes: AudioNode[] = [];
let swellTimers: number[] = [];
let beatInterval: number | null = null;

// Pink noise state
let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;

// Audio enabled state (persisted)
let _enabled = true;
try { _enabled = localStorage.getItem("edh_audio_on") !== "0"; } catch {}

export function isAudioEnabled() { return _enabled; }
export function setAudioEnabled(v: boolean) {
  _enabled = v;
  try { localStorage.setItem("edh_audio_on", v ? "1" : "0"); } catch {}
  if (!v) { stopAmbientHum(); stopBeat(); }
  else    { startAmbientHum(); startBeat(); }
}

function getCtx(): AudioContext | null {
  if (!_enabled) return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
    catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// AMBIENT HUM
// ─────────────────────────────────────────────────────────────────────────────
export function startAmbientHum() {
  if (ambientRunning || !_enabled) return;
  const c = getCtx(); if (!c) return;
  ambientRunning = true;
  ambientNodes = [];

  try {
    const noiseNode = c.createScriptProcessor(4096, 1, 1);
    noiseNode.onaudioprocess = (e) => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < out.length; i++) {
        const w = Math.random() * 2 - 1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        out[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;
        b6=w*0.115926;
      }
    };

    const bp1 = c.createBiquadFilter(); bp1.type="bandpass"; bp1.frequency.value=320;  bp1.Q.value=0.8;
    const bp2 = c.createBiquadFilter(); bp2.type="bandpass"; bp2.frequency.value=950;  bp2.Q.value=1.1;
    const bp3 = c.createBiquadFilter(); bp3.type="bandpass"; bp3.frequency.value=2600; bp3.Q.value=1.4;
    const blend    = c.createGain(); blend.gain.value=0.55;
    const rawBlend = c.createGain(); rawBlend.gain.value=0.45;

    noiseNode.connect(bp1); noiseNode.connect(bp2); noiseNode.connect(bp3);
    noiseNode.connect(rawBlend);
    bp1.connect(blend); bp2.connect(blend); bp3.connect(blend);

    const masterGain = c.createGain(); masterGain.gain.value = 0.002;
    blend.connect(masterGain); rawBlend.connect(masterGain);

    const lfo = c.createOscillator(); const lfoGain = c.createGain();
    lfo.frequency.value=0.07; lfoGain.gain.value=0.0005;
    lfo.connect(lfoGain); lfoGain.connect(masterGain.gain); lfo.start();

    const rumble = c.createOscillator(); const rumbleGain = c.createGain();
    rumble.type="sine"; rumble.frequency.value=80; rumbleGain.gain.value=0.002;
    rumble.connect(rumbleGain); rumbleGain.connect(c.destination); rumble.start();

    masterGain.connect(c.destination);

    const scheduleNextSwell = () => {
      const delay = (45 + Math.random() * 45) * 1000;
      const timer = window.setTimeout(() => {
        if (!ambientRunning) return;
        const now = c.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0.006, now + 2.5);
        masterGain.gain.linearRampToValueAtTime(0.002, now + 7.0);
        scheduleNextSwell();
      }, delay);
      swellTimers.push(timer);
    };
    scheduleNextSwell();

    ambientNodes = [noiseNode, bp1, bp2, bp3, blend, rawBlend, masterGain, lfo, lfoGain, rumble, rumbleGain];
  } catch {}
}

export function stopAmbientHum() {
  ambientRunning = false;
  swellTimers.forEach(t => window.clearTimeout(t)); swellTimers = [];
  ambientNodes.forEach(n => { try { n.disconnect(); } catch {} }); ambientNodes = [];
}

// ─────────────────────────────────────────────────────────────────────────────
// ENLIVENING BEAT  — 120 BPM, soft kick + snare + hi-hat + rising arpeggio
// ─────────────────────────────────────────────────────────────────────────────
const BEAT_GAIN = 0.06;  // overall beat volume
const BEAT_MS   = 500;   // one beat at 120 BPM

// Pentatonic arpeggio notes (C major penta)
const ARPEGGIO = [261.6, 329.6, 392.0, 523.3, 659.3];

function playKick(c: AudioContext, t: number) {
  // Filtered noise burst + low sine sweep
  const bufSize = c.sampleRate * 0.08;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource(); src.buffer = buf;
  const hp  = c.createBiquadFilter(); hp.type="lowpass"; hp.frequency.value=120;
  const g   = c.createGain();
  g.gain.setValueAtTime(BEAT_GAIN * 0.7, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  src.connect(hp); hp.connect(g); g.connect(c.destination);
  src.start(t); src.stop(t + 0.14);

  // Sine pitch drop
  const osc = c.createOscillator(); const og = c.createGain();
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
  og.gain.setValueAtTime(BEAT_GAIN * 0.55, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  osc.connect(og); og.connect(c.destination);
  osc.start(t); osc.stop(t + 0.15);
}

function playSnare(c: AudioContext, t: number) {
  const bufSize = c.sampleRate * 0.12;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource(); src.buffer = buf;
  const bp  = c.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=1800; bp.Q.value=0.8;
  const g   = c.createGain();
  g.gain.setValueAtTime(BEAT_GAIN * 0.45, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  src.connect(bp); bp.connect(g); g.connect(c.destination);
  src.start(t); src.stop(t + 0.2);
}

function playHihat(c: AudioContext, t: number, open = false) {
  const bufSize = c.sampleRate * (open ? 0.18 : 0.04);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource(); src.buffer = buf;
  const hp  = c.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=8000;
  const g   = c.createGain();
  g.gain.setValueAtTime(BEAT_GAIN * 0.18, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.2 : 0.05));
  src.connect(hp); hp.connect(g); g.connect(c.destination);
  src.start(t); src.stop(t + (open ? 0.22 : 0.06));
}

function playArpNote(c: AudioContext, t: number, freq: number) {
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type = "sine"; osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(BEAT_GAIN * 0.22, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  osc.connect(g); g.connect(c.destination);
  osc.start(t); osc.stop(t + 0.4);
}

export function startBeat() {
  if (beatRunning || !_enabled) return;
  const c = getCtx(); if (!c) return;
  beatRunning = true;

  let beat = 0;
  let arpIdx = 0;

  const tick = () => {
    if (!beatRunning) return;
    const t = c.currentTime + 0.02; // small scheduling lookahead

    // 4/4 pattern
    const step = beat % 4;
    if (step === 0) { playKick(c, t);   playHihat(c, t); }
    if (step === 1) { playSnare(c, t);  playHihat(c, t); }
    if (step === 2) { playKick(c, t);   playHihat(c, t); }
    if (step === 3) { playSnare(c, t);  playHihat(c, t, true); } // open hi-hat on 4

    // Rising arpeggio note every beat
    playArpNote(c, t + 0.01, ARPEGGIO[arpIdx % ARPEGGIO.length]);
    arpIdx++;

    // Extra hi-hat subdivisions on the "and" of each beat
    playHihat(c, t + BEAT_MS * 0.001 * 0.5);

    beat++;
  };

  tick();
  beatInterval = window.setInterval(tick, BEAT_MS);
}

export function stopBeat() {
  beatRunning = false;
  if (beatInterval !== null) { window.clearInterval(beatInterval); beatInterval = null; }
}
