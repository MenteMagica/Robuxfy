USE db_robuxfy;

-- ########## Search ##########
-- search for musics by title
CREATE INDEX idx_musics_title
ON musics (title);

-- search for albums by name
CREATE INDEX idx_albums_name
ON albums (title);

-- search for podcasts by title
CREATE INDEX idx_podcasts_title
ON podcasts (title);

-- search for artists by name
CREATE INDEX idx_artists_name
ON artists (name);

-- ########## Utility ##########
-- add users by username
CREATE INDEX idx_users_username
ON users (username);

-- user interaction data with music
CREATE INDEX idx_user_music_music_id
ON user_music (music_id);

-- users friends relationships
CREATE INDEX idx_user2_id 
ON user_user (user2_id);

-- playlists by user and id
CREATE INDEX idx_user_id_id 
ON playlists (user_id, id);
