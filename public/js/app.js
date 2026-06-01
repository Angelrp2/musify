/* ============================================================
   MUSIFY — app.js
   - Toast system (sin alert/confirm)
   - Catálogo de demo de canciones (semilla)
   - Biblioteca personal (localStorage)
   - Generación simulada de canciones
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // Toast system
  // ============================================================
  let tray;
  function ensureTray() {
    if (tray) return tray;
    tray = document.createElement('div');
    tray.className = 'toast-tray';
    tray.setAttribute('aria-live', 'polite');
    tray.setAttribute('aria-atomic', 'true');
    document.body.appendChild(tray);
    return tray;
  }

  function showToast(message, kind, ms) {
    const t = ensureTray();
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast--' + kind : '');
    el.textContent = message;
    t.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => el.remove(), 300);
    }, ms || 3000);
  }

  window.MusifyToast = { show: showToast };

  // ============================================================
  // Catálogo de demo (canciones de muestra para landing)
  // ============================================================
  const DEMO_TRACKS = [
    {
      id: 'demo-01',
      title: 'Carretera de azulejos',
      genre: 'Indie folk',
      mood: 'Nostálgico',
      duration: 184,
      seed: 42,
    },
    {
      id: 'demo-02',
      title: 'Lunes a las seis',
      genre: 'Jazz',
      mood: 'Melancólico',
      duration: 221,
      seed: 17,
    },
    {
      id: 'demo-03',
      title: 'Mil grados al norte',
      genre: 'Electrónica',
      mood: 'Eufórico',
      duration: 195,
      seed: 91,
    },
    {
      id: 'demo-04',
      title: 'Pequeño puerto',
      genre: 'Bolero',
      mood: 'Romántico',
      duration: 168,
      seed: 7,
    },
    {
      id: 'demo-05',
      title: 'Madrugada en el AVE',
      genre: 'Hip-hop',
      mood: 'Reflexivo',
      duration: 213,
      seed: 64,
    },
  ];
  window.MusifyDemoTracks = DEMO_TRACKS;

  // ============================================================
  // Biblioteca (canciones del usuario, en localStorage)
  // ============================================================
  const LIB_KEY = 'musify.library';

  function getLibrary() {
    try {
      const raw = localStorage.getItem(LIB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLibrary(list) {
    localStorage.setItem(LIB_KEY, JSON.stringify(list));
  }

  function addToLibrary(song) {
    const lib = getLibrary();
    lib.unshift(song);
    saveLibrary(lib);
    return song;
  }

  function getSongById(id) {
    return getLibrary().find((s) => s.id === id) || DEMO_TRACKS.find((s) => s.id === id);
  }

  function removeFromLibrary(id) {
    const lib = getLibrary().filter((s) => s.id !== id);
    saveLibrary(lib);
    return lib;
  }

  window.MusifyLibrary = {
    list: getLibrary,
    add: addToLibrary,
    get: getSongById,
    remove: removeFromLibrary,
  };

  // ============================================================
  // Helpers
  // ============================================================
  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  window.formatDuration = formatDuration;

  // PRNG sembrado para waveforms reproducibles
  function seededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
  window.seededRandom = seededRandom;

  function generateWaveform(seed, count) {
    const rand = seededRandom(seed);
    const out = [];
    for (let i = 0; i < count; i++) {
      // Variabilidad: combinamos oscilación lenta + ruido
      const base = 0.4 + 0.5 * Math.sin(i / 4 + seed) * 0.5;
      const noise = rand() * 0.7;
      out.push(Math.max(0.08, Math.min(1, base + noise * 0.6)));
    }
    return out;
  }
  window.generateWaveform = generateWaveform;

  // ============================================================
  // Página: CREATE — formulario de generación
  // ============================================================
  function initStudio() {
    const form = document.querySelector('[data-studio-form]');
    if (!form) return;

    const promptInput = form.querySelector('[name="prompt"]');
    const chipsGenre = form.querySelectorAll('[data-chips="genre"] .chip');
    const chipsMood = form.querySelectorAll('[data-chips="mood"] .chip');
    const voiceSelect = form.querySelector('[name="voice"]');
    const durationSlider = form.querySelector('[name="duration"]');
    const durationValue = form.querySelector('[data-duration-value]');
    const submitBtn = document.querySelector('[data-studio-submit]');
    const generatingEl = document.querySelector('[data-generating]');

    // Receta (panel resumen)
    const recGenre = document.querySelector('[data-rec="genre"]');
    const recMood = document.querySelector('[data-rec="mood"]');
    const recVoice = document.querySelector('[data-rec="voice"]');
    const recDuration = document.querySelector('[data-rec="duration"]');
    const recPrompt = document.querySelector('[data-rec="prompt"]');

    const errPrompt = form.querySelector('[data-error-for="prompt"]');
    const errGenre = form.querySelector('[data-error-for="genre"]');

    let selectedGenre = '';
    let selectedMood = '';

    function setChip(group, value) {
      group.forEach((c) => {
        c.setAttribute('aria-pressed', c.dataset.value === value ? 'true' : 'false');
      });
    }

    chipsGenre.forEach((c) => {
      c.addEventListener('click', () => {
        selectedGenre = (selectedGenre === c.dataset.value) ? '' : c.dataset.value;
        setChip(chipsGenre, selectedGenre);
        if (selectedGenre) errGenre.textContent = '';
        updateRecipe();
      });
    });

    chipsMood.forEach((c) => {
      c.addEventListener('click', () => {
        selectedMood = (selectedMood === c.dataset.value) ? '' : c.dataset.value;
        setChip(chipsMood, selectedMood);
        updateRecipe();
      });
    });

    voiceSelect.addEventListener('change', updateRecipe);
    durationSlider.addEventListener('input', () => {
      durationValue.firstChild.nodeValue = durationSlider.value;
      updateRecipe();
    });
    promptInput.addEventListener('input', () => {
      if (promptInput.value.trim()) errPrompt.textContent = '';
      updateRecipe();
    });

    function updateRecipe() {
      recGenre.textContent = selectedGenre || '';
      recMood.textContent = selectedMood || '';
      recVoice.textContent = voiceSelect.value || '';
      recDuration.textContent = durationSlider.value + 's';
      const p = promptInput.value.trim();
      recPrompt.textContent = p ? (p.length > 80 ? p.slice(0, 80) + '…' : p) : '';
    }

    function validate() {
      let ok = true;
      if (!promptInput.value.trim() || promptInput.value.trim().length < 8) {
        errPrompt.textContent = 'Cuéntanos algo más. Mínimo unas palabras.';
        promptInput.setAttribute('aria-invalid', 'true');
        ok = false;
      } else {
        promptInput.removeAttribute('aria-invalid');
        errPrompt.textContent = '';
      }
      if (!selectedGenre) {
        errGenre.textContent = 'Elige al menos un género.';
        ok = false;
      } else {
        errGenre.textContent = '';
      }
      return ok;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) {
        const firstError = form.querySelector('[aria-invalid="true"]')
          || form.querySelector('.field__error:not(:empty)');
        if (firstError) firstError.scrollIntoView ? null : null;
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Componiendo…';
      generatingEl.hidden = false;

      // Lanza la generación real (Claude si está disponible, plantilla si no)
      generateSongAsync({
        prompt: promptInput.value.trim(),
        genre: selectedGenre,
        mood: selectedMood,
        voice: voiceSelect.value,
        duration: parseInt(durationSlider.value, 10),
      }).then((song) => {
        addToLibrary(song);
        showToast('Canción lista. Te llevamos al reproductor.', 'success', 1500);
        setTimeout(() => {
          window.location.href = 'song-detail.html?id=' + encodeURIComponent(song.id);
        }, 600);
      }).catch((err) => {
        console.error(err);
        showToast('Algo salió raro. Vuelve a intentarlo.', 'error', 2400);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Componer';
        generatingEl.hidden = true;
      });
    });

    // Initial state
    updateRecipe();
  }

  // ============================================================
  // Generación de canción — usa window.claude.complete si existe,
  // si falla cae a plantillas locales.
  // ============================================================
  async function generateSongAsync(opts) {
    const minMs = 2400 + Math.random() * 600;
    const t0 = performance.now();

    let title = '';
    let lyrics = '';

    if (window.claude && typeof window.claude.complete === 'function') {
      try {
        const reply = await window.claude.complete({
          messages: [{
            role: 'user',
            content: [
              'Eres letrista de canciones en español.',
              `Escribe una letra breve para una canción sobre: "${opts.prompt}".`,
              `Género: ${opts.genre}. Ánimo: ${opts.mood || 'libre'}. Voz: ${opts.voice}.`,
              '',
              'Devuelve SOLO esto, sin comentarios ni explicaciones:',
              'Línea 1: un título corto (2-5 palabras, sin comillas).',
              'Línea 2: vacía.',
              'A partir de la línea 3, la letra con esta estructura exacta:',
              '[Verso 1]',
              '(4 líneas)',
              '',
              '[Estribillo]',
              '(4 líneas)',
              '',
              '[Verso 2]',
              '(4 líneas)',
              '',
              'Las líneas deben rimar suavemente (asonante vale).',
              'Marca con asteriscos *así* una palabra clave por estrofa.',
              'No uses emojis. Tono natural, evita clichés.'
            ].join('\n')
          }]
        });
        const text = (reply || '').trim();
        const parts = text.split(/\n\s*\n/);
        if (parts.length >= 2) {
          title = parts[0].trim().replace(/^["']|["']$/g, '');
          lyrics = parts.slice(1).join('\n\n').trim();
        } else {
          // Si vino todo junto, suponer primera línea = título
          const lines = text.split('\n');
          title = lines[0].trim();
          lyrics = lines.slice(1).join('\n').trim();
        }
        // Sanidad: descartar título absurdamente largo
        if (title.length > 60) title = '';
        if (!lyrics || lyrics.length < 30) lyrics = '';
      } catch (e) {
        console.warn('Claude no disponible, usando plantilla:', e);
      }
    }

    // Fallbacks locales
    if (!title) title = makeTitle(opts.prompt, opts.mood);
    if (!lyrics) lyrics = makeLyrics(opts.prompt, opts.mood);

    // Sanitización defensiva — DOMPurify limpia cualquier HTML que
    // pudiera colarse desde la respuesta de la IA o del prompt del usuario.
    // Práctica estándar contra XSS (recomendada por OWASP).
    const clean = (s) => {
      if (window.DOMPurify) {
        return window.DOMPurify.sanitize(String(s || ''), { ALLOWED_TAGS: [], ALLOWED_ATTR: [], KEEP_CONTENT: true });
      }
      return String(s || '').replace(/<[^>]*>/g, '');
    };
    title  = clean(title).slice(0, 80);
    lyrics = clean(lyrics).slice(0, 4000);
    const safePrompt = clean(opts.prompt).slice(0, 600);

    const song = {
      id: 'u-' + Date.now().toString(36),
      title,
      genre: opts.genre,
      mood: opts.mood || 'Sin etiquetar',
      voice: opts.voice,
      duration: opts.duration,
      prompt: safePrompt,
      lyrics,
      seed: Math.floor(Math.random() * 1000) + 1,
      created: new Date().toISOString(),
    };

    // Asegurar tiempo mínimo de "composición" (que se vea la animación)
    const elapsed = performance.now() - t0;
    if (elapsed < minMs) await new Promise(r => setTimeout(r, minMs - elapsed));
    return song;
  }

  // Generador de títulos un poco humano (fallback sin IA)
  function makeTitle(prompt, mood) {
    const base = prompt.trim().split(/[.,;\n]/)[0];
    const words = base.split(/\s+/).filter(Boolean);
    if (words.length >= 3) {
      const start = Math.floor(Math.random() * Math.max(1, words.length - 2));
      const len = 2 + Math.floor(Math.random() * 2);
      return capitalize(words.slice(start, start + len).join(' '));
    }
    const fallbacks = {
      'Nostálgico': 'Antes de que llueva',
      'Eufórico': 'Hoy salimos a la calle',
      'Melancólico': 'Cuarto vacío',
      'Romántico': 'Tu nombre en mayúsculas',
      'Reflexivo': 'Lo que no dije',
      'Energético': 'Vente para acá',
      'Tranquilo': 'Domingo despacio',
    };
    return fallbacks[mood] || 'Sin título todavía';
  }

  function makeLyrics(prompt, mood) {
    // Plantilla con sustitución a partir del prompt
    const word = (prompt.match(/\b\w{4,}\b/g) || ['vida', 'tiempo', 'calle'])[0];
    const moodLine = {
      'Nostálgico': 'huele a verano viejo en tu portal',
      'Eufórico': 'y la noche se nos pone a brillar',
      'Melancólico': 'me deja la voz a media voz',
      'Romántico': 'tu nombre cabe en una canción',
      'Reflexivo': 'sigo aprendiendo a decir adiós',
      'Energético': 'el suelo se mueve cuando vas',
      'Tranquilo': 'todo va a su ritmo, sin prisa',
    }[mood] || 'queda más de lo que parecía';
    return [
      `[Verso 1]`,
      `*${capitalize(word)}* es lo único que recuerdo,`,
      `${moodLine}.`,
      `Y aunque el reloj diga otra cosa,`,
      `me quedo un poco más aquí.`,
      ``,
      `[Estribillo]`,
      `Que suene fuerte si tiene que sonar,`,
      `que se oiga hasta el último rincón.`,
      `*${capitalize(word)}* no se va a callar,`,
      `aunque le pidamos perdón.`,
    ].join('\n');
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
  }

  // ============================================================
  // Página: MY SONGS — render de biblioteca
  // ============================================================
  function initLibrary() {
    const root = document.querySelector('[data-library]');
    if (!root) return;

    const listEl = root.querySelector('[data-library-list]');
    const emptyEl = root.querySelector('[data-library-empty]');
    const countEl = root.querySelector('[data-library-count]');
    const searchEl = root.querySelector('[data-library-search]');

    function render(filter) {
      const all = getLibrary();
      const q = (filter || '').trim().toLowerCase();
      const filtered = !q ? all : all.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        (s.genre || '').toLowerCase().includes(q) ||
        (s.mood || '').toLowerCase().includes(q) ||
        (s.prompt || '').toLowerCase().includes(q)
      );

      countEl.textContent = all.length === 0
        ? 'Aún sin canciones'
        : `${filtered.length} ${filtered.length === 1 ? 'pista' : 'pistas'}${q ? ` de ${all.length}` : ''}`;

      if (all.length === 0) {
        emptyEl.hidden = false;
        listEl.hidden = true;
        return;
      }
      emptyEl.hidden = true;
      listEl.hidden = false;
      listEl.innerHTML = filtered.map((s, i) => trackRowHtml(s, i)).join('');

      // Wire eventos
      listEl.querySelectorAll('[data-track-row]').forEach((row) => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('[data-delete]')) return;
          window.location.href = 'song-detail.html?id=' + encodeURIComponent(row.dataset.id);
        });
        row.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = 'song-detail.html?id=' + encodeURIComponent(row.dataset.id);
          }
        });
      });
      listEl.querySelectorAll('[data-delete]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.closest('[data-track-row]').dataset.id;
          const song = getSongById(id);
          if (confirm(`¿Borrar "${song ? song.title : 'esta canción'}"? No se puede deshacer.`)) {
            removeFromLibrary(id);
            showToast('Canción eliminada', 'success', 1800);
            render(searchEl.value);
          }
        });
      });
    }

    function trackRowHtml(song, i) {
      const num = (i + 1).toString().padStart(2, '0');
      return `
        <article class="track" data-track-row data-id="${escapeAttr(song.id)}" tabindex="0" role="link" aria-label="Abrir ${escapeAttr(song.title)}">
          <span class="track__num">${num}</span>
          <div class="track__info">
            <span class="track__title">${escapeHtml(song.title)}</span>
            <span class="track__meta">${escapeHtml(song.genre)} · ${escapeHtml(song.mood || '—')}</span>
          </div>
          <div class="track__right">
            <span class="track__time">${formatDuration(song.duration)}</span>
            <button class="icon-btn" type="button" data-delete aria-label="Eliminar ${escapeAttr(song.title)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
              </svg>
            </button>
          </div>
        </article>
      `;
    }

    searchEl.addEventListener('input', () => render(searchEl.value));
    render('');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ============================================================
  // Página: INDEX — popular tracklist demo
  // ============================================================
  function initIndexTracks() {
    const list = document.querySelector('[data-demo-tracks]');
    if (!list) return;
    list.innerHTML = DEMO_TRACKS.map((s, i) => {
      const num = (i + 1).toString().padStart(2, '0');
      return `
        <article class="track" data-demo-track data-seed="${s.seed}" tabindex="0" role="button" aria-label="Reproducir ${escapeAttr(s.title)}">
          <span class="track__num">${num}</span>
          <div class="track__info">
            <span class="track__title">${escapeHtml(s.title)}</span>
            <span class="track__meta">${escapeHtml(s.genre)} · ${escapeHtml(s.mood)}</span>
          </div>
          <div class="track__right">
            <span class="track__time">${formatDuration(s.duration)}</span>
            <button class="track__play" type="button" aria-label="Reproducir">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="6 4 20 12 6 20 6 4"/>
              </svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    list.querySelectorAll('[data-demo-track]').forEach((row) => {
      row.addEventListener('click', () => {
        showToast('Demo: las canciones reales se generan en el estudio.', null, 2400);
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });
    });
  }

  // ============================================================
  // Boot
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    initStudio();
    initLibrary();
    initIndexTracks();
  });
})();
