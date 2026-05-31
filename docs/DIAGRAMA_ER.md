# Diagrama Entidad-Relacion — Musify

## Codigo para dbdiagram.io

Pega este codigo en https://dbdiagram.io para generar el diagrama visual:

```
Table users {
  id integer [primary key, increment]
  username varchar(50) [not null, unique]
  email varchar(100) [not null, unique]
  password_hash varchar(255) [not null]
  bio text
  avatar_url text
  role enum('admin','editor','premium','user') [default: 'user']
  is_public boolean [default: true]
  created_at datetime [default: 'now()']
  updated_at datetime
}

Table songs {
  id integer [primary key, increment]
  user_id integer [not null, ref: > users.id]
  title varchar(200) [not null]
  description text
  lyrics text
  audio_url text
  cover_image_url text
  genre varchar(50)
  mood varchar(50)
  duration_seconds integer
  is_public boolean [default: false]
  plays integer [default: 0]
  created_at datetime [default: 'now()']
  updated_at datetime
}

Table playlists {
  id integer [primary key, increment]
  user_id integer [not null, ref: > users.id]
  title varchar(200) [not null]
  description text
  cover_image_url text
  is_public boolean [default: false]
  created_at datetime [default: 'now()']
  updated_at datetime
}

Table playlist_songs {
  id integer [primary key, increment]
  playlist_id integer [not null, ref: > playlists.id]
  song_id integer [not null, ref: > songs.id]
  position integer [default: 0]
  added_at datetime [default: 'now()']
}

Table favorites {
  id integer [primary key, increment]
  user_id integer [not null, ref: > users.id]
  song_id integer [not null, ref: > songs.id]
  created_at datetime [default: 'now()']
}

Table ai_lyric_ideas {
  id integer [primary key, increment]
  user_id integer [not null, ref: > users.id]
  prompt text [not null]
  generated_lyrics text
  model varchar(100) [default: 'ollama-llama3.2']
  status enum('pending','processing','completed','failed') [default: 'completed']
  error_message text
  created_at datetime [default: 'now()']
}
```

## Relaciones

| Tabla origen | Cardinalidad | Tabla destino | Descripcion |
|---|---|---|---|
| users | 1:N | songs | Un usuario tiene muchas canciones |
| users | 1:N | playlists | Un usuario tiene muchas playlists |
| users | 1:N | favorites | Un usuario tiene muchos favoritos |
| users | 1:N | ai_lyric_ideas | Un usuario hace muchas generaciones |
| playlists | M:N | songs | Una playlist tiene muchas canciones y viceversa (via playlist_songs) |
| songs | 1:N | favorites | Una cancion puede ser favorita de muchos usuarios |

## Indices definidos

- idx_songs_user_id — optimiza listado por usuario
- idx_songs_genre — optimiza filtro por genero
- idx_songs_public — optimiza listado de canciones publicas
- idx_playlists_user_id — optimiza listado de playlists
- idx_favorites_user_id — optimiza listado de favoritos
- idx_users_email — optimiza login por email
