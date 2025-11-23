USE db_robuxfy;

-- ########## Media-to-associations ##########
CREATE TABLE IF NOT EXISTS music_composer (
	music_id BIGINT UNSIGNED,	
	composer_id INT UNSIGNED,
	
	PRIMARY KEY (music_id, composer_id),

	CONSTRAINT fk_musics_composers_music_id
		FOREIGN KEY (music_id) REFERENCES musics (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_musics_composers_composer_id
		FOREIGN KEY (composer_id) REFERENCES composers (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS music_record (
	music_id BIGINT UNSIGNED,
	record_id INT UNSIGNED,
	
	PRIMARY KEY (music_id, record_id),

	CONSTRAINT fk_musics_records_music_id
		FOREIGN KEY (music_id) REFERENCES musics (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_musics_records_record_id
		FOREIGN KEY (record_id) REFERENCES records (id)
			ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ########## Media-to-media ##########
CREATE TABLE IF NOT EXISTS music_genre (
	music_id BIGINT UNSIGNED,
	genre_id SMALLINT UNSIGNED,
	
	PRIMARY KEY (music_id, genre_id),

	CONSTRAINT fk_musics_genres_music_id
		FOREIGN KEY (music_id) REFERENCES musics (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_musics_genres_genre_id
		FOREIGN KEY (genre_id) REFERENCES genres (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS music_playlist (
	music_id BIGINT UNSIGNED,
	playlist_id BIGINT UNSIGNED,
	
	PRIMARY KEY (music_id, playlist_id),

	CONSTRAINT fk_music_playlist_music_id
		FOREIGN KEY (music_id) REFERENCES musics (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_music_playlist_playlist_id
		FOREIGN KEY (playlist_id) REFERENCES playlists (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS podcast_playlist (
	podcast_id BIGINT UNSIGNED,
	playlist_id BIGINT UNSIGNED,
	
	PRIMARY KEY (podcast_id, playlist_id),

	CONSTRAINT fk_podcast_playlist_podcast_id
		FOREIGN KEY (podcast_id) REFERENCES podcasts (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_podcast_playlist_playlist_id
		FOREIGN KEY (playlist_id) REFERENCES playlists (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;

-- ########## Entity-to-media ##########
CREATE TABLE IF NOT EXISTS user_music (
	id BIGINT UNSIGNED AUTO_INCREMENT,
	user_id INT UNSIGNED,
	music_id BIGINT UNSIGNED,
	time_listened INT DEFAULT 0, -- in seconds
	
	PRIMARY KEY (id),

	CONSTRAINT fk_user_music_user_id
		FOREIGN KEY (user_id) REFERENCES users (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_user_music_music_id
		FOREIGN KEY (music_id) REFERENCES musics (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_podcast (
	id BIGINT UNSIGNED AUTO_INCREMENT,
	user_id INT UNSIGNED,
	podcast_id BIGINT UNSIGNED,
	time_listened INT DEFAULT 0, -- in seconds
	
	PRIMARY KEY (id),

	CONSTRAINT fk_user_podcast_user_id
		FOREIGN KEY (user_id) REFERENCES users (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_user_podcast_podcast_id
		FOREIGN KEY (podcast_id) REFERENCES podcasts (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS artist_music (
	artist_id INT UNSIGNED,
	music_id BIGINT UNSIGNED,
	
	PRIMARY KEY (artist_id, music_id),

	CONSTRAINT fk_artists_musics_artist_id
		FOREIGN KEY (artist_id) REFERENCES artists (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_artists_musics_music_id
		FOREIGN KEY (music_id) REFERENCES musics (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;

-- ########## Entity-to-entity ##########
CREATE TABLE IF NOT EXISTS users_users (
	follower INT UNSIGNED NOT NULL,
	followed INT UNSIGNED NOT NULL,
	
	PRIMARY KEY (follower, followed),

	CONSTRAINT fk_users_users_follower 
		FOREIGN KEY (follower) REFERENCES users (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_users_users_followed
		FOREIGN KEY (followed) REFERENCES users (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;