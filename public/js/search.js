/* ============================================================
   MUSIFY — search.js
   Funcionalidad de búsqueda y filtros para search.html
   ============================================================ */

(function () {
  'use strict';

  const API = 'http://localhost:8000/api';
  const TOKEN_KEY = 'musify.token';

  // ── Helpers ──────────────────────────────────────────────
  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function authHeaders() {
    const h = { 'Content-Type': 'application/json' };
    const t = getToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  async function apiFetch(path, opts) {
    try {
      const res = await fetch(API + path, { headers: authHeaders(), ...opts });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ── Demo songs (fallback if API fails) ────────────────────
  const DEMO_SONGS = [
    { id: 1, title: 'Noche Estrellada', genre: 'Pop', mood: 'Melancólico', duration_seconds: 180, username: 'Angel' },
    { id: 2, title: 'Amanecer Digital', genre: 'Indie', mood: 'Esperanzador', duration_seconds: 180, username: 'Angel' },
    { id: 3, title: 'Rock and Code', genre: 'Rock', mood: 'Intenso', duration_seconds: 180, username: 'Angel' },
    { id: 4, title: 'Jazz Nocturno', genre: 'Jazz', mood: 'Relajante', duration_seconds: 200, username: 'User2' },
    { id: 5, title: 'Hip-hop Urbano', genre: 'Hip-hop', mood: 'Enérgico', duration_seconds: 240, username: 'User3' },
    { id: 6, title: 'Electrónica Futura', genre: 'Electrónica', mood: 'Experimental', duration_seconds: 220, username: 'User4' },
    { id: 7, title: 'Balada Romántica', genre: 'Pop', mood: 'Romántico', duration_seconds: 240, username: 'User5' },
    { id: 8, title: 'Metal Extremo', genre: 'Rock', mood: 'Agresivo', duration_seconds: 260, username: 'User6' },
    { id: 9, title: 'Reggae Tropical', genre: 'Reggae', mood: 'Relajante', duration_seconds: 200, username: 'User7' },
    { id: 10, title: 'Folk Acústico', genre: 'Folk', mood: 'Nostálgico', duration_seconds: 210, username: 'User8' },
    { id: 11, title: 'Synthwave Retro', genre: 'Electrónica', mood: 'Nostálgico', duration_seconds: 190, username: 'User9' },
    { id: 12, title: 'Trap Moderno', genre: 'Hip-hop', mood: 'Enérgico', duration_seconds: 180, username: 'User10' },
  ];

  let allSongs = [...DEMO_SONGS];

  // ── Load songs from API or use demo ──────────────────────
  async function loadSongs() {
    const data = await apiFetch('/songs?limit=100');
    if (data.success && data.data) {
      allSongs = (data.data.data || data.data || []).map(s => ({
        id: s.id,
        title: s.title,
        genre: s.genre || 'Pop',
        mood: s.mood || '',
        duration_seconds: s.duration_seconds || 180,
        username: s.username || 'Usuario',
      }));
    }
    renderResults();
  }

  // ── Format duration ──────────────────────────────────────
  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // ── Apply filters ────────────────────────────────────────
  function applyFilters() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const genreFilter = document.querySelector('.filters select:nth-of-type(1)')?.value || 'Todos';
    const durationFilter = document.querySelector('.filters select:nth-of-type(2)')?.value || 'Cualquier duración';

    let filtered = allSongs.filter(song => {
      // Search term
      if (searchTerm && !song.title.toLowerCase().includes(searchTerm) &&
          !song.genre.toLowerCase().includes(searchTerm) &&
          !song.username.toLowerCase().includes(searchTerm)) {
        return false;
      }

      // Genre filter
      if (genreFilter !== 'Todos' && song.genre !== genreFilter) {
        return false;
      }

      // Duration filter
      if (durationFilter === 'Menos de 3 min' && song.duration_seconds >= 180) return false;
      if (durationFilter === '3-5 min' && (song.duration_seconds < 180 || song.duration_seconds > 300)) return false;
      if (durationFilter === 'Más de 5 min' && song.duration_seconds <= 300) return false;

      return true;
    });

    return filtered;
  }

  // ── Render results ───────────────────────────────────────
  function renderResults() {
    const filtered = applyFilters();
    const resultsContainer = document.querySelector('.song-list');
    const resultsHeader = document.querySelector('.results h3');

    if (!resultsContainer) return;

    resultsHeader.textContent = `Resultados (${filtered.length} canciones)`;

    if (filtered.length === 0) {
      resultsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #999;">No se encontraron canciones</p>';
      return;
    }

    resultsContainer.innerHTML = filtered.map(song => `
      <div class="song-item">
        <div class="song-cover"></div>
        <div class="song-info">
          <h4>${song.title}</h4>
          <p>${song.genre}${song.mood ? ' • ' + song.mood : ''}</p>
        </div>
        <span class="duration">${formatDuration(song.duration_seconds)}</span>
      </div>
    `).join('');
  }

  // ── Event listeners ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    loadSongs();

    // Search button
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', renderResults);
    }

    // Search input (enter key)
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderResults();
      });
    }

    // Filter selects
    const selects = document.querySelectorAll('.filters select');
    selects.forEach(select => {
      select.addEventListener('change', renderResults);
    });
  });

})();
