/**
 * Conversion-optimized marketplace ambient audio
 *
 * Based on Mehta, Zhu & Cheema (2012) — moderate ambient noise (~65 dB)
 * increases creative cognition and purchase intent vs silence or loud noise.
 *
 * Architecture:
 *  - Pink noise source (crowd energy base)
 *  - 3 bandpass filters tuned to human voice formants (300 Hz, 900 Hz, 2400 Hz)
 *  - Slow LFO (~0.07 Hz) modulates master gain → crowd "breathes"
 *  - Sub-bass rumble (80 Hz sine, very quiet) → spatial depth / "busy room"
 */

let ctx: AudioContext | null = null;
let running = false;
let nodes: AudioNode[] = [];

// Pink noise coefficients (Paul Kellet)
let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;

function getCtx(): AudioContext | null {
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
    catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function startAmbientHum() {
  if (running) return;
  const c = getCtx(); if (!c) return;
  running = true;
  nodes = [];

  try {
    // ── 1. Pink noise source ────────────────────────────────────────────────
    const bufSize = 4096;
    const noiseNode = c.createScriptProcessor(bufSize, 1, 1);
    noiseNode.onaudioprocess = (e) => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < out.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + w*0.0555179;
        b1 = 0.99332*b1 + w*0.0750759;
        b2 = 0.96900*b2 + w*0.1538520;
        b3 = 0.86650*b3 + w*0.3104856;
        b4 = 0.55000*b4 + w*0.5329522;
        b5 = -0.7616*b5 - w*0.0168980;
        out[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;
        b6 = w*0.115926;
      }
    };

    // ── 2. Voice-formant bandpass filters ──────────────────────────────────
    // Low voice body (chest resonance, male voices)
    const bp1 = c.createBiquadFilter();
    bp1.type = "bandpass"; bp1.frequency.value = 320; bp1.Q.value = 0.8;

    // Mid voice (speech intelligibility center, mixed gender)
    const bp2 = c.createBiquadFilter();
    bp2.type = "bandpass"; bp2.frequency.value = 950; bp2.Q.value = 1.1;

    // Upper voice presence (female voices, consonants, "chatter" texture)
    const bp3 = c.createBiquadFilter();
    bp3.type = "bandpass"; bp3.frequency.value = 2600; bp3.Q.value = 1.4;

    // Blend filtered + unfiltered for natural sound
    const blend = c.createGain(); blend.gain.value = 0.55;
    const rawBlend = c.createGain(); rawBlend.gain.value = 0.45;

    noiseNode.connect(bp1); noiseNode.connect(bp2); noiseNode.connect(bp3);
    noiseNode.connect(rawBlend);
    bp1.connect(blend); bp2.connect(blend); bp3.connect(blend);

    // ── 3. Master gain with crowd "breathing" LFO ──────────────────────────
    const masterGain = c.createGain();
    masterGain.gain.value = 0.022; // ~65 dB psychoacoustic target

    blend.connect(masterGain);
    rawBlend.connect(masterGain);

    // LFO: slow swell 0.07 Hz — crowd rises and falls naturally
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.006; // subtle ±0.006 swell around 0.022
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();

    // ── 4. Sub-bass room rumble ─────────────────────────────────────────────
    // 80 Hz sine at very low gain → gives spatial "busy room" depth
    const rumble = c.createOscillator();
    const rumbleGain = c.createGain();
    rumble.type = "sine"; rumble.frequency.value = 80;
    rumbleGain.gain.value = 0.003;
    rumble.connect(rumbleGain);
    rumbleGain.connect(c.destination);
    rumble.start();

    masterGain.connect(c.destination);

    nodes = [noiseNode, bp1, bp2, bp3, blend, rawBlend, masterGain, lfo, lfoGain, rumble, rumbleGain];
  } catch {}
}

export function stopAmbientHum() {
  running = false;
  nodes.forEach(n => { try { n.disconnect(); } catch {} });
  nodes = [];
}
