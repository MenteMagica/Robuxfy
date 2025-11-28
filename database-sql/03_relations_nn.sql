USE db_robuxfy;

-- ########## Media-to-media ##########
CREATE TABLE IF NOT EXISTS music_genre (
	music_id BIGINT UNSIGNED,
	genre_id SMALLINT UNSIGNED,
	
	PRIMARY KEY (music_id, genre_id),

	CONSTRAINT fk_music_genre_music_id
		FOREIGN KEY (music_id) REFERENCES musics (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_music_genre_genre_id
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

CREATE TABLE IF NOT EXISTS podcast_genre (
	podcast_id BIGINT UNSIGNED,
	genre_id SMALLINT UNSIGNED,
	
	PRIMARY KEY (podcast_id, genre_id),

	CONSTRAINT fk_podcast_genre_podcast_id
		FOREIGN KEY (podcast_id) REFERENCES podcasts (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_podcast_genre_genre_id
		FOREIGN KEY (genre_id) REFERENCES genres (id)
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
	user_id INT UNSIGNED,
	music_id BIGINT UNSIGNED,
	is_like BOOLEAN DEFAULT FALSE,
	
	PRIMARY KEY (user_id, music_id),

	CONSTRAINT fk_user_music_user_id
		FOREIGN KEY (user_id) REFERENCES users (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_user_music_music_id
		FOREIGN KEY (music_id) REFERENCES musics (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_podcast (
	user_id INT UNSIGNED,
	podcast_id BIGINT UNSIGNED,
	is_like BOOLEAN DEFAULT FALSE,
	
	PRIMARY KEY (user_id, podcast_id),

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

	CONSTRAINT fk_artist_music_artist_id
		FOREIGN KEY (artist_id) REFERENCES artists (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_artist_music_music_id
		FOREIGN KEY (music_id) REFERENCES musics (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;

-- ########## Entity-to-entity ##########
CREATE TABLE IF NOT EXISTS user_user (
	user1_id INT UNSIGNED NOT NULL,
	user2_id INT UNSIGNED NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'BLOCKED') DEFAULT 'PENDING',
	
	PRIMARY KEY (user1_id, user2_id),

	CONSTRAINT fk_user_user_user1_id
		FOREIGN KEY (user1_id) REFERENCES users (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_user_user_user2_id
		FOREIGN KEY (user2_id) REFERENCES users (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_artist (
	user_id INT UNSIGNED NOT NULL,
	artist_id INT UNSIGNED NOT NULL,
	
	PRIMARY KEY (user_id, artist_id),

	CONSTRAINT fk_user_artist_user_id
		FOREIGN KEY (user_id) REFERENCES users (id)
			ON DELETE CASCADE,
	CONSTRAINT fk_user_artist_artist_id
		FOREIGN KEY (artist_id) REFERENCES artists (id)
			ON DELETE CASCADE
) ENGINE=InnoDB;