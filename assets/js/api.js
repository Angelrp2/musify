/**
 * Utilidades para comunicación con API
 */

class ApiClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders()
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la solicitud');
            }

            return data;
        } catch (error) {
            console.error('Error en API:', error);
            throw error;
        }
    }

    // Autenticación
    async register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async getProfile() {
        return this.request('/auth/me', {
            method: 'GET'
        });
    }

    // Canciones
    async getSongs(filters = {}) {
        let query = '/songs/list';
        if (Object.keys(filters).length > 0) {
            const params = new URLSearchParams(filters);
            query += '?' + params.toString();
        }
        return this.request(query, { method: 'GET' });
    }

    async getSongDetail(id) {
        return this.request(`/songs/detail?id=${id}`, {
            method: 'GET'
        });
    }

    async createSong(songData) {
        return this.request('/songs/create', {
            method: 'POST',
            body: JSON.stringify(songData)
        });
    }

    async updateSong(id, songData) {
        return this.request(`/songs/update?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(songData)
        });
    }

    async deleteSong(id) {
        return this.request(`/songs/delete?id=${id}`, {
            method: 'DELETE'
        });
    }

    // Favoritos
    async addFavorite(songId) {
        return this.request(`/favorites/add?id=${songId}`, {
            method: 'POST'
        });
    }

    async removeFavorite(songId) {
        return this.request(`/favorites/remove?id=${songId}`, {
            method: 'DELETE'
        });
    }

    async getFavorites() {
        return this.request('/favorites/list', {
            method: 'GET'
        });
    }

    // Playlists
    async createPlaylist(playlistData) {
        return this.request('/playlists/create', {
            method: 'POST',
            body: JSON.stringify(playlistData)
        });
    }

    async getPlaylists() {
        return this.request('/playlists/list', {
            method: 'GET'
        });
    }

    async addSongToPlaylist(playlistId, songId) {
        return this.request(`/playlists/add-song?id=${playlistId}`, {
            method: 'POST',
            body: JSON.stringify({ song_id: songId })
        });
    }

    // MusicBrainz
    async searchArtists(query) {
        return this.request(`/musicbrainz?q=${encodeURIComponent(query)}`, {
            method: 'GET'
        });
    }
}

// Instancia global
const api = new ApiClient();
