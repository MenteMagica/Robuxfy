USE db_robuxfy;

-- ########## Media relations ##########
ALTER TABLE musics
    ADD COLUMN cover_image BIGINT UNSIGNED,
    ADD CONSTRAINT fk_musics_cover_image
        FOREIGN KEY (cover_image) REFERENCES images(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

ALTER TABLE musics
    ADD COLUMN album_id INT UNSIGNED,
    ADD CONSTRAINT fk_musics_album_id
        FOREIGN KEY (album_id) REFERENCES albums(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

ALTER TABLE albums
    ADD COLUMN cover_image BIGINT UNSIGNED,
    ADD CONSTRAINT fk_albums_cover_image
        FOREIGN KEY (cover_image) REFERENCES images(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

ALTER TABLE albums
    ADD COLUMN artist_id INT UNSIGNED,
    ADD CONSTRAINT fk_albums_artist_id
        FOREIGN KEY (artist_id) REFERENCES artists(id)
        ON DELETE CASCADE;

ALTER TABLE podcasts
    ADD CONSTRAINT fk_podcasts_cover_image
        FOREIGN KEY (cover_image) REFERENCES images(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

ALTER TABLE podcasts
    ADD COLUMN artist_id INT UNSIGNED,
    ADD CONSTRAINT fk_podcasts_artist_id
        FOREIGN KEY (artist_id) REFERENCES artists(id)
        ON DELETE CASCADE;

ALTER TABLE playlists
    ADD COLUMN user_id INT UNSIGNED,
    ADD CONSTRAINT fk_playlists_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE;

-- ########## Entities relations ########## 
ALTER TABLE users
    ADD COLUMN profile_picture BIGINT UNSIGNED,
    ADD CONSTRAINT fk_users_profile_picture
        FOREIGN KEY (profile_picture) REFERENCES images(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

ALTER TABLE artists
    ADD COLUMN artists_banner BIGINT UNSIGNED,
    ADD CONSTRAINT fk_artists_artists_banner
        FOREIGN KEY (artists_banner) REFERENCES images(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

ALTER TABLE artists
    ADD CONSTRAINT fk_artists_id
        FOREIGN KEY (id) REFERENCES users(id)
        ON DELETE CASCADE;

