/* ============================================================
   MUSIFY — player.js
   Motor musical:
   - Estructura por secciones (intro/verso/estribillo/puente/outro)
   - Melodía generada con seed (cada canción es distinta y reproducible)
   - Pad, bajo, lead, arp y batería sintetizados por género
   - Voz cantando la letra con Web Speech API
   ============================================================ */

(function () {
  'use strict';

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.from((c || document).querySelectorAll(s)); }

  // ========================================================
  // PRNG reproducible por seed
  // ========================================================
  function makeRng(seed) {
    let s = (seed | 0) || 1;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  // ========================================================
  // Escalas (intervalos sobre la fundamental)
  // ========================================================
  const SCALE_INTERVALS = {
    major:    [0, 2, 4, 5, 7, 9, 11],
    minor:    [0, 2, 3, 5, 7, 8, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    dorian:   [0, 2, 3, 5, 7, 9, 10],
  };

  // ========================================================
  // Géneros: paleta de parámetros (no la canción exacta, sólo la "tendencia")
  // ========================================================
  const GENRES = {
    pop:           { roots: [60, 62, 64, 65, 67], scale: 'major', bpm: [100, 116], progs: [[0, 5, 6, 4], [0, 4, 5, 3], [5, 3, 0, 4]], kit: 'pop',     swing: 0,    leadOctave: 0,  density: 0.6 },
    'indie folk':  { roots: [57, 59, 60, 62],     scale: 'major', bpm: [86, 102],  progs: [[0, 4, 5, 3], [0, 5, 3, 4], [5, 0, 3, 4]], kit: 'soft',    swing: 0,    leadOctave: 0,  density: 0.5 },
    jazz:          { roots: [55, 57, 58, 60],     scale: 'dorian',bpm: [78, 96],   progs: [[1, 4, 0, 0], [0, 3, 5, 4], [1, 4, 6, 0]], kit: 'jazz',    swing: 0.2,  leadOctave: 0,  density: 0.7 },
    bolero:        { roots: [55, 57, 58],         scale: 'minor', bpm: [72, 86],   progs: [[0, 5, 3, 4], [0, 3, 4, 0]],              kit: 'soft',    swing: 0.05, leadOctave: 0,  density: 0.5 },
    'hip-hop':     { roots: [53, 55, 57],         scale: 'minor', bpm: [82, 96],   progs: [[0, 5, 3, 4], [0, 3, 0, 5]],              kit: 'hiphop',  swing: 0,    leadOctave: 0,  density: 0.6 },
    'electrónica': { roots: [57, 59, 60, 62],     scale: 'minor', bpm: [118, 130], progs: [[0, 5, 3, 4], [0, 3, 4, 5]],              kit: 'edm',     swing: 0,    leadOctave: 1,  density: 0.8 },
    reguetón:      { roots: [57, 59, 60],         scale: 'minor', bpm: [92, 100],  progs: [[0, 3, 4, 5], [0, 5, 3, 4]],              kit: 'reguetón',swing: 0,    leadOctave: 0,  density: 0.7 },
    flamenco:      { roots: [54, 56, 57],         scale: 'phrygian', bpm: [92, 116],  progs: [[0, 1, 3, 0], [3, 1, 0, 0]],            kit: 'soft',    swing: 0,    leadOctave: 0,  density: 0.6 },
    'r&b':         { roots: [56, 58, 60],         scale: 'minor', bpm: [74, 92],   progs: [[0, 3, 4, 5], [0, 5, 3, 4]],              kit: 'hiphop',  swing: 0.1,  leadOctave: 0,  density: 0.55 },
    rock:          { roots: [52, 55, 57],         scale: 'minor', bpm: [108, 132], progs: [[0, 5, 3, 4], [0, 3, 4, 0]],              kit: 'rock',    swing: 0,    leadOctave: 0,  density: 0.7 },
    trap:          { roots: [51, 53, 55],         scale: 'minor', bpm: [68, 78],   progs: [[0, 5, 3, 6], [0, 3, 5, 6]],              kit: 'trap',    swing: 0,    leadOctave: 1,  density: 0.65 },
    'bossa nova':  { roots: [58, 60, 62],         scale: 'major', bpm: [96, 110],  progs: [[0, 5, 1, 4], [1, 4, 0, 0]],              kit: 'jazz',    swing: 0.18, leadOctave: 0,  density: 0.55 },
  };
  function genreParams(name) {
    const k = (name || '').toLowerCase();
    return GENRES[k] || GENRES['indie folk'];
  }

  // MIDI a Hz
  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  // ========================================================
  // GENERAR la "partitura" entera de la canción a partir del seed
  // Estructura: intro(4) - verso(8) - estribillo(8) - verso(8) - estribillo(8) - puente(4) - estribillo(8) - outro(4)
  // ========================================================
  function generateSong(song) {
    const rng = makeRng((song.seed | 0) * 13 + 7);
    const g = genreParams(song.genre);
    const bpm = Math.round(g.bpm[0] + rng() * (g.bpm[1] - g.bpm[0]));
    const root = pick(rng, g.roots);
    const scaleType = g.scale;
    const intervals = SCALE_INTERVALS[scaleType] || SCALE_INTERVALS.minor;
    const prog = pick(rng, g.progs);

    // Construir notas del acorde diatónico a partir de un grado (i)
    function chordAt(degree) {
      const triad = [degree, degree + 2, degree + 4]; // grados de escala
      return triad.map((d) => root + intervals[(d + 700) % intervals.length] + Math.floor(d / intervals.length) * 12);
    }

    // Línea melódica para 1 sección (16 steps por compás * nBars)
    function makeMelody(nBars, intensity) {
      const out = [];
      const rhythmPatterns = [
        // Cada elemento: 16 steps con 1/0 indicando si hay nota
        [1,0,0,1, 0,0,1,0, 1,0,1,0, 0,1,0,0],
        [1,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0],
        [1,0,0,0, 1,0,1,0, 0,1,0,0, 1,0,0,1],
        [0,1,0,1, 0,0,1,0, 1,0,1,0, 0,1,0,1],
      ];
      let lastDegree = 0;
      for (let b = 0; b < nBars; b++) {
        const chordDegree = prog[b % prog.length];
        const chordNotes = chordAt(chordDegree);
        const pattern = pick(rng, rhythmPatterns);
        for (let s = 0; s < 16; s++) {
          if (pattern[s] && rng() < intensity) {
            // Mover por grados conjuntos con saltos ocasionales
            const step = (rng() < 0.65) ? (rng() < 0.5 ? -1 : 1) : (rng() < 0.5 ? -2 : 2);
            lastDegree = Math.max(-4, Math.min(8, lastDegree + step));
            const baseNote = chordNotes[0] + intervals[(lastDegree + 14) % intervals.length] + Math.floor((lastDegree + 14) / intervals.length) * 12;
            out.push({ bar: b, step: s, midi: baseNote + 12, dur: 0.5 + rng() * 0.3 });
          }
        }
      }
      return out;
    }

    // Sections list
    const sections = [
      { name: 'intro',     bars: 4, drums: false, lead: false, pad: true,  bass: false, arp: false, vox: false, padLevel: 0.7 },
      { name: 'verso',     bars: 8, drums: true,  lead: false, pad: true,  bass: true,  arp: true,  vox: true,  padLevel: 0.55 },
      { name: 'estribillo',bars: 8, drums: true,  lead: true,  pad: true,  bass: true,  arp: true,  vox: true,  padLevel: 1.0 },
      { name: 'verso',     bars: 8, drums: true,  lead: false, pad: true,  bass: true,  arp: true,  vox: true,  padLevel: 0.55 },
      { name: 'estribillo',bars: 8, drums: true,  lead: true,  pad: true,  bass: true,  arp: true,  vox: true,  padLevel: 1.0 },
      { name: 'puente',    bars: 4, drums: false, lead: true,  pad: true,  bass: true,  arp: false, vox: false, padLevel: 0.6 },
      { name: 'estribillo',bars: 8, drums: true,  lead: true,  pad: true,  bass: true,  arp: true,  vox: true,  padLevel: 1.0 },
      { name: 'outro',     bars: 4, drums: false, lead: false, pad: true,  bass: false, arp: true,  vox: false, padLevel: 0.5 },
    ];
    sections.forEach((sec) => {
      sec.melody = sec.lead ? makeMelody(sec.bars, 0.4 + rng() * 0.25) : [];
    });

    return { bpm, root, scaleType, intervals, prog, sections, chordAt, kit: g.kit, swing: g.swing, leadOctave: g.leadOctave, density: g.density };
  }

  // ========================================================
  // Sintetizadores
  // ========================================================
  function createEngine(plan) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 18; comp.ratio.value = 3;
    comp.attack.value = 0.005; comp.release.value = 0.18;
    master.connect(comp);
    comp.connect(ctx.destination);

    // Buses
    const padG = ctx.createGain(); padG.gain.value = 0.0; padG.connect(master);
    const padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 1600;
    padG.disconnect(); padG.connect(padFilter); padFilter.connect(master);

    const bassG = ctx.createGain(); bassG.gain.value = 0.3; bassG.connect(master);
    const arpG = ctx.createGain();  arpG.gain.value = 0.0; arpG.connect(master);
    const leadG = ctx.createGain(); leadG.gain.value = 0.0; leadG.connect(master);
    const drumG = ctx.createGain(); drumG.gain.value = 0.0; drumG.connect(master);

    // Reverb sencillo por convolución (ruido decaimiento)
    function makeReverb(duration, decay) {
      const rate = ctx.sampleRate;
      const len = rate * duration;
      const impulse = ctx.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
      }
      const node = ctx.createConvolver();
      node.buffer = impulse;
      return node;
    }
    const reverb = makeReverb(2.0, 2.5);
    const revGain = ctx.createGain(); revGain.gain.value = 0.18;
    reverb.connect(revGain); revGain.connect(master);
    leadG.connect(reverb);

    // Ruido para percusión
    function noiseBuf(d) {
      const n = ctx.sampleRate * d;
      const b = ctx.createBuffer(1, n, ctx.sampleRate);
      const a = b.getChannelData(0);
      for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
      return b;
    }
    const noise = noiseBuf(0.5);

    // Helpers de instrumentos
    function playPad(chord, when, dur, level) {
      chord.forEach((m, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.value = hz(m - 12);
        osc.detune.value = (i - 1) * 7;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(0.12 * level, when + 0.6);
        g.gain.setValueAtTime(0.12 * level, when + dur - 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        osc.connect(g); g.connect(padG);
        osc.start(when); osc.stop(when + dur + 0.1);
      });
    }

    function playBass(midi, when, dur) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = hz(midi - 24);
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(700, when);
      f.frequency.exponentialRampToValueAtTime(220, when + dur * 0.8);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.7, when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(f); f.connect(g); g.connect(bassG);
      osc.start(when); osc.stop(when + dur + 0.05);
    }

    function playArp(midi, when, dur) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = hz(midi);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.5, when + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(g); g.connect(arpG);
      osc.start(when); osc.stop(when + dur + 0.05);
    }

    // Lead melódico: 2 osciladores ligeramente desafinados + filtro envelope
    function playLead(midi, when, dur) {
      [0, 7].forEach((detune) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = hz(midi);
        osc.detune.value = detune;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(1800, when);
        f.frequency.exponentialRampToValueAtTime(900, when + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(0.34, when + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        osc.connect(f); f.connect(g); g.connect(leadG);
        osc.start(when); osc.stop(when + dur + 0.05);
      });
    }

    function playKick(when) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, when);
      osc.frequency.exponentialRampToValueAtTime(45, when + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(1.3, when + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
      osc.connect(g); g.connect(drumG);
      osc.start(when); osc.stop(when + 0.3);
    }

    function playSnare(when) {
      const src = ctx.createBufferSource(); src.buffer = noise;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.55, when + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
      src.connect(f); f.connect(g); g.connect(drumG);
      src.start(when); src.stop(when + 0.3);
      // componente tonal
      const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = 180;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, when);
      g2.gain.exponentialRampToValueAtTime(0.3, when + 0.001);
      g2.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
      osc.connect(g2); g2.connect(drumG);
      osc.start(when); osc.stop(when + 0.1);
    }

    function playHat(when, open) {
      const src = ctx.createBufferSource(); src.buffer = noise;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500;
      const dur = open ? 0.18 : 0.04;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.18, when + 0.001);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      src.connect(f); f.connect(g); g.connect(drumG);
      src.start(when); src.stop(when + dur + 0.05);
    }

    function playClave(when) {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 2200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.5, when + 0.001);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.04);
      osc.connect(g); g.connect(drumG);
      osc.start(when); osc.stop(when + 0.06);
    }

    function drumPattern(kit, beat, when, secPerStep) {
      switch (kit) {
        case 'pop':
          if (beat === 0 || beat === 8) playKick(when);
          if (beat === 4 || beat === 12) playSnare(when);
          if (beat % 2 === 0) playHat(when, false);
          break;
        case 'rock':
          if (beat % 4 === 0) playKick(when);
          if (beat === 4 || beat === 12) playSnare(when);
          playHat(when, beat === 14);
          break;
        case 'hiphop':
          if (beat === 0 || beat === 7 || beat === 10) playKick(when);
          if (beat === 4 || beat === 12) playSnare(when);
          if (beat % 2 === 0) playHat(when, false);
          if (beat === 14) playHat(when, true);
          break;
        case 'trap':
          if (beat === 0 || beat === 5 || beat === 10) playKick(when);
          if (beat === 8) playSnare(when);
          if (beat % 2 === 0) playHat(when, false);
          if (beat === 7 || beat === 15) {
            playHat(when + secPerStep / 3, false);
            playHat(when + 2 * secPerStep / 3, false);
          }
          break;
        case 'edm':
          if (beat % 4 === 0) playKick(when);
          if (beat === 4 || beat === 12) playSnare(when);
          if (beat % 2 === 1) playHat(when, beat === 7);
          break;
        case 'reguetón':
          if (beat === 0 || beat === 6 || beat === 8 || beat === 14) playKick(when);
          if (beat === 3 || beat === 11) playSnare(when);
          if (beat % 2 === 0) playHat(when, false);
          break;
        case 'jazz':
          if (beat === 0 || beat === 8) playKick(when);
          if (beat === 4 || beat === 12) playSnare(when);
          if (beat === 0 || beat === 3 || beat === 4 || beat === 7 || beat === 8 || beat === 11 || beat === 12) playHat(when, false);
          break;
        case 'soft':
          if (beat === 0 || beat === 8) playKick(when);
          if (beat === 12) playSnare(when);
          if (beat === 4) playClave(when);
          break;
      }
    }

    // ========== Secuenciador ==========
    const secPerStep = 60 / plan.bpm / 4;
    let stepIndex = 0;
    let nextStepTime = 0;
    let timer = null;
    let currentSectionIdx = 0;
    let stepInSection = 0;
    let onSectionChange = null;

    function sectionAt(idx) { return plan.sections[idx]; }

    function scheduleStep(globalStep, when) {
      // Determinar sección actual
      const sec = sectionAt(currentSectionIdx);
      if (!sec) return;
      const beat = stepInSection % 16;
      const barInSec = Math.floor(stepInSection / 16);

      // Suavizado de buses (entradas/salidas de instrumentos)
      const targetPad   = sec.pad ? sec.padLevel : 0.0;
      const targetArp   = sec.arp ? 0.22 : 0.0;
      const targetLead  = sec.lead ? 0.32 : 0.0;
      const targetDrums = sec.drums ? 0.38 : 0.0;
      smoothGain(padG.gain, targetPad, when, 0.4);
      smoothGain(arpG.gain, targetArp, when, 0.4);
      smoothGain(leadG.gain, targetLead, when, 0.4);
      smoothGain(drumG.gain, targetDrums, when, 0.3);

      // Acorde del compás
      const chordDegree = plan.prog[barInSec % plan.prog.length];
      const chord = plan.chordAt(chordDegree);

      // PAD una vez por compás
      if (beat === 0 && sec.pad) {
        playPad(chord, when, 16 * secPerStep, sec.padLevel);
      }
      // BAJO en tiempos fuertes (1 y 3)
      if (sec.bass && (beat === 0 || beat === 8)) {
        playBass(chord[0], when, secPerStep * 4);
      }
      // ARP en notas pares
      if (sec.arp && beat % 2 === 0) {
        const arpNote = chord[Math.floor(beat / 2) % chord.length] + 12;
        playArp(arpNote, when, secPerStep * 1.4);
      }
      // LEAD: usar la melodía pre-generada de la sección
      if (sec.lead && sec.melody) {
        const notesNow = sec.melody.filter(n => n.bar === barInSec && n.step === beat);
        notesNow.forEach(n => playLead(n.midi + 12 * plan.leadOctave, when, secPerStep * 2 * n.dur));
      }
      // DRUMS
      if (sec.drums) drumPattern(plan.kit, beat, when, secPerStep);

      // Avance de step
      stepInSection++;
      if (stepInSection >= sec.bars * 16) {
        stepInSection = 0;
        currentSectionIdx++;
        if (currentSectionIdx >= plan.sections.length) {
          // Fin de canción: parar
          stop();
          return;
        }
        onSectionChange && onSectionChange(plan.sections[currentSectionIdx]);
      }
    }

    function smoothGain(param, target, when, t) {
      param.cancelScheduledValues(when);
      param.setValueAtTime(param.value, when);
      param.linearRampToValueAtTime(target, when + t);
    }

    function scheduler() {
      while (nextStepTime < ctx.currentTime + 0.2) {
        scheduleStep(stepIndex, nextStepTime);
        stepIndex++;
        // Swing en off-beats
        let dt = secPerStep;
        if (plan.swing && (stepIndex % 2 === 1)) dt *= (1 + plan.swing);
        nextStepTime += dt;
      }
      timer = setTimeout(scheduler, 25);
    }

    function start() {
      if (ctx.state === 'suspended') ctx.resume();
      nextStepTime = ctx.currentTime + 0.08;
      stepIndex = 0;
      stepInSection = 0;
      currentSectionIdx = 0;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 0.6);
      scheduler();
      onSectionChange && onSectionChange(plan.sections[0]);
    }

    function stop() {
      if (timer) clearTimeout(timer);
      timer = null;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    }

    function destroy() {
      stop();
      setTimeout(() => { try { ctx.close(); } catch (e) {} }, 400);
    }

    return {
      start, stop, destroy, ctx,
      onSection(fn) { onSectionChange = fn; },
      getCurrentSection() { return plan.sections[currentSectionIdx]; }
    };
  }

  // ========================================================
  // Voz (Web Speech API)
  // ========================================================
  function pickVoice(voiceHint) {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const sp = voices.filter(v => /^es/i.test(v.lang));
    const pool = sp.length ? sp : voices;
    const hint = (voiceHint || '').toLowerCase();
    if (hint.includes('fem')) {
      const fem = pool.filter(v => /female|mujer|elena|monica|paulina|sabina|esperanza|lucia|laura|conchita|marisol/i.test(v.name));
      if (fem.length) return fem[0];
    } else if (hint.includes('mas')) {
      const ms = pool.filter(v => /male|hombre|jorge|diego|enrique|carlos|pablo|miguel/i.test(v.name));
      if (ms.length) return ms[0];
    }
    return pool[0];
  }

  function singLine(text, voice, opts) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      const ut = new SpeechSynthesisUtterance(text);
      if (voice) ut.voice = voice;
      ut.lang = (voice && voice.lang) || 'es-ES';
      ut.rate = opts.rate || 0.85;
      ut.pitch = opts.pitch || 1.1;
      ut.volume = opts.volume == null ? 0.9 : opts.volume;
      ut.onend = () => resolve();
      ut.onerror = () => resolve();
      window.speechSynthesis.speak(ut);
    });
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function () { window.speechSynthesis.getVoices(); };
  }

  // ========================================================
  // BOOT del reproductor
  // ========================================================
  function bootPlayer(song) {
    const root = document.querySelector('[data-player]');
    if (!root) return;

    if (!song) {
      root.innerHTML = `
        <div class="empty" style="margin-block: var(--s-7)">
          <h3>Canción no encontrada</h3>
          <p>Quizá la eliminaste o el enlace está roto.</p>
          <a class="btn btn--ink" href="my-songs.html">Volver a mi colección</a>
        </div>`;
      return;
    }

    // Info
    $('[data-song-title]', root).innerHTML = decorateTitle(song.title);
    $('[data-song-genre]', root).textContent = song.genre || '—';
    $('[data-song-mood]', root).textContent = song.mood || '—';
    $('[data-song-voice]', root).textContent = song.voice || '—';
    $('[data-song-duration]', root).textContent = window.formatDuration(song.duration);
    $('[data-song-created]', root).textContent = formatDate(song.created);
    if (song.prompt && $('[data-song-prompt]', root)) {
      $('[data-song-prompt]', root).textContent = '"' + song.prompt + '"';
    }
    const sleeveTitle = $('[data-sleeve-title]', root);
    if (sleeveTitle) sleeveTitle.innerHTML = decorateTitle(song.title);
    const sleeveNum = $('[data-sleeve-num]', root);
    if (sleeveNum) sleeveNum.textContent = 'Cat. nº ' + (song.id || '').slice(-4).toUpperCase();

    // Letra
    const lyricsEl = $('[data-song-lyrics]', root);
    if (lyricsEl) {
      lyricsEl.innerHTML = (song.lyrics || '').split('\n').map((line) => {
        if (!line.trim()) return '<br>';
        if (line.startsWith('[') && line.endsWith(']')) {
          return `<span class="mono" data-section-tag style="display:block; margin: 1em 0 0.4em; color: var(--ink-mute);">${escapeHtml(line)}</span>`;
        }
        const html = escapeHtml(line).replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
        return `<span data-lyric-line>${html}</span>`;
      }).join('\n');
    }

    // Waveform
    const wave = $('[data-waveform]', root);
    const cursor = $('[data-waveform-cursor]', root);
    const BARS = 80;
    const heights = window.generateWaveform(song.seed || 1, BARS);
    const barsHtml = heights.map((h) => `<span class="waveform__bar" style="height: ${Math.round(h * 100)}%"></span>`).join('');
    $('.waveform__bars', wave).innerHTML = barsHtml;
    const bars = $$('.waveform__bar', wave);

    // Estado
    const totalDuration = song.duration || 180;
    const elapsedEl = $('[data-time-elapsed]', root);
    const totalEl = $('[data-time-total]', root);
    totalEl.textContent = window.formatDuration(totalDuration);
    elapsedEl.textContent = '0:00';

    const plan = generateSong(song);

    let engine = null;
    let voice = null;
    let isPlaying = false;
    let virtualTime = 0;
    let lastTick = 0;
    let raf;
    let lyricTimer = null;
    let lyricIdx = 0;

    const lyricLines = (song.lyrics || '').split('\n')
      .filter((l) => l.trim() && !(l.startsWith('[') && l.endsWith(']')))
      .map((l) => l.replace(/\*/g, ''));

    function voicePitchByMood(mood) {
      const m = (mood || '').toLowerCase();
      if (m.includes('eufórico') || m.includes('energ')) return 1.3;
      if (m.includes('melan') || m.includes('nost')) return 0.95;
      if (m.includes('rom')) return 1.1;
      if (m.includes('reflex') || m.includes('tranqu')) return 1.0;
      return 1.1;
    }

    function startVoice() {
      voice = pickVoice(song.voice);
      const isInstrumental = (song.voice || '').toLowerCase().includes('instrumental');
      if (isInstrumental || !lyricLines.length || !window.speechSynthesis) return;
      const pitch = voicePitchByMood(song.mood);
      const introDelay = (60 / plan.bpm) * 8 * 1000; // 2 bars antes de cantar
      lyricIdx = 0;
      lyricTimer = setTimeout(function nextLine() {
        if (!isPlaying) return;
        if (lyricIdx >= lyricLines.length) {
          lyricIdx = 0;
          lyricTimer = setTimeout(nextLine, (60 / plan.bpm) * 6 * 1000);
          return;
        }
        const line = lyricLines[lyricIdx++];
        highlightLine(lyricIdx - 1);
        const rate = 0.78 + Math.random() * 0.12;
        singLine(line, voice, { rate, pitch, volume: 1.0 }).then(() => {
          if (!isPlaying) return;
          lyricTimer = setTimeout(nextLine, (60 / plan.bpm) * 2 * 1000);
        });
      }, introDelay);
    }

    function stopVoice() {
      if (lyricTimer) clearTimeout(lyricTimer);
      lyricTimer = null;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      $$('[data-lyric-line]', root).forEach(el => el.classList.remove('is-current'));
    }

    function highlightLine(idx) {
      $$('[data-lyric-line]', root).forEach((el, i) => el.classList.toggle('is-current', i === idx));
    }

    // Indicador de sección
    function showSection(sec) {
      const tagEl = $('[data-current-section]', root);
      if (tagEl && sec) tagEl.textContent = sec.name;
    }

    function play() {
      if (virtualTime >= totalDuration) virtualTime = 0;
      isPlaying = true;
      if (!engine) {
        engine = createEngine(plan);
        engine.onSection(showSection);
      }
      if (engine) engine.start();
      startVoice();
      lastTick = performance.now();
      tick();
      updateButtonsUI();
    }

    function pause() {
      isPlaying = false;
      if (engine) engine.stop();
      stopVoice();
      cancelAnimationFrame(raf);
      updateButtonsUI();
    }

    function toggle() { isPlaying ? pause() : play(); }

    function tick() {
      const now = performance.now();
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      virtualTime += dt;
      if (virtualTime >= totalDuration) {
        virtualTime = totalDuration;
        pause();
      }
      updateUI();
      if (isPlaying) raf = requestAnimationFrame(tick);
    }

    function updateUI() {
      const pct = Math.min(1, virtualTime / totalDuration);
      const filledIdx = Math.floor(pct * BARS);
      bars.forEach((b, i) => {
        b.classList.toggle('is-past', i < filledIdx);
        b.classList.toggle('is-current', i === filledIdx);
      });
      cursor.style.left = (pct * 100) + '%';
      elapsedEl.textContent = window.formatDuration(virtualTime);
      wave.setAttribute('aria-valuenow', Math.round(pct * 100));
    }

    function updateButtonsUI() {
      $$('[data-play-toggle]', root).forEach((btn) => {
        btn.innerHTML = isPlaying ? pauseIcon() : playIcon();
        btn.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir');
      });
    }

    function playIcon()  { return '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>'; }
    function pauseIcon() { return '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'; }

    $$('[data-play-toggle]', root).forEach((btn) => btn.addEventListener('click', toggle));

    function seekFromEvent(e) {
      const r = wave.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const pct = Math.max(0, Math.min(1, x / r.width));
      virtualTime = pct * totalDuration;
      updateUI();
    }
    wave.addEventListener('click', seekFromEvent);
    wave.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); virtualTime = Math.max(0, virtualTime - 5); updateUI(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); virtualTime = Math.min(totalDuration, virtualTime + 5); updateUI(); }
      if (e.key === ' ')          { e.preventDefault(); toggle(); }
    });

    // Acciones
    const shareBtn = $('[data-action="share"]', root);
    if (shareBtn) shareBtn.addEventListener('click', () => {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          window.MusifyToast && window.MusifyToast.show('Enlace copiado', 'success');
        });
      }
    });
    const downloadBtn = $('[data-action="download"]', root);
    if (downloadBtn) downloadBtn.addEventListener('click', () => {
      window.MusifyToast && window.MusifyToast.show('La descarga estará en la versión completa.', null, 2400);
    });
    const remixBtn = $('[data-action="remix"]', root);
    if (remixBtn) remixBtn.addEventListener('click', () => {
      const p = encodeURIComponent(song.prompt || song.title);
      window.location.href = 'create.html?from=' + encodeURIComponent(song.id) + '&prompt=' + p;
    });
    const deleteBtn = $('[data-action="delete"]', root);
    if (deleteBtn) deleteBtn.addEventListener('click', () => {
      if (confirm(`¿Eliminar "${song.title}"?`)) {
        pause();
        window.MusifyLibrary.remove(song.id);
        window.MusifyToast && window.MusifyToast.show('Canción eliminada', 'success', 1500);
        setTimeout(() => { window.location.href = 'my-songs.html'; }, 700);
      }
    });

    // Limpieza
    window.addEventListener('beforeunload', () => {
      pause();
      if (engine) engine.destroy();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isPlaying) pause();
    });

    updateButtonsUI();
    updateUI();
  }

  // Arranca cuando song-detail.html expone _musifySong via evento
  window.addEventListener('musify:song-loaded', (e) => bootPlayer(e.detail));
  // Fallback: si el evento ya se disparó antes de que player.js cargara
  document.addEventListener('DOMContentLoaded', () => {
    if (window._musifySong) bootPlayer(window._musifySong);
  });

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return '—'; }
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function decorateTitle(t) {
    if (!t) return '';
    const parts = t.split(/\s+/);
    if (parts.length < 2) return escapeHtml(t);
    const last = parts.pop();
    return escapeHtml(parts.join(' ')) + ' <em>' + escapeHtml(last) + '</em>';
  }
})();
