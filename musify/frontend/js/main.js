/**
 * Script principal del frontend de Musify
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Verificar si hay token guardado
    const token = localStorage.getItem('token');
    if (token) {
        api.setToken(token);
        loadUserProfile();
    }
}

// Cargar perfil del usuario
async function loadUserProfile() {
    try {
        const response = await api.getProfile();
        console.log('Perfil cargado:', response.data);
        updateUIWithUser(response.data);
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        logout();
    }
}

// Actualizar UI con datos del usuario
function updateUIWithUser(user) {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = user.username;
    }
}

// Registro
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await api.register(username, email, password);
        api.setToken(response.data.token);
        showSuccess('Registro exitoso');
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
    } catch (error) {
        showError(error.message);
    }
}

// Login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await api.login(email, password);
        api.setToken(response.data.token);
        showSuccess('Inicio de sesión exitoso');
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
    } catch (error) {
        showError(error.message);
    }
}

// Logout
async function logout() {
    try {
        await api.logout();
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }

    localStorage.removeItem('token');
    window.location.href = '/';
}

// Crear canción
async function handleCreateSong(event) {
    event.preventDefault();

    const title = document.getElementById('song-title').value;
    const description = document.getElementById('song-description').value;
    const genre = document.getElementById('song-genre').value;
    const mood = document.getElementById('song-mood').value;

    try {
        showLoading('Creando canción...');

        const songData = {
            title,
            description,
            genre,
            mood,
            is_public: 0
        };

        const response = await api.createSong(songData);
        showSuccess('Canción creada exitosamente');

        // Limpiar formulario
        event.target.reset();

        // Recargar lista de canciones
        setTimeout(() => {
            loadUserSongs();
        }, 1000);
    } catch (error) {
        showError(error.message);
    }
}

// Cargar canciones del usuario
async function loadUserSongs() {
    try {
        const response = await api.getSongs();
        displaySongs(response.data);
    } catch (error) {
        console.error('Error al cargar canciones:', error);
        showError('Error al cargar canciones');
    }
}

// Mostrar canciones
function displaySongs(songs) {
    const container = document.getElementById('songs-container');
    if (!container) return;

    if (songs.length === 0) {
        container.innerHTML = '<p>No hay canciones aún. Crea una nueva.</p>';
        return;
    }

    container.innerHTML = songs.map(song => `
        <div class="card">
            <div class="card-header">${song.title}</div>
            <div class="card-body">
                <p><strong>Género:</strong> ${song.genre}</p>
                <p><strong>Mood:</strong> ${song.mood}</p>
                <p><strong>Descripción:</strong> ${song.description}</p>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="viewSongDetail(${song.id})">Ver</button>
                    <button class="btn btn-danger" onclick="deleteSong(${song.id})">Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Ver detalle de canción
async function viewSongDetail(songId) {
    try {
        const response = await api.getSongDetail(songId);
        console.log('Detalle de canción:', response.data);
        // Aquí puedes mostrar un modal con los detalles
    } catch (error) {
        showError('Error al cargar detalle de canción');
    }
}

// Eliminar canción
async function deleteSong(songId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
        return;
    }

    try {
        await api.deleteSong(songId);
        showSuccess('Canción eliminada');
        loadUserSongs();
    } catch (error) {
        showError(error.message);
    }
}

// Agregar a favoritos
async function addToFavorites(songId) {
    try {
        await api.addFavorite(songId);
        showSuccess('Agregado a favoritos');
    } catch (error) {
        showError(error.message);
    }
}

// Mostrar mensajes
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showLoading(message) {
    showNotification(message, 'loading');
}

function showNotification(message, type) {
    const container = document.getElementById('notifications') || createNotificationContainer();

    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notifications';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '2000';
    document.body.appendChild(container);
    return container;
}

// Buscar artistas
async function searchArtists(query) {
    try {
        const response = await api.searchArtists(query);
        console.log('Artistas encontrados:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al buscar artistas:', error);
        return [];
    }
}
