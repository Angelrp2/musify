/* ============================================================
   MUSIFY — backend.js
   Puente entre el diseño (localStorage / mock) y el PHP real.
   Cargado DESPUÉS de app.js y auth.js para sobreescribir sus
   interfaces con llamadas reales al API backend.

   Tres responsabilidades:
   1. window.claude.complete() → Ollama via PHP
   2. window.MusifyLibrary     → PHP /api/songs
   3. window.MusifyAuth        → PHP JWT /api/auth/*
   ============================================================ */

(function () {
  'use strict';

  const API = 'http://localhost:8000/api';
  const TOKEN_KEY = 'musify.token';
  const USER_KEY  = 'musify.user';

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

  // ── 1. window.claude.complete() → Ollama via PHP ─────────
  window.claude = {
    async complete({ messages }) {
      const lastMsg = messages[messages.length - 1];
      const prompt  = typeof lastMsg === 'string' ? lastMsg : (lastMsg.content || '');

      const data = await apiFetch('/ai/generate-lyrics', {
        method: 'POST',
        body: JSON.stringify({ prompt, genre: 'Pop', mood: 'libre' }),
      });

      if (data.success && data.data?.lyrics) return data.data.lyrics;
      // Fallback: let app.js use its local template generator
      throw new Error(data.message || 'Ollama no disponible');
    },
  };

  // ── 2. window.MusifyLibrary → PHP /api/songs ─────────────
  // Hybrid: sync to localStorage on load so design code stays sync,
  // writes go to both localStorage and PHP API.

  const LIB_KEY = 'musify.library';

  async function syncFromServer() {
    if (!getToken()) return;
    const data = await apiFetch('/songs?limit=50&sort=newest');
    if (!data.success) return;
    const songs = (data.data?.data || data.data || []).map(phpToDesign);
    localStorage.setItem(LIB_KEY, JSON.stringify(songs));
  }

  function phpToDesign(s) {
    return {
      id:       String(s.id || s.song_id || ''),
      title:    s.title    || s.attributes?.title    || 'Sin título',
      genre:    s.genre    || s.attributes?.genre    || 'Pop',
      mood:     s.mood     || s.attributes?.mood     || '',
      lyrics:   s.lyrics   || s.attributes?.lyrics   || '',
      duration: s.duration_seconds || s.attributes?.duration_seconds || 180,
      seed:     s.id || 1,
      createdAt: s.created_at || new Date().toISOString(),
    };
  }

  async function addSongToServer(song) {
    if (!getToken()) return song;
    const data = await apiFetch('/songs', {
      method: 'POST',
      body: JSON.stringify({
        title:     song.title,
        lyrics:    song.lyrics || '',
        genre:     song.genre  || 'Pop',
        mood:      song.mood   || '',
        is_public: 1,
      }),
    });
    if (data.success && data.data?.id) {
      song.id = String(data.data.id);
    }
    return song;
  }

  async function removeSongFromServer(id) {
    if (!getToken() || isNaN(Number(id))) return;
    await apiFetch('/songs/' + id, { method: 'DELETE' });
  }

  // Patch MusifyLibrary after app.js sets it
  function patchLibrary() {
    const orig = window.MusifyLibrary || {};

    const origAdd    = orig.add    || (() => {});
    const origRemove = orig.remove || (() => {});

    window.MusifyLibrary = {
      list: orig.list || (() => []),
      get:  orig.get  || (() => null),

      add(song) {
        const result = origAdd(song);         // write to localStorage
        addSongToServer(song);               // async write to PHP (fire & forget)
        return result;
      },

      remove(id) {
        origRemove(id);                      // remove from localStorage
        removeSongFromServer(id);            // async delete from PHP
      },
    };
  }

  // ── 3. window.MusifyAuth → PHP JWT ───────────────────────
  function patchAuth() {
    if (!window.MusifyAuth) return;

    const origOpen       = window.MusifyAuth.open       || (() => {});
    const origRefreshUI  = window.MusifyAuth.refreshUI  || (() => {});

    // Restore session from stored token on page load
    const storedUser = (() => {
      try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
    })();
    if (storedUser && getToken()) {
      window.MusifyAuth.setUser && window.MusifyAuth.setUser(storedUser);
    }

    // Intercept the auth form at document level (dialog created lazily)
    document.addEventListener('submit', async function (e) {
      const form = e.target;
      if (!form || form.id !== 'musify-auth-form') return;
      e.preventDefault();
      e.stopImmediatePropagation();

      const email    = (form.querySelector('#auth-email')?.value    || '').trim();
      const password =  form.querySelector('#auth-password')?.value || '';
      const name     = (form.querySelector('#auth-name')?.value     || '').trim();
      const isSignup = form.querySelector('[data-field="name"]') &&
                       !form.querySelector('[data-field="name"]').hidden;

      const endpoint = isSignup ? '/auth/register' : '/auth/login';
      const body     = isSignup
        ? { username: name || email.split('@')[0], email, password }
        : { email, password };

      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!data.success) {
        const errEl = form.querySelector('[data-error-for="password"]') ||
                      form.querySelector('[data-error-for="email"]');
        if (errEl) errEl.textContent = data.message || 'Error al conectar con el servidor';
        window.MusifyToast?.show(data.message || 'Error al iniciar sesión', 'error');
        return;
      }

      // Success — store token and user
      const user = { name: data.data.username, email: data.data.email, role: data.data.role };
      localStorage.setItem(TOKEN_KEY, data.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      window.MusifyAuth.setUser?.(user);
      window.MusifyAuth.close?.();
      window.MusifyAuth.refreshUI?.();
      window.MusifyToast?.show('Bienvenido/a, ' + user.name, 'success');

      // Sync songs from server after login
      await syncFromServer();
    }, true);

    // Override logout to also clear PHP session data
    const origBtns = () => document.querySelectorAll('[data-account-btn][data-state="signed-in"]');
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-account-btn]');
      if (!btn || btn.getAttribute('data-state') !== 'signed-in') return;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(LIB_KEY);
      window.MusifyAuth.clearUser?.();
      window.MusifyAuth.refreshUI?.();
      window.MusifyToast?.show('Hasta luego', 'success');
    });
  }

  // ── Boot ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    patchLibrary();
    patchAuth();
    // Sync songs in background if logged in
    await syncFromServer();
  });

})();
