-- ########## Search ##########
-- search for musics by title
CREATE INDEX idx_musics_title
ON musics (title);

-- search for musics by album
CREATE INDEX idx_musics_album_id 
ON musics (album_id);

-- search for musics by artist
CREATE INDEX idx_artist_music_music_id 
ON artist_music (music_id);

-- search for albums by name
CREATE INDEX idx_albums_name
ON albums (name);

-- search for podcasts by title
CREATE INDEX idx_podcasts_title
ON podcasts (title);

-- search for artists by name
CREATE INDEX idx_artists_name
ON artists (name);

-- search for playlists by name
CREATE INDEX idx_playlists_name
ON playlists (name);

-- ########## Utility ##########
-- metadata for artist's musics
CREATE INDEX idx_user_music_music_id
ON user_music (music_id);
USE db_robuxfy;

