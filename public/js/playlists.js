/* ============================================================
   MUSIFY — playlists.js
   Funcionalidad de playlists para playlists.html
   ============================================================ */

(function () {
  'use strict';

  const API = 'http://localhost:8000/api';
  const TOKEN_KEY = 'musify.token';
  const PLAYLISTS_KEY = 'musify.playlists';

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

  // ── Load playlists ───────────────────────────────────────
  async function loadPlaylists() {
    const data = await apiFetch('/playlists');
    if (data.success && data.data?.playlists) {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(data.data.playlists));
      return data.data.playlists;
    }
    
    // Fallback to localStorage
    try {
      return JSON.parse(localStorage.getItem(PLAYLISTS_KEY)) || [];
    } catch {
      return [];
    }
  }

  // ── Create playlist modal ────────────────────────────────
  function showCreatePlaylistModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Crear nueva playlist</h3>
        <form id="create-playlist-form">
          <div class="form-group">
            <label for="playlist-title">Nombre de la playlist:</label>
            <input type="text" id="playlist-title" placeholder="Ej: Mis favoritos" required>
          </div>
          <div class="form-group">
            <label for="playlist-description">Descripción (opcional):</label>
            <textarea id="playlist-description" placeholder="Describe tu playlist..."></textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="playlist-public">
              Hacer pública
            </label>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Crear</button>
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Handle form submit
    const form = modal.querySelector('#create-playlist-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.querySelector('#playlist-title').value;
      const description = document.querySelector('#playlist-description').value;
      const isPublic = document.querySelector('#playlist-public').checked ? 1 : 0;

      const data = await apiFetch('/playlists', {
        method: 'POST',
        body: JSON.stringify({ title, description, is_public: isPublic }),
      });

      if (data.success) {
        showToast('Playlist creada exitosamente', 'success');
        modal.remove();
        await loadAndRenderPlaylists();
      } else {
        showToast(data.message || 'Error al crear la playlist', 'error');
      }
    });
  }

  // ── Render playlists ─────────────────────────────────────
  async function loadAndRenderPlaylists() {
    const playlists = await loadPlaylists();
    const grid = document.querySelector('.playlists-grid');
    
    if (!grid) return;

    if (playlists.length === 0) {
      grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #999;">No tienes playlists aún. ¡Crea una!</p>';
      return;
    }

    grid.innerHTML = playlists.map((pl, idx) => `
      <div class="playlist-card" data-playlist-id="${pl.id || idx}">
        <div class="playlist-cover">
          <h3>${pl.title}</h3>
        </div>
        <div class="playlist-info">
          <p class="playlist-count">${pl.song_count || 0} canciones</p>
          <p class="playlist-duration">${(pl.song_count || 0) * 3} min</p>
        </div>
      </div>
    `).join('');

    // Add click handlers to playlist cards
    document.querySelectorAll('.playlist-card').forEach(card => {
      card.addEventListener('click', () => {
        const playlistId = card.getAttribute('data-playlist-id');
        showPlaylistDetails(playlists[parseInt(playlistId)]);
      });
    });
  }

  // ── Show playlist details ────────────────────────────────
  function showPlaylistDetails(playlist) {
    const detailsSection = document.querySelector('.playlist-details');
    if (!detailsSection) return;

    detailsSection.innerHTML = `
      <h3>Detalles de ${playlist.title}</h3>
      <div class="playlist-songs">
        ${playlist.songs && playlist.songs.length > 0 
          ? playlist.songs.map((song, idx) => `
              <div class="song-row">
                <span>${idx + 1}. ${song.title || 'Sin título'}</span>
                <span>${song.duration || '3:00'}</span>
              </div>
            `).join('')
          : '<p style="text-align: center; color: #999;">Esta playlist está vacía</p>'
        }
      </div>
    `;
  }

  // ── Toast notification ───────────────────────────────────
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 4px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ── Event listeners ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    // Load and render playlists
    await loadAndRenderPlaylists();

    // Create playlist button
    const createBtn = document.querySelector('.create-playlist-btn');
    if (createBtn) {
      createBtn.addEventListener('click', showCreatePlaylistModal);
    }
  });

})();
