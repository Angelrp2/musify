-- Musify Database Schema
-- SQLite

-- 1. USUARIOS (Autenticación y perfil)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'editor', 'user', 'guest')),
    is_public INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CANCIONES (Contenido musical)
CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    lyrics TEXT,
    audio_url TEXT,
    cover_image_url TEXT,
    genre TEXT,
    mood TEXT,
    duration_seconds INTEGER,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. PLAYLISTS (Colecciones de canciones)
CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. PLAYLIST_SONGS (Relación muchos a muchos)
CREATE TABLE IF NOT EXISTS playlist_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    position INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    UNIQUE(playlist_id, song_id)
);

-- 5. FAVORITOS (Canciones guardadas)
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    UNIQUE(user_id, song_id)
);

-- 6. IDEAS_IA (Historial de generaciones IA)
CREATE TABLE IF NOT EXISTS ai_lyric_ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    generated_lyrics TEXT,
    model TEXT DEFAULT 'ollama-llama3.2',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_public ON songs(is_public);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Datos de prueba
INSERT INTO users (username, email, password_hash, bio, role, is_public) VALUES
('admin', 'admin@musify.local', '$2y$10$TzQwHIftcjFkXCmQm2sU4OspoIV.GcR.ppTgkXXcsd47rAl508wJ.', 'Administrador de Musify', 'admin', 1),
('editor', 'editor@musify.local', '$2y$10$MrGdB19lk0ZmEmw3qX/CWeqN2i2moZ2IAhIPfOWMI7Z6CWSB5JKrS', 'Editor de contenido', 'editor', 1),
('demo_user', 'demo@musify.local', '$2y$10$o8jPU6FJCe9rArhZyNOwluuK89wfudQiMvKNUDmGcu2xP4sUN31Xm', 'Usuario de demostración', 'user', 1),
('guest', 'guest@musify.local', '$2y$10$ZGkmazm3GO/pKo0Gol/4SuvoJDDPbCLCEI37lrvaWgB7EMfeoBtQK', 'Usuario invitado', 'guest', 1);

INSERT INTO songs (user_id, title, description, lyrics, genre, mood, duration_seconds, is_public) VALUES
(2, 'Noche Estrellada', 'Una canción sobre la noche', 'Bajo las estrellas brillantes...', 'Pop', 'Melancólico', 180, 1),
(2, 'Amanecer', 'Primer tema del usuario demo', 'Cuando sale el sol...', 'Indie', 'Esperanzador', 240, 1);

INSERT INTO playlists (user_id, title, description, is_public) VALUES
(2, 'Mi Playlist Favorita', 'Mis canciones favoritas', 1);

INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES
(1, 1, 1),
(1, 2, 2);
