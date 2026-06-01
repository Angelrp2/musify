/* ============================================================
   MUSIFY — auth.js
   Autenticación cliente con prácticas de la industria:
   - Validación con validator.js (CDN) — librería estándar Node.js
   - Hash de contraseñas con Web Crypto API (PBKDF2-SHA256, 100k iter)
     según recomendación OWASP. NO se guarda texto plano.
   - Sanitización con DOMPurify para prevenir XSS.
   - Estado en localStorage (este prototipo no usa backend).
   ============================================================ */

(function () {
  'use strict';

  const USER_KEY    = 'musify.user';
  const ACCOUNTS_KEY = 'musify.accounts';   // hashes de contraseñas indexados por email
  const PBKDF2_ITERATIONS = 100000;          // recomendación OWASP 2024
  const SALT_BYTES = 16;

  // ============================================================
  // Helpers de cripto (Web Crypto API)
  // ============================================================
  function bufToB64(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function b64ToBuf(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  }

  async function hashPassword(password, saltBytes) {
    const enc = new TextEncoder();
    const salt = saltBytes || crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    return {
      hash: bufToB64(bits),
      salt: bufToB64(salt.buffer || salt),
      iterations: PBKDF2_ITERATIONS,
      algo: 'PBKDF2-SHA256',
    };
  }

  async function verifyPassword(password, stored) {
    const saltBuf = b64ToBuf(stored.salt);
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuf,
        iterations: stored.iterations || PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    // Comparación en tiempo constante (timing-safe)
    const a = new Uint8Array(bits);
    const b = new Uint8Array(b64ToBuf(stored.hash));
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  // ============================================================
  // Sanitización — DOMPurify si está cargado, fallback básico si no
  // ============================================================
  function sanitize(str) {
    if (window.DOMPurify) {
      return window.DOMPurify.sanitize(String(str || ''), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    return String(str || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ============================================================
  // Validación — validator.js si está cargado, fallback robusto si no
  // ============================================================
  function isValidEmail(s) {
    s = String(s || '').trim();
    if (!s || s.length > 254) return false;
    if (window.validator && typeof window.validator.isEmail === 'function') {
      return window.validator.isEmail(s);
    }
    // Fallback con regex RFC-ish — más estricta que la anterior
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(s);
  }

  function validatePassword(s) {
    s = String(s || '');
    if (s.length < 8) return 'Mínimo 8 caracteres.';
    if (!/[a-z]/.test(s)) return 'Falta al menos una minúscula.';
    if (!/[A-Z]/.test(s)) return 'Falta al menos una mayúscula.';
    if (!/[0-9]/.test(s)) return 'Falta al menos un número.';
    return '';
  }

  function validateName(s) {
    s = String(s || '').trim();
    if (s.length < 2) return 'Mínimo 2 letras.';
    if (s.length > 50) return 'Máximo 50 caracteres.';
    if (!/^[\p{L}\p{M}\s'.-]+$/u.test(s)) return 'Solo letras, espacios y guiones.';
    return '';
  }

  // ============================================================
  // Estado
  // ============================================================
  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setUser(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)); }
  function clearUser() { localStorage.removeItem(USER_KEY); }

  function getAccounts() {
    try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function saveAccounts(a) { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a)); }

  // ============================================================
  // API pública
  // ============================================================
  window.MusifyAuth = {
    getUser, setUser, clearUser,
    isSignedIn: () => !!getUser(),
    open: openDialog,
    close: closeDialog,
    refreshUI: refreshAccountButton,
    hashPassword, verifyPassword,
    sanitize, isValidEmail,
  };
  window.MusifySanitize = sanitize;

  // ============================================================
  // DOM helpers
  // ============================================================
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function refreshAccountButton() {
    const btns = $$('[data-account-btn]');
    const user = getUser();
    btns.forEach((btn) => {
      if (user) {
        btn.setAttribute('data-state', 'signed-in');
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
          </svg>
          ${sanitize(user.name)}
        `;
        btn.setAttribute('aria-label', `Sesión: ${user.name}. Pulsa para cerrar sesión`);
      } else {
        btn.setAttribute('data-state', 'signed-out');
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Entrar
        `;
        btn.setAttribute('aria-label', 'Entrar o registrarse');
      }
    });
  }

  // ============================================================
  // Diálogo
  // ============================================================
  let dialog;

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'auth-title');
    dialog.innerHTML = `
      <div class="dialog__panel">
        <button class="dialog__close" type="button" aria-label="Cerrar">✕</button>
        <h2 class="dialog__title" id="auth-title">Pasa al <em>estudio</em></h2>
        <p class="dialog__lead" id="auth-lead">Tu colección se queda en este navegador. Sin cookies raras.</p>

        <div class="dialog__tabs" role="tablist">
          <button class="dialog__tab" role="tab" aria-selected="true" data-tab="signin">Entrar</button>
          <button class="dialog__tab" role="tab" aria-selected="false" data-tab="signup">Crear cuenta</button>
        </div>

        <form class="dialog__form" id="musify-auth-form" novalidate autocomplete="on">
          <div class="field" data-field="name" hidden>
            <label class="field__label" for="auth-name">Nombre</label>
            <input class="input" form="musify-auth-form" type="text" id="auth-name" name="name" autocomplete="name" minlength="2" maxlength="50" required placeholder="Cómo te llamamos" inputmode="text">
            <span class="field__error" data-error-for="name" aria-live="polite"></span>
          </div>

          <div class="field" data-field="email">
            <label class="field__label" for="auth-email">Correo</label>
            <input class="input" form="musify-auth-form" type="email" id="auth-email" name="email" autocomplete="email" required placeholder="tu@correo.com" inputmode="email" spellcheck="false" autocapitalize="off">
            <span class="field__error" data-error-for="email" aria-live="polite"></span>
          </div>

          <div class="field" data-field="password">
            <label class="field__label" for="auth-password">Contraseña</label>
            <div class="field__pw-wrap">
              <input class="input" form="musify-auth-form" type="password" id="auth-password" name="password" autocomplete="current-password" minlength="8" required placeholder="Mínimo 8 caracteres">
              <button type="button" class="field__pw-toggle" data-toggle-pw aria-label="Mostrar u ocultar contraseña">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <div class="pw-strength" data-pw-strength hidden>
              <div class="pw-strength__bar"><span data-pw-bar></span></div>
              <span class="pw-strength__label" data-pw-label></span>
            </div>
            <span class="field__error" data-error-for="password" aria-live="polite"></span>
          </div>

          <div class="field field--terms" data-field="terms" hidden>
            <label class="check">
              <input type="checkbox" name="terms" form="musify-auth-form">
              <span class="check__box" aria-hidden="true"></span>
              <span>Prototipo educativo (TFG). Acepto el uso local de mis datos.</span>
            </label>
            <span class="field__error" data-error-for="terms" aria-live="polite"></span>
          </div>

          <button type="submit" class="btn btn--hot btn--big" data-submit>Entrar</button>
        </form>

        <p class="dialog__foot">
          <span data-foot-text>¿Primera vez por aquí?</span>
          <a href="#" data-toggle-mode>Crea una cuenta</a>
        </p>
      </div>
    `;
    document.body.appendChild(dialog);

    // Eventos
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });
    dialog.querySelector('.dialog__close').addEventListener('click', closeDialog);

    const tabs = $$('.dialog__tab', dialog);
    tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.tab)));
    dialog.querySelector('[data-toggle-mode]').addEventListener('click', (e) => {
      e.preventDefault();
      const cur = tabs.find((t) => t.getAttribute('aria-selected') === 'true').dataset.tab;
      setMode(cur === 'signin' ? 'signup' : 'signin');
    });

    // Toggle visibilidad contraseña
    const pwInput = dialog.querySelector('#auth-password');
    dialog.querySelector('[data-toggle-pw]').addEventListener('click', () => {
      pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
    });

    // Barra de fuerza de contraseña (solo en signup)
    pwInput.addEventListener('input', () => {
      updatePwStrength();
      validateField(pwInput);
    });

    const form = dialog.querySelector('form');
    form.addEventListener('submit', onSubmit);
    $$('.input', form).forEach((input) => {
      input.addEventListener('input', () => validateField(input));
      input.addEventListener('blur', () => validateField(input));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dialog.classList.contains('is-open')) closeDialog();
    });
    return dialog;
  }

  function setMode(mode) {
    const d = ensureDialog();
    const tabs = $$('.dialog__tab', d);
    tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.tab === mode ? 'true' : 'false'));

    const nameField  = d.querySelector('[data-field="name"]');
    const termsField = d.querySelector('[data-field="terms"]');
    const isSignup   = mode === 'signup';

    nameField.hidden  = !isSignup;
    termsField.hidden = !isSignup;

    const submitBtn = d.querySelector('[data-submit]');
    submitBtn.textContent = isSignup ? 'Crear cuenta' : 'Entrar';

    const pwInput = d.querySelector('#auth-password');
    pwInput.setAttribute('autocomplete', isSignup ? 'new-password' : 'current-password');
    pwInput.setAttribute('placeholder', isSignup ? 'Mínimo 8 — mayús, minús y un número' : 'Tu contraseña');

    const strengthEl = d.querySelector('[data-pw-strength]');
    strengthEl.hidden = !isSignup;

    const footText = d.querySelector('[data-foot-text]');
    const toggle = d.querySelector('[data-toggle-mode]');
    if (isSignup) {
      footText.textContent = '¿Ya tienes cuenta?';
      toggle.textContent = 'Entra aquí';
    } else {
      footText.textContent = '¿Primera vez por aquí?';
      toggle.textContent = 'Crea una cuenta';
    }

    // Limpiar errores y aria-invalid
    $$('.field__error', d).forEach((e) => (e.textContent = ''));
    $$('.input', d).forEach((i) => i.removeAttribute('aria-invalid'));
  }

  function updatePwStrength() {
    const d = dialog;
    const pw = d.querySelector('#auth-password').value;
    const bar = d.querySelector('[data-pw-bar]');
    const lab = d.querySelector('[data-pw-label]');
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    const pcts = [0, 20, 40, 60, 85, 100];
    const labs = ['—', 'Muy floja', 'Floja', 'Aceptable', 'Buena', 'Excelente'];
    const cols = ['#cebd97', '#e85050', '#e85050', '#c08a2e', '#2f6b3a', '#2f6b3a'];
    bar.style.width = pcts[score] + '%';
    bar.style.background = cols[score];
    lab.textContent = labs[score];
  }

  function validateField(input) {
    const name = input.name;
    const errEl = dialog.querySelector(`[data-error-for="${name}"]`);
    const mode = dialog.querySelector('.dialog__tab[aria-selected="true"]').dataset.tab;
    let msg = '';

    if (input.required && !input.value.trim()) {
      msg = 'Este campo no puede quedarse vacío.';
    } else if (name === 'email') {
      if (input.value && !isValidEmail(input.value)) msg = 'Eso no parece un correo válido.';
    } else if (name === 'password') {
      if (mode === 'signup') {
        msg = validatePassword(input.value);
      } else if (input.value && input.value.length < 8) {
        msg = 'Mínimo 8 caracteres.';
      }
    } else if (name === 'name') {
      if (input.value) msg = validateName(input.value);
    }

    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      errEl.textContent = msg;
      return false;
    }
    input.removeAttribute('aria-invalid');
    errEl.textContent = '';
    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const mode = dialog.querySelector('.dialog__tab[aria-selected="true"]').dataset.tab;

    const fields = [
      form.querySelector('#auth-email'),
      form.querySelector('#auth-password'),
    ];
    if (mode === 'signup') fields.unshift(form.querySelector('#auth-name'));

    let allValid = fields.map(validateField).every(Boolean);

    // Términos (solo signup)
    const termsErr = form.querySelector('[data-error-for="terms"]');
    if (mode === 'signup') {
      const terms = form.querySelector('[name="terms"]');
      if (!terms.checked) {
        termsErr.textContent = 'Debes aceptar para continuar.';
        allValid = false;
      } else {
        termsErr.textContent = '';
      }
    }

    if (!allValid) {
      const first = fields.find((i) => i.getAttribute('aria-invalid') === 'true');
      if (first) first.focus();
      return;
    }

    const submitBtn = form.querySelector('[data-submit]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Cifrando…';

    const email = form.querySelector('#auth-email').value.trim().toLowerCase();
    const password = form.querySelector('#auth-password').value;
    const accounts = getAccounts();

    try {
      if (mode === 'signup') {
        if (accounts[email]) {
          form.querySelector('[data-error-for="email"]').textContent = 'Ya existe una cuenta con ese correo.';
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Crear cuenta';
          return;
        }
        const name = form.querySelector('#auth-name').value.trim();
        const credentials = await hashPassword(password);
        accounts[email] = { ...credentials, name, joined: new Date().toISOString() };
        saveAccounts(accounts);
        setUser({ name, email, joined: accounts[email].joined });
        refreshAccountButton();
        closeDialog();
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Crear cuenta';
        window.MusifyToast && window.MusifyToast.show(`Bienvenida/o, ${name}`, 'success');
      } else {
        const acc = accounts[email];
        if (!acc) {
          form.querySelector('[data-error-for="email"]').textContent = 'No hay cuenta con ese correo.';
          submitBtn.disabled = false; submitBtn.innerHTML = 'Entrar';
          return;
        }
        const ok = await verifyPassword(password, acc);
        if (!ok) {
          form.querySelector('[data-error-for="password"]').textContent = 'Contraseña incorrecta.';
          submitBtn.disabled = false; submitBtn.innerHTML = 'Entrar';
          return;
        }
        setUser({ name: acc.name, email, joined: acc.joined });
        refreshAccountButton();
        closeDialog();
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Entrar';
        window.MusifyToast && window.MusifyToast.show(`Hola otra vez, ${acc.name}`, 'success');
      }
    } catch (err) {
      console.error(err);
      window.MusifyToast && window.MusifyToast.show('Error al procesar. Inténtalo de nuevo.', 'error', 3000);
      submitBtn.disabled = false;
      submitBtn.innerHTML = mode === 'signup' ? 'Crear cuenta' : 'Entrar';
    }
  }

  function openDialog(initialMode) {
    const d = ensureDialog();
    setMode(initialMode || 'signin');
    d.classList.add('is-open');
    setTimeout(() => {
      const focus = initialMode === 'signup' ? d.querySelector('#auth-name') : d.querySelector('#auth-email');
      focus && focus.focus();
    }, 50);
  }
  function closeDialog() { if (dialog) dialog.classList.remove('is-open'); }

  // ============================================================
  // Boot
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    refreshAccountButton();
    $$('[data-account-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (getUser()) {
          if (confirm('¿Cerrar sesión?')) {
            clearUser();
            refreshAccountButton();
            window.MusifyToast && window.MusifyToast.show('Hasta otra', 'success');
          }
        } else {
          openDialog('signin');
        }
      });
    });
    $$('[data-auth-open]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openDialog(trigger.dataset.authOpen || 'signin');
      });
    });
    $$('[data-nav-toggle]').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const links = document.querySelector('[data-nav-links]');
        if (links) links.classList.toggle('is-open');
      });
    });
  });
})();
