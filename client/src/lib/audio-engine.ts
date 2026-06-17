let ctx: AudioContext | null = null;
let humNode: OscillatorNode | null = null;
let humGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function startAmbientHum() {
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
