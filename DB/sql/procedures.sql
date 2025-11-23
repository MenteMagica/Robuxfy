USE db_robuxfy;

DROP PROCEDURE IF EXISTS create_user;
DROP PROCEDURE IF EXISTS create_artist;
DROP PROCEDURE IF EXISTS create_single_music;
DROP PROCEDURE IF EXISTS create_album_with_musics;
DROP PROCEDURE IF EXISTS create_podcast;

-- create user with optional profile picture
CREATE PROCEDURE create_user(IN user_json JSON)
BEGIN
    DECLARE v_username VARCHAR(64);
    DECLARE v_date_of_birth DATE;
    DECLARE v_email VARCHAR(128);
    DECLARE v_password_hash VARCHAR(128);

    -- profile picture (optional)
    DECLARE v_image_type ENUM(
		'users_profile',
		'artists_banner',
		'musics_cover',
		'albums_cover',
		'podcasts_cover',
		'playlists_cover'
	);
    DECLARE v_image_url VARCHAR(1024);
    DECLARE v_image_id BIGINT DEFAULT NULL;

    -- extract user data
    SET v_username      = JSON_UNQUOTE(JSON_EXTRACT(user_json, '$.username'));
    SET v_date_of_birth = JSON_UNQUOTE(JSON_EXTRACT(user_json, '$.date_of_birth'));
    SET v_email         = JSON_UNQUOTE(JSON_EXTRACT(user_json, '$.email'));
    SET v_password_hash = JSON_UNQUOTE(JSON_EXTRACT(user_json, '$.password_hash'));
    SET v_image_type    = JSON_UNQUOTE(JSON_EXTRACT(user_json, '$.profile_picture.type'));
    SET v_image_url     = JSON_UNQUOTE(JSON_EXTRACT(user_json, '$.profile_picture.url'));

    START TRANSACTION;
    -- insert profile picture if provided
    IF v_image_url IS NOT NULL THEN
        INSERT INTO images (type, url)
        VALUES (v_image_type, v_image_url);

        -- get inserted profile picture id
        SET v_image_id = LAST_INSERT_ID();
    END IF;
    -- insert user
    INSERT INTO users (username, date_of_birth, email, password_hash, profile_picture)
    VALUES (v_username, v_date_of_birth, v_email, v_password_hash, v_image_id);

    COMMIT;
END;

-- create artist with optional banner image
CREATE PROCEDURE create_artist(IN artist_json JSON)
BEGIN
    DECLARE v_user_id INT UNSIGNED;
    DECLARE v_name VARCHAR(64);
    DECLARE v_biography VARCHAR(2048);

    -- banner image (optional)
    DECLARE v_image_type ENUM(
		'users_profile',
		'artists_banner',
		'musics_cover',
		'albums_cover',
		'podcasts_cover',
		'playlists_cover'
	);
    DECLARE v_image_url VARCHAR(1024);
    DECLARE v_image_id BIGINT DEFAULT NULL;

    -- extract artist data
    SET v_user_id    = JSON_EXTRACT(artist_json, '$.user_id');
    SET v_name       = JSON_UNQUOTE(JSON_EXTRACT(artist_json, '$.name'));
    SET v_biography  = JSON_UNQUOTE(JSON_EXTRACT(artist_json, '$.biography'));
    SET v_image_type = JSON_UNQUOTE(JSON_EXTRACT(artist_json, '$.banner.type'));
    SET v_image_url  = JSON_UNQUOTE(JSON_EXTRACT(artist_json, '$.banner.url'));

    START TRANSACTION;
    -- insert banner image if provided
    IF v_image_url IS NOT NULL THEN
        INSERT INTO images(type, url)
        VALUES(v_image_type, v_image_url);

        -- get inserted banner image id
        SET v_image_id = LAST_INSERT_ID();
    END IF;
    -- insert artist
    INSERT INTO artists(id, name, biography, artists_banner)
    VALUES (v_user_id, v_name, v_biography, v_image_id);

    COMMIT;
END;

-- create single music with artists and optional cover image
CREATE PROCEDURE create_single_music(IN music_json JSON)
BEGIN
    DECLARE v_music_id BIGINT;
    DECLARE v_title VARCHAR(256);
    DECLARE v_release_date DATE;
    DECLARE v_url VARCHAR(1024);
    DECLARE v_album_id INT UNSIGNED;

    -- cover image (optional)
    DECLARE v_image_type VARCHAR(64);
    DECLARE v_image_url VARCHAR(1024);
    DECLARE v_cover_image BIGINT DEFAULT NULL;

    -- auxiliary variables for artists
    DECLARE v_artists_count INT;
    DECLARE v_artist_id INT;
    DECLARE v_index INT DEFAULT 0;

    -- extract music data
    SET v_title        = JSON_UNQUOTE(JSON_EXTRACT(music_json, '$.title'));
    SET v_release_date = JSON_UNQUOTE(JSON_EXTRACT(music_json, '$.release_date'));
    SET v_url          = JSON_UNQUOTE(JSON_EXTRACT(music_json, '$.url'));
    SET v_album_id     = JSON_EXTRACT(music_json, '$.album_id');
    SET v_image_type   = JSON_UNQUOTE(JSON_EXTRACT(music_json, '$.cover_image.type'));
    SET v_image_url    = JSON_UNQUOTE(JSON_EXTRACT(music_json, '$.cover_image.url'));

    START TRANSACTION;
    -- insert cover image if provided
    IF v_image_url IS NOT NULL THEN
        INSERT INTO images(type, url)
        VALUES (v_image_type, v_image_url);

        -- get inserted cover image id
        SET v_cover_image = LAST_INSERT_ID();
    END IF;
    -- insert music
    INSERT INTO musics (title, release_date, url, cover_image, album_id)
    VALUES (v_title, v_release_date, v_url, v_cover_image, v_album_id);

    -- get inserted music id
    SET v_music_id = LAST_INSERT_ID();

    -- get number of artists
    SET v_artists_count = JSON_LENGTH(JSON_EXTRACT(music_json, '$.artists'));

    -- link artists to music
    WHILE v_index < v_artists_count DO
        SET v_artist_id = JSON_EXTRACT(music_json, CONCAT('$.artists[', v_index, ']'));

        INSERT INTO artist_music(artist_id, music_id)
        VALUES (v_artist_id, v_music_id);

        -- move to the next artist
        SET v_index = v_index + 1;
    END WHILE;

    COMMIT;
END;

-- create album with musics and optional cover image
CREATE PROCEDURE create_album_with_musics(IN album_json JSON)
BEGIN
    DECLARE v_album_id INT;

    --- cover image (optional)
    DECLARE v_image_type VARCHAR(64);
    DECLARE v_image_url VARCHAR(1024);
    DECLARE v_album_cover BIGINT DEFAULT NULL;

    -- auxiliary variables for musics and artists
    DECLARE v_music_id BIGINT;
    DECLARE v_index_m INT DEFAULT 0;
    DECLARE v_index_a INT;
    DECLARE v_musics_count INT;
    DECLARE v_artists_count INT;
    DECLARE v_artist_id INT;

    -- extract album data
    SET v_image_type = JSON_UNQUOTE(JSON_EXTRACT(album_json, '$.cover_image.type'));
    SET v_image_url  = JSON_UNQUOTE(JSON_EXTRACT(album_json, '$.cover_image.url'));

    START TRANSACTION;
    -- insert cover image if provided
    IF v_image_url IS NOT NULL THEN
        INSERT INTO images(type, url)
        VALUES(v_image_type, v_image_url);

        -- get inserted cover image id
        SET v_album_cover = LAST_INSERT_ID();
    END IF;

    -- insert album
    INSERT INTO albums (name, release_date, cover_image, artist_id)
    VALUES (
        JSON_UNQUOTE(JSON_EXTRACT(album_json, '$.name')),
        JSON_UNQUOTE(JSON_EXTRACT(album_json, '$.release_date')),
        v_album_cover,
        JSON_EXTRACT(album_json, '$.artist_id')
    );
    -- get inserted album id
    SET v_album_id = LAST_INSERT_ID();

    -- get number of musics
    SET v_musics_count = JSON_LENGTH(JSON_EXTRACT(album_json, '$.musics'));

    music_loop: WHILE v_index_m < v_musics_count DO

        -- insert music
        INSERT INTO musics (title, release_date, url, cover_image, album_id)
        VALUES (
            JSON_UNQUOTE(JSON_EXTRACT(album_json, CONCAT('$.musics[', v_index_m, '].title'))),
            JSON_UNQUOTE(JSON_EXTRACT(album_json, CONCAT('$.musics[', v_index_m, '].release_date'))),
            JSON_UNQUOTE(JSON_EXTRACT(album_json, CONCAT('$.musics[', v_index_m, '].url'))),
            v_album_cover,
            v_album_id
        );

        -- get inserted music id
        SET v_music_id = LAST_INSERT_ID();

        -- get number of artists for the current music
        SET v_artists_count = JSON_LENGTH(JSON_EXTRACT(album_json, CONCAT('$.musics[', v_index_m, '].artists')));
        SET v_index_a = 0;

        -- link artists to the current music
        artist_loop: WHILE v_index_a < v_artists_count DO

            SET v_artist_id = JSON_EXTRACT(album_json, CONCAT('$.musics[', v_index_m, '].artists[', v_index_a, ']'));

            INSERT INTO artist_music (artist_id, music_id)
            VALUES (v_artist_id, v_music_id);
            -- move to the next artist
            SET v_index_a = v_index_a + 1;
        END WHILE;
        -- move to the next music
        SET v_index_m = v_index_m + 1;

    END WHILE;

    COMMIT;
END;

-- create podcast with optional cover image
CREATE PROCEDURE create_podcast(IN podcast_json JSON)
BEGIN
    DECLARE v_title VARCHAR(256);
    DECLARE v_description VARCHAR(2048);
    DECLARE v_release_date DATE;
    DECLARE v_artist_id INT UNSIGNED;

    -- cover image (optional)
    DECLARE v_image_type VARCHAR(64);
    DECLARE v_image_url VARCHAR(1024);
    DECLARE v_cover_image BIGINT DEFAULT NULL;

    -- extract podcast data
    SET v_title        = JSON_UNQUOTE(JSON_EXTRACT(podcast_json, '$.title'));
    SET v_description  = JSON_UNQUOTE(JSON_EXTRACT(podcast_json, '$.description'));
    SET v_release_date = JSON_UNQUOTE(JSON_EXTRACT(podcast_json, '$.release_date'));
    SET v_artist_id    = JSON_EXTRACT(podcast_json, '$.artist_id');
    SET v_image_type   = JSON_UNQUOTE(JSON_EXTRACT(podcast_json, '$.cover_image.type'));
    SET v_image_url    = JSON_UNQUOTE(JSON_EXTRACT(podcast_json, '$.cover_image.url'));

    START TRANSACTION;
    -- insert cover image if provided
    IF v_image_url IS NOT NULL THEN
        INSERT INTO images(type, url)
        VALUES(v_image_type, v_image_url);

        -- get inserted cover image id
        SET v_cover_image = LAST_INSERT_ID();
    END IF;

    -- insert podcast
    INSERT INTO podcasts (title, description, release_date, cover_image_auto, artist_id)
    VALUES (v_title, v_description, v_release_date, v_cover_image, v_artist_id);

    COMMIT;
END;
