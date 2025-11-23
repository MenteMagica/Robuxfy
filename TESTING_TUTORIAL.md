# Test tutorial

This project ships with Node's built-in test runner. The suite focuses on how the API prepares data before handing it to MySQL, mirroring the stored procedures and search queries described in `slaman.txt`.

## Prerequisites
- Node.js 20+
- Project dependencies installed via `npm install`

## Running the tests
Execute the full suite with:

```bash
npm test
```

## What the tests cover
- **Unified content search** — verifies the SQL query unions artists, musics, podcasts, and albums in the same order and limits listed in `slaman.txt`.
- **User submission** — ensures empty or malformed `profile_picture` payloads are stripped before calling `CALL create_user(?)`.
- **Music submission** — trims fields, enforces numeric artist lists, and preserves valid cover images for `CALL create_single_music(?)`.
- **Album submission** — checks nested music entries are sanitized and invalid entries are dropped before `CALL create_album_with_musics(?)`.

## Tips for extending the suite
- Prefer dependency injection: pass a mocked `pool` to functions so tests can assert on the SQL and parameters.
- Keep fixtures close to the examples in `slaman.txt` to mirror real-world payloads.
- When adding new stored procedure helpers, expose the cleaned payload so tests can compare before-and-after values.
