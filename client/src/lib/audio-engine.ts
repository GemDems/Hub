let ctx: AudioContext | null = null;
let scriptNode: ScriptProcessorNode | null = null;
let humGain: GainNode | null = null;

// Brown noise state — each channel walks independently (low-pass random walk = crowd murmur)
let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

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
  if (scriptNode) return;
  try {
    // ScriptProcessor generates pink noise (Paul Kellet's algorithm)
    // Pink noise ≈ distant crowd murmur — soft, natural, non-fatiguing
    scriptNode = c.createScriptProcessor(4096, 1, 1);
    scriptNode.onaudioprocess = (e) => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < out.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    };

    humGain = c.createGain();
    humGain.gain.value = 0.018; // low but present — subliminal

    scriptNode.connect(humGain);
    humGain.connect(c.destination);
  } catch {}
}

export function stopAmbientHum() {
  try {
    if (scriptNode) { scriptNode.disconnect(); scriptNode = null; }
    if (humGain)    { humGain.disconnect();   humGain = null; }
  } catch {}
}
