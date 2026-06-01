/* ============================================================
   MUSIFY — profile.js
   Funcionalidad de perfil para profile.html
   ============================================================ */

(function () {
  'use strict';

  const API = 'http://localhost:8000/api';
  const TOKEN_KEY = 'musify.token';
  const USER_KEY = 'musify.user';

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

  // ── Load user profile ────────────────────────────────────
  async function loadProfile() {
    const data = await apiFetch('/auth/me');
    
    if (data.success && data.data) {
      renderProfile(data.data);
    } else {
      // Fallback to localStorage user data
      const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
      })();
      
      if (storedUser) {
        renderProfile(storedUser);
      } else {
        showNotLoggedIn();
      }
    }
  }

  // ── Render profile ───────────────────────────────────────
  function renderProfile(user) {
    // Update avatar
    const avatar = document.querySelector('.profile-avatar span');
    if (avatar) {
      avatar.textContent = (user.username || user.name || 'U')[0].toUpperCase();
    }

    // Update name
    const nameEl = document.querySelector('.profile-info h2');
    if (nameEl) {
      nameEl.textContent = user.username || user.name || 'Usuario';
    }

    // Update role
    const roleEl = document.querySelector('.profile-role');
    if (roleEl) {
      roleEl.textContent = (user.role === 'admin' ? 'Administrador' : 'Productor') + (user.role === 'premium' ? ' Premium' : '');
    }

    // Update joined date
    const joinedEl = document.querySelector('.profile-joined');
    if (joinedEl && user.created_at) {
      const date = new Date(user.created_at);
      const monthName = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      joinedEl.textContent = `Miembro desde ${monthName[date.getMonth()]} ${date.getFullYear()}`;
    }

    // Update email
    const emailEl = document.querySelector('.profile-field:nth-of-type(1) p');
    if (emailEl) {
      emailEl.textContent = user.email || 'No disponible';
    }

    // Update stats (mock data for now)
    updateStats();

    // Setup action buttons
    setupActionButtons();
  }

  // ── Update stats ─────────────────────────────────────────
  function updateStats() {
    // These are demo values; in a real app, fetch from /api/stats or similar
    const stats = [
      { value: 12, label: 'Canciones creadas' },
      { value: 3, label: 'Playlists' },
      { value: 42, label: 'Favoritos' },
      { value: 156, label: 'Reproducciones' },
    ];

    const statsContainer = document.querySelector('.profile-stats');
    if (statsContainer) {
      statsContainer.innerHTML = stats.map(stat => `
        <div class="stat">
          <h3>${stat.value}</h3>
          <p>${stat.label}</p>
        </div>
      `).join('');
    }
  }

  // ── Setup action buttons ─────────────────────────────────
  function setupActionButtons() {
    // Edit profile button
    const editBtn = document.querySelector('.btn-edit');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        showToast('Función de editar perfil próximamente', 'info');
      });
    }

    // Settings button
    const settingsBtn = document.querySelector('.btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        window.location.href = 'settings.html';
      });
    }

    // Logout button
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          showToast('Sesión cerrada', 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
        }
      });
    }
  }

  // ── Show not logged in message ───────────────────────────
  function showNotLoggedIn() {
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) {
      profileSection.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <h2>No estás autenticado</h2>
          <p>Por favor, inicia sesión para ver tu perfil.</p>
          <a href="login.html" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #d32f2f; color: white; text-decoration: none; border-radius: 4px;">Iniciar sesión</a>
        </div>
      `;
    }
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
  document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
  });

})();
