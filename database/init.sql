-- Musify Database Schema
-- SQLite

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'editor', 'premium', 'user')),
    is_public INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CANCIONES
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
    plays INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. PLAYLISTS
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

-- 4. PLAYLIST_SONGS (relación M:N)
CREATE TABLE IF NOT EXISTS playlist_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    UNIQUE(playlist_id, song_id)
);

-- 5. FAVORITOS
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    UNIQUE(user_id, song_id)
);

-- 6. GENERACIONES IA
CREATE TABLE IF NOT EXISTS ai_lyric_ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    generated_lyrics TEXT,
    model TEXT DEFAULT 'ollama-llama3.2',
    status TEXT DEFAULT 'completed' CHECK(status IN ('pending','processing','completed','failed')),
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_public ON songs(is_public);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Usuarios de prueba (contraseña: "password" — hash bcrypt estándar)
INSERT OR IGNORE INTO users (username, email, password_hash, bio, role, is_public) VALUES
('admin',   'admin@musify.local',   '$2y$10$IoVbGBV7uxhywVoukra5Ze4qCjwD8nIcEqwfkghS7rKmonAaKlmr.', 'Administrador de Musify', 'admin',   1),
('editor',  'editor@musify.local',  '$2y$10$IoVbGBV7uxhywVoukra5Ze4qCjwD8nIcEqwfkghS7rKmonAaKlmr.', 'Editor de contenidos',   'editor',  1),
('premium', 'premium@musify.local', '$2y$10$IoVbGBV7uxhywVoukra5Ze4qCjwD8nIcEqwfkghS7rKmonAaKlmr.', 'Usuario premium',        'premium', 1),
('demo',    'demo@musify.local',    '$2y$10$IoVbGBV7uxhywVoukra5Ze4qCjwD8nIcEqwfkghS7rKmonAaKlmr.', 'Usuario de demo',        'user',    1);

-- Canciones de ejemplo
INSERT OR IGNORE INTO songs (user_id, title, description, lyrics, genre, mood, is_public) VALUES
(1, 'Noche Estrellada', 'Una canción sobre la noche', 'Bajo las estrellas brillantes\ncamino sin destino fijo\nbuscando en la oscuridad\nun lugar donde ser libre.', 'Pop',  'Melancólico',  1),
(3, 'Amanecer Digital', 'Primer tema del usuario premium', 'Cuando sale el sol digital\ny los píxeles se despiertan\nel mundo cobra vida\nen un universo nuevo.', 'Indie','Esperanzador', 1),
(2, 'Rock and Code',    'Canción sobre programar', 'Tecleando en la madrugada\nbuscando el bug perdido\nentre líneas de código\nvive mi corazón partido.', 'Rock', 'Intenso',      1);

INSERT OR IGNORE INTO playlists (user_id, title, description, is_public) VALUES
(1, 'Playlist Favorita', 'Mis canciones favoritas', 1);

INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position) VALUES
(1, 1, 1), (1, 2, 2), (1, 3, 3);
