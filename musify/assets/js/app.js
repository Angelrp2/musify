// Musify - Aplicación principal

const API_URL = 'http://localhost:8000/api';
let currentUser = null;
let token = localStorage.getItem('token');

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadUser();
    setupEventListeners();
    loadSongs();
});

// Setup de event listeners
function setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateTo(page);
        });
    });

    // Auth
    document.getElementById('authBtn').addEventListener('click', openAuthModal);
    document.querySelector('.close').addEventListener('click', closeAuthModal);

    // Search
    document.getElementById('searchInput')?.addEventListener('input', debounce(searchSongs, 500));
    document.getElementById('genreFilter')?.addEventListener('change', filterSongs);
}

// Theme toggle
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('.theme-icon');
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        icon.textContent = '○';
    }
    
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        icon.textContent = isDark ? '○' : '◐';
    });
}

// Validacion de formularios
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validateUsername(username) {
    return username && username.length >= 3;
}

// Mostrar mensajes profesionales
function showMessage(text, type = 'info') {
    const msg = document.createElement('div');
    msg.className = `message message-${type}`;
    msg.textContent = text;
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 2000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
        font-size: 14px;
    `;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => msg.remove(), 300);
    }, 4000);
}

// Navegación
function navigateTo(page) {
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar página seleccionada
    document.getElementById(`${page}-page`)?.classList.add('active');
    
    // Actualizar nav activo
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Cargar datos según página
    if (page === 'explore') {
        loadSongs();
    } else if (page === 'library') {
        loadUserLibrary();
    }
}

// Autenticación
function openAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function showRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email) {
        showMessage('Por favor ingresa un email', 'info');
        return;
    }
    if (!validateEmail(email)) {
        showMessage('Email inválido', 'error');
        return;
    }
    if (!password) {
        showMessage('Por favor ingresa una contraseña', 'info');
        return;
    }
    if (!validatePassword(password)) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            token = data.data.token;
            localStorage.setItem('token', token);
            currentUser = data.data;
            closeAuthModal();
            updateAuthUI();
            loadUserLibrary();
            showMessage('¡Sesión iniciada!', 'success');
        } else {
            showMessage('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al iniciar sesión', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!username) {
        showMessage('Por favor ingresa un usuario', 'info');
        return;
    }
    if (!validateUsername(username)) {
        showMessage('El usuario debe tener al menos 3 caracteres', 'error');
        return;
    }
    if (!email) {
        showMessage('Por favor ingresa un email', 'info');
        return;
    }
    if (!validateEmail(email)) {
        showMessage('Email inválido', 'error');
        return;
    }
    if (!password) {
        showMessage('Por favor ingresa una contraseña', 'info');
        return;
    }
    if (!validatePassword(password)) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            token = data.data.token;
            localStorage.setItem('token', token);
            currentUser = data.data;
            closeAuthModal();
            updateAuthUI();
            showMessage('¡Cuenta creada!', 'success');
        } else {
            showMessage('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al registrarse', 'error');
    }
}

async function loadUser() {
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            currentUser = data.data;
            updateAuthUI();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    if (currentUser) {
        authBtn.textContent = `${currentUser.username} (Salir)`;
        authBtn.onclick = logout;
    } else {
        authBtn.textContent = 'Iniciar Sesión';
        authBtn.onclick = openAuthModal;
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    updateAuthUI();
    navigateTo('home');
}

// Canciones
async function loadSongs() {
    try {
        const response = await fetch(`${API_URL}/songs?limit=12`);
        const data = await response.json();

        if (data.success) {
            displaySongs(data.data.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displaySongs(songs) {
    const container = document.getElementById('songsList');
    if (!container) return;

    container.innerHTML = songs.map(song => `
        <div class="song-card" onclick="viewSong(${song.id})">
            <div class="song-cover"><span class="cover-icon">♫</span></div>
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.username}</div>
                <div class="song-genre">${song.genre || 'General'}</div>
            </div>
        </div>
    `).join('');
}

async function searchSongs() {
    const query = document.getElementById('searchInput').value;
    if (!query) {
        loadSongs();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/songs?search=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
            displaySongs(data.data.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function filterSongs() {
    const genre = document.getElementById('genreFilter').value;
    const url = genre ? `${API_URL}/songs?genre=${genre}` : `${API_URL}/songs`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            displaySongs(data.data.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function searchMusicBrainz(query) {
    if (!query) return [];
    
    try {
        const response = await fetch(`${API_URL}/musicbrainz?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            showMessage('Error al buscar en MusicBrainz', 'error');
            return [];
        }
    } catch (error) {
        showMessage('Error de conexion', 'error');
        return [];
    }
}

function viewSong(id) {
    showMessage(`Ver canción ${id}`, 'info');
}

// Biblioteca del usuario
async function loadUserLibrary() {
    if (!currentUser) {
        alert('Debes iniciar sesión');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/songs?user=${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
            displayLibrary(data.data.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayLibrary(songs) {
    const container = document.getElementById('userLibrary');
    if (!container) return;

    if (songs.length === 0) {
        container.innerHTML = '<p>No tienes canciones aún. <a href="#" onclick="goToStudio()">Crea una</a></p>';
        return;
    }

    container.innerHTML = songs.map(song => `
        <div class="song-card">
            <div class="song-cover"><span class="cover-icon">♫</span></div>
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-genre">${song.genre || 'General'}</div>
                <button class="btn btn-small" onclick="editSong(${song.id})">Editar</button>
                <button class="btn btn-small btn-danger" onclick="deleteSong(${song.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function editSong(id) {
    alert(`Editar canción ${id}`);
}

function deleteSong(id) {
    if (confirm('¿Eliminar canción?')) {
        alert(`Canción ${id} eliminada`);
    }
}

// AI Studio
function goToStudio() {
    navigateTo('studio');
}

async function generateLyrics() {
    const prompt = document.getElementById('lyricsInput').value;
    if (!prompt) {
        alert('Ingresa un tema');
        return;
    }

    const output = document.getElementById('lyricsOutput');
    output.innerHTML = '<div class="loading"></div> Generando...';
    output.classList.add('active');

    try {
        const response = await fetch(`${API_URL}/ai/generate-lyrics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        if (data.success) {
            output.innerHTML = `<pre>${data.data.lyrics}</pre>`;
        } else {
            output.innerHTML = `<p style="color: red;">${data.message}</p>`;
        }
    } catch (error) {
        output.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

function generateMusic() {
    alert('Generación de música en desarrollo');
}

function generateCover() {
    const canvas = document.getElementById('coverCanvas');
    const ctx = canvas.getContext('2d');
    
    // Dibujar portada simple
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Album Cover', canvas.width / 2, canvas.height / 2);
}

function downloadCover() {
    const canvas = document.getElementById('coverCanvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'cover.png';
    link.click();
}

async function saveSong() {
    if (!currentUser) {
        showMessage('Debes iniciar sesión', 'info');
        return;
    }

    const title = document.getElementById('songTitle').value.trim();
    const description = document.getElementById('songDescription').value.trim();
    const lyrics = document.getElementById('lyricsInput').value.trim();

    if (!title) {
        showMessage('Por favor ingresa un título', 'info');
        return;
    }
    if (title.length < 3) {
        showMessage('El título debe tener al menos 3 caracteres', 'error');
        return;
    }
    if (!lyrics) {
        showMessage('Por favor ingresa letras o descripción', 'info');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/songs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                lyrics,
                genre: document.getElementById('genreSelect').value,
                is_public: true
            })
        });

        const data = await response.json();
        if (data.success) {
            showMessage('¡Canción guardada!', 'success');
            // Limpiar formulario
            document.getElementById('songTitle').value = '';
            document.getElementById('songDescription').value = '';
            document.getElementById('lyricsInput').value = '';
        } else {
            showMessage('Error: ' + data.message, 'error');
        }
    } catch (error) {
        showMessage('Error al guardar: ' + error.message, 'error');
    }
}

// Utilidades
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
