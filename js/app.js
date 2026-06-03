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
    initLibrary();
    initIndexTracks();
  });
})();
