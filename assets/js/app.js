// Musify — app.js — Bloques 6, 7, 9, 10
const API_URL = 'http://localhost:8000/api';
let currentUser = null;
let token = localStorage.getItem('token');
const estado = { page: 1, limit: 12, genre: '', search: '', sort: 'newest' };

// ── Expresiones regulares (Bloque 6) ────────────────────
const REGEX = {
  email:    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  username: /^[a-zA-Z0-9_áéíóúüñÁÉÍÓÚÜÑ]{3,20}$/,
  nombre:   /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'\-]{3,50}$/,
  asunto:   /^.{5,100}$/,
  mensaje:  /^[\s\S]{10,500}$/,
  busqueda: /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-_]{2,}/,
};

function normalizarTexto(txt) {
  return String(txt).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

function validarCampo(campoId, regex, msgError) {
  const campo = document.getElementById(campoId);
  const errEl = document.getElementById(campoId + '-error');
  if (!campo) return true;
  const ok = regex.test(campo.value.trim());
  campo.classList.toggle('campo-error', !ok);
  campo.classList.toggle('campo-ok', ok);
  if (errEl) errEl.textContent = ok ? '' : msgError;
  return ok;
}

function limpiarCampo(id) {
  const el = document.getElementById(id);
  const er = document.getElementById(id + '-error');
  if (el) el.classList.remove('campo-error', 'campo-ok');
  if (er) er.textContent = '';
}

// Pasos de loading IA (Bloque 7)
const PASOS_IA = [
  'Analizando tu descripcion...',
  'Generando letra con IA (Ollama)...',
  'Estructurando verso y coro...',
  'Aplicando estilo musical...',
  'Revisando resultado...',
];

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadUser();
  setupNav();
  setupBuscador();
  setupPaginacion();
  setupContacto();
  setupAuthBlur();
  cargarCanciones();
  document.getElementById('authBtn')?.addEventListener('click', openAuthModal);
});

// ── Tema ──────────────────────────────────────────────────
function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const icon = btn.querySelector('.theme-icon');
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
    if (icon) icon.textContent = '●';
  }
  btn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    if (icon) icon.textContent = dark ? '●' : '◐';
  });
}

// ── Navegacion SPA ────────────────────────────────────────
function setupNav() {
  document.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', e => { e.preventDefault(); navigateTo(l.dataset.page); });
  });
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page')?.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  if (page === 'explore') cargarCanciones();
  if (page === 'library') cargarBiblioteca();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Buscador debounce + regex (Bloque 6 + 9) ─────────────
function setupBuscador() {
  document.getElementById('searchInput')?.addEventListener('input', debounce(function () {
    estado.search = this.value.trim();
    estado.page = 1;
    cargarCanciones();
  }, 350));
  document.getElementById('genreFilter')?.addEventListener('change', function () {
    estado.genre = this.value; estado.page = 1; cargarCanciones();
  });
  document.getElementById('sortSelect')?.addEventListener('change', function () {
    estado.sort = this.value; estado.page = 1; cargarCanciones();
  });
}

// ── Paginacion (Bloque 9) ─────────────────────────────────
function setupPaginacion() {
  document.getElementById('btnAnterior')?.addEventListener('click', () => {
    if (estado.page > 1) { estado.page--; cargarCanciones(); }
  });
  document.getElementById('btnSiguiente')?.addEventListener('click', () => {
    estado.page++; cargarCanciones();
  });
}

async function cargarCanciones() {
  const loadingEl = document.getElementById('loadingList');
  const container = document.getElementById('songsList');
  const noResults = document.getElementById('noSongsMsg');
  const countEl = document.getElementById('resultsCount');
  if (!container) return;

  if (loadingEl) loadingEl.style.display = 'flex';
  container.innerHTML = '';
  if (noResults) noResults.style.display = 'none';

  const params = new URLSearchParams({ page: estado.page, limit: estado.limit, sort: estado.sort });
  if (estado.genre) params.set('genre', estado.genre);
  if (estado.search) params.set('search', estado.search);

  try {
    const res = await fetch(API_URL + '/songs?' + params);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al cargar');

    const canciones = data.data?.data || data.data || [];
    const pagination = data.data?.pagination || null;

    if (!canciones.length) {
      if (noResults) noResults.style.display = 'block';
      if (countEl) countEl.textContent = 'Sin resultados';
    } else {
      renderCanciones(canciones);
      if (countEl && pagination) {
        countEl.textContent = pagination.total + ' canciones — pagina ' + pagination.page + ' de ' + pagination.totalPages;
      } else if (countEl) {
        countEl.textContent = canciones.length + ' canciones';
      }
    }
    if (pagination) actualizarPaginacion(pagination);
  } catch (err) {
    container.innerHTML = '<p class="error-msg">Error al cargar canciones. Comprueba que el servidor PHP esta corriendo.</p>';
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// Filtrado local con regex (Bloque 6)
function filtrarCanciones(canciones, termino) {
  if (!termino) return canciones;
  const regex = new RegExp(normalizarTexto(termino), 'i');
  return canciones.filter(c =>
    regex.test(normalizarTexto(c.title)) || regex.test(normalizarTexto(c.genre || ''))
  );
}

const COLORES_GENERO = {
  Pop: '#6366f1', Rock: '#ef4444', Indie: '#10b981',
  Jazz: '#f97316', Flamenco: '#ec4899', 'Hip-Hop': '#f59e0b'
};

function renderCanciones(canciones) {
  const container = document.getElementById('songsList');
  container.innerHTML = canciones.map(song => {
    const color = COLORES_GENERO[song.genre] || '#6366f1';
    return `<div class="song-card" onclick="verCancion(${song.id})" role="button" tabindex="0">
      <div class="song-cover" style="background:linear-gradient(135deg,${color}33,${color}66)">
        <span class="cover-icon" aria-hidden="true">&#9835;</span>
      </div>
      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.username || 'Anonimo'}</div>
        ${song.genre ? `<div class="song-genre-tag" style="color:${color}">${song.genre}</div>` : ''}
      </div>
    </div>`;
  }).join('');
  container.querySelectorAll('[role=button]').forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') el.click(); });
  });
}

function actualizarPaginacion(p) {
  const info = document.getElementById('paginacionInfo');
  const ant = document.getElementById('btnAnterior');
  const sig = document.getElementById('btnSiguiente');
  if (info) info.textContent = 'Pagina ' + p.page + ' de ' + p.totalPages + ' (' + p.total + ' canciones)';
  if (ant) ant.disabled = p.page <= 1;
  if (sig) sig.disabled = p.page >= p.totalPages;
  estado.page = p.page;
}

function verCancion(id) { showMessage('Cancion #' + id + ' — detalle en desarrollo', 'info'); }

// ── Generacion IA con estados (Bloque 7) ─────────────────
async function generateLyrics() {
  const promptEl = document.getElementById('lyricsInput');
  const prompt = promptEl?.value.trim();
  const errEl = document.getElementById('lyricsInput-error');

  if (!prompt || prompt.length < 5) {
    if (promptEl) promptEl.classList.add('campo-error');
    if (errEl) errEl.textContent = 'Describe la cancion con al menos 5 caracteres';
    return;
  }
  if (promptEl) { promptEl.classList.remove('campo-error'); promptEl.classList.add('campo-ok'); }
  if (errEl) errEl.textContent = '';

  if (!currentUser) { showMessage('Debes iniciar sesion para usar la IA', 'info'); openAuthModal(); return; }

  const btn = document.getElementById('btnGenerateLyrics');
  const loadingEl = document.getElementById('aiLoadingState');
  const errorEl = document.getElementById('aiErrorState');
  const successEl = document.getElementById('aiSuccessState');
  const msgEl = document.getElementById('aiLoadingMsg');
  const output = document.getElementById('lyricsOutput');

  btn.disabled = true; btn.textContent = 'Generando...';
  if (loadingEl) loadingEl.style.display = 'flex';
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
  if (output) output.style.display = 'none';

  let paso = 0;
  const intervalo = setInterval(() => {
    if (msgEl && paso < PASOS_IA.length) msgEl.textContent = PASOS_IA[paso++];
  }, 3000);

  try {
    const genre = document.getElementById('genreSelect')?.value || 'Pop';
    const mood = document.getElementById('moodSelect')?.value || 'alegre';

    const res = await fetch(API_URL + '/ai/generate-lyrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ prompt, genre, mood }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Error en la generacion');

    if (output) {
      output.style.display = 'block';
      output.innerHTML = '<pre>' + data.data.lyrics + '</pre>';
    }
    if (successEl) {
      successEl.style.display = 'flex';
      setTimeout(() => { successEl.style.display = 'none'; }, 5000);
    }
  } catch (err) {
    if (errorEl) {
      errorEl.style.display = 'flex';
      const p = document.getElementById('aiErrorMsg');
      if (p) p.textContent = err.message;
    }
  } finally {
    clearInterval(intervalo);
    if (loadingEl) loadingEl.style.display = 'none';
    btn.disabled = false; btn.textContent = 'Generar Letra con IA';
  }
}

// ── MusicBrainz con regex ─────────────────────────────────
async function searchArtist() {
  const input = document.getElementById('artistSearch');
  const errEl = document.getElementById('artistSearch-error');
  const q = input?.value.trim();

  if (!q || !REGEX.busqueda.test(q)) {
    if (input) input.classList.add('campo-error');
    if (errEl) errEl.textContent = 'Introduce al menos 2 caracteres';
    return;
  }
  if (input) { input.classList.remove('campo-error'); input.classList.add('campo-ok'); }
  if (errEl) errEl.textContent = '';

  const resultsEl = document.getElementById('artistResults');
  if (resultsEl) resultsEl.innerHTML = '<div class="loading-inline"><div class="spinner-sm"></div> Buscando...</div>';

  try {
    const res = await fetch(API_URL + '/musicbrainz?q=' + encodeURIComponent(q));
    const data = await res.json();
    if (!data.success || !data.data?.length) {
      if (resultsEl) resultsEl.innerHTML = '<p class="no-results-sm">No se encontraron artistas.</p>';
      return;
    }
    if (resultsEl) {
      resultsEl.innerHTML = data.data.map(a =>
        `<div class="artist-card"><strong>${a.name}</strong>${a.country ? `<span class="tag">${a.country}</span>` : ''}</div>`
      ).join('');
    }
  } catch (err) {
    if (resultsEl) resultsEl.innerHTML = '<p class="error-msg">Error al buscar en MusicBrainz</p>';
  }
}

// ── Canvas ────────────────────────────────────────────────
function generateCover() {
  const canvas = document.getElementById('coverCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cols = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
  const c1 = cols[Math.floor(Math.random() * cols.length)];
  const c2 = cols[Math.floor(Math.random() * cols.length)];
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const titulo = document.getElementById('songTitle')?.value || 'Musify';
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(titulo.slice(0, 20), canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '14px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('Musify', canvas.width / 2, canvas.height / 2 + 20);
}

function downloadCover() {
  const canvas = document.getElementById('coverCanvas');
  if (!canvas) return;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = (document.getElementById('songTitle')?.value || 'portada') + '.png';
  a.click();
}

// ── Guardar cancion ───────────────────────────────────────
async function saveSong() {
  if (!currentUser) { showMessage('Debes iniciar sesion', 'info'); openAuthModal(); return; }
  const ok = validarCampo('songTitle', /^.{3,100}$/, 'Titulo: entre 3 y 100 caracteres');
  if (!ok) return;
  const title = document.getElementById('songTitle').value.trim();
  const desc = document.getElementById('songDescription')?.value.trim();
  const lyrics = document.getElementById('lyricsInput')?.value.trim();
  const genre = document.getElementById('genreSelect')?.value;
  try {
    const res = await fetch(API_URL + '/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ title, description: desc, lyrics, genre, is_public: 1 }),
    });
    const data = await res.json();
    if (data.success) {
      showMessage('Cancion guardada!', 'success');
      document.getElementById('songTitle').value = '';
      limpiarCampo('songTitle');
    } else showMessage('Error: ' + data.message, 'error');
  } catch (err) { showMessage('Error al guardar', 'error'); }
}

// ── Biblioteca ────────────────────────────────────────────
async function cargarBiblioteca() {
  const container = document.getElementById('userLibrary');
  if (!container) return;
  if (!currentUser) { container.innerHTML = '<p>Inicia sesion para ver tu biblioteca.</p>'; return; }
  try {
    const res = await fetch(API_URL + '/songs?user=' + currentUser.id, { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    const songs = data.data?.data || data.data || [];
    if (!songs.length) {
      container.innerHTML = '<p>No tienes canciones. <a href="#" onclick="navigateTo(\'studio\')">Crea una</a></p>';
      return;
    }
    container.innerHTML = songs.map(s =>
      `<div class="song-card">
        <div class="song-cover"><span class="cover-icon" aria-hidden="true">&#9835;</span></div>
        <div class="song-info">
          <div class="song-title">${s.title}</div>
          <div class="song-genre-tag">${s.genre || 'General'}</div>
          <div class="song-actions">
            <button class="btn btn-sm btn-danger" onclick="eliminarCancion(${s.id})">Eliminar</button>
          </div>
        </div>
      </div>`
    ).join('');
  } catch (err) { console.error(err); }
}

async function eliminarCancion(id) {
  if (!confirm('Eliminar esta cancion?')) return;
  try {
    const res = await fetch(API_URL + '/songs/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    if (data.success) { showMessage('Cancion eliminada', 'success'); cargarBiblioteca(); }
    else showMessage('Error: ' + data.message, 'error');
  } catch (err) { showMessage('Error al eliminar', 'error'); }
}

// ── Contacto con regex (Bloque 10) ───────────────────────
function setupContacto() {
  const form = document.getElementById('formContacto');
  if (!form) return;

  const mapValidacion = {
    contactNombre:  [REGEX.nombre,  'Nombre invalido (3-50 letras)'],
    contactEmail:   [REGEX.email,   'Email invalido'],
    contactAsunto:  [REGEX.asunto,  'Entre 5 y 100 caracteres'],
    contactMensaje: [REGEX.mensaje, 'Entre 10 y 500 caracteres'],
  };

  Object.keys(mapValidacion).forEach(id => {
    document.getElementById(id)?.addEventListener('blur', () => {
      validarCampo(id, mapValidacion[id][0], mapValidacion[id][1]);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resultados = Object.entries(mapValidacion).map(([id, [rx, msg]]) => validarCampo(id, rx, msg));
    const todoValido = resultados.every(Boolean);
    const rgpd = document.getElementById('contactRgpd')?.checked;
    const rgpdErr = document.getElementById('contactRgpd-error');
    if (rgpdErr) rgpdErr.textContent = rgpd ? '' : 'Debes aceptar la politica de privacidad';
    if (!todoValido || !rgpd) return;

    const btn = document.getElementById('btnContacto');
    btn.disabled = true; btn.textContent = 'Enviando...';
    await new Promise(r => setTimeout(r, 800));

    const ok = document.getElementById('contactSuccessState');
    if (ok) ok.style.display = 'flex';
    form.reset();
    Object.keys(mapValidacion).forEach(limpiarCampo);
    btn.disabled = false; btn.textContent = 'Enviar mensaje';
    setTimeout(() => { if (ok) ok.style.display = 'none'; }, 6000);
  });
}

// ── Auth ──────────────────────────────────────────────────
function setupAuthBlur() {
  document.getElementById('loginEmail')?.addEventListener('blur', () => validarCampo('loginEmail', REGEX.email, 'Email invalido'));
  document.getElementById('registerEmail')?.addEventListener('blur', () => validarCampo('registerEmail', REGEX.email, 'Email invalido'));
  document.getElementById('registerUsername')?.addEventListener('blur', () => validarCampo('registerUsername', REGEX.username, 'Usuario: 3-20 caracteres alfanumericos'));
  document.getElementById('registerPassword')?.addEventListener('blur', () => validarCampo('registerPassword', REGEX.password, 'Min. 8 caracteres, 1 mayuscula y 1 numero'));
}

function openAuthModal() { document.getElementById('authModal')?.classList.remove('hidden'); showSection('login'); }

function closeAuthModal() {
  document.getElementById('authModal')?.classList.add('hidden');
  ['loginEmail','loginPassword','registerUsername','registerEmail','registerPassword'].forEach(limpiarCampo);
}

function showSection(s) {
  document.getElementById('loginSection').style.display = s === 'login' ? 'block' : 'none';
  document.getElementById('registerSection').style.display = s === 'register' ? 'block' : 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const emailOk = validarCampo('loginEmail', REGEX.email, 'Email invalido');
  const passEl = document.getElementById('loginPassword');
  if (!emailOk || !passEl?.value) return;
  try {
    const res = await fetch(API_URL + '/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: document.getElementById('loginEmail').value.trim(), password: passEl.value }),
    });
    const data = await res.json();
    if (data.success) {
      token = data.data.token; localStorage.setItem('token', token); currentUser = data.data;
      closeAuthModal(); updateAuthUI(); showMessage('Bienvenido ' + currentUser.username, 'success');
    } else showMessage(data.message || 'Credenciales incorrectas', 'error');
  } catch (err) { showMessage('Error al iniciar sesion', 'error'); }
}

async function handleRegister(e) {
  e.preventDefault();
  const v1 = validarCampo('registerUsername', REGEX.username, 'Usuario invalido');
  const v2 = validarCampo('registerEmail', REGEX.email, 'Email invalido');
  const v3 = validarCampo('registerPassword', REGEX.password, 'Password invalida');
  if (!v1 || !v2 || !v3) return;
  try {
    const res = await fetch(API_URL + '/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('registerUsername').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      token = data.data.token; localStorage.setItem('token', token); currentUser = data.data;
      closeAuthModal(); updateAuthUI(); showMessage('Cuenta creada!', 'success');
    } else showMessage(data.message || 'Error al registrar', 'error');
  } catch (err) { showMessage('Error al registrarse', 'error'); }
}

async function loadUser() {
  if (!token) return;
  try {
    const res = await fetch(API_URL + '/auth/me', { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    if (data.success) { currentUser = data.data; updateAuthUI(); }
    else { token = null; localStorage.removeItem('token'); }
  } catch (err) { console.error(err); }
}

function updateAuthUI() {
  const btn = document.getElementById('authBtn');
  if (!btn) return;
  if (currentUser) { btn.textContent = currentUser.username + ' (Salir)'; btn.onclick = logout; }
  else { btn.textContent = 'Iniciar Sesion'; btn.onclick = openAuthModal; }
}

function logout() {
  token = null; currentUser = null; localStorage.removeItem('token');
  updateAuthUI(); navigateTo('home'); showMessage('Sesion cerrada', 'info');
}

function showMessage(text, type) {
  type = type || 'info';
  const colors = { error: '#ef4444', success: '#10b981', info: '#6366f1', warning: '#f59e0b' };
  const msg = document.createElement('div');
  msg.style.cssText = 'position:fixed;top:20px;right:20px;background:' + colors[type] + ';color:white;padding:12px 20px;border-radius:8px;z-index:3000;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:14px;animation:slideIn .3s ease;';
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => { msg.style.animation = 'slideOut .3s ease'; setTimeout(() => msg.remove(), 300); }, 4000);
}

function goToStudio() { navigateTo('studio'); }
function getToken() { return token; }

function debounce(fn, ms) {
  let t;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}
