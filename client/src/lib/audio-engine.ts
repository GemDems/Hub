let ctx: AudioContext | null = null;
let humNode: OscillatorNode | null = null;
let humGain: GainNode | null = null;
let _muted = false;

try { _muted = localStorage.getItem("edh_audio_muted") === "1"; } catch {}

export function isMuted() { return _muted; }

export function setMuted(v: boolean) {
  _muted = v;
  try { localStorage.setItem("edh_audio_muted", v ? "1" : "0"); } catch {}
  if (v) stopAmbientHum();
  else startAmbientHum();
}

function getCtx(): AudioContext | null {
  if (_muted) return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function playPurchaseChime() {
  const c = getCtx(); if (!c) return;
  [880, 1320].forEach((freq, i) => {
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      osc.start(t);
      osc.stop(t + 0.78);
    } catch {}
  });
}

export function playButtonClick() {
  const c = getCtx(); if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(280, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, c.currentTime + 0.07);
    gain.gain.setValueAtTime(0.13, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.1);
  } catch {}
}

export function playVrrReward() {
  const c = getCtx(); if (!c) return;
  [523, 659, 784].forEach((freq, i) => {
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.012, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.start(t);
      osc.stop(t + 0.30);
    } catch {}
  });
}

export function startAmbientHum() {
  if (_muted) return;
  const c = getCtx(); if (!c) return;
  if (humNode) return;
  try {
    humNode = c.createOscillator();
    humGain = c.createGain();
    humNode.connect(humGain);
    humGain.connect(c.destination);
    humNode.type = "sine";
    humNode.frequency.value = 120;
    humGain.gain.value = 0.004;
    humNode.start();
  } catch {}
}

export function stopAmbientHum() {
  try { if (humNode) { humNode.stop(); humNode = null; } } catch {}
  humGain = null;
}
