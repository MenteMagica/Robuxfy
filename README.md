# Robuxfy API

A minimal Express.js CRUD API that manages **users** and **artists** in memory. It now includes lightweight validation, duplicate protection, and search helpers so you can extend it with persistent storage, authentication, and richer business rules.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000` by default.

3. To run it without automatic restarts, use:

   ```bash
   npm start
   ```

## Available endpoints

All endpoints are prefixed with `/api`.

### Users

| Method | Endpoint        | Description                                                 |
| ------ | ---------------- | ----------------------------------------------------------- |
| GET    | `/api/users`     | List users, optionally filter with `email`, `username`, or `search` |
| GET    | `/api/users/:id` | Retrieve a user by ID                                       |
| POST   | `/api/users`     | Create a new user (requires `email`, `username`, `displayName`) |
| PUT    | `/api/users/:id` | Replace a user (requires `email`, `username`, `displayName`) |
| PATCH  | `/api/users/:id` | Partially update a user                                     |
| POST   | `/api/users/:id/picture` | Accepts a `pictureUrl` and stores it in the relational `images` table, updating the user's `profile_picture` foreign key |
| DELETE | `/api/users/:id` | Remove a user                                               |

Users must have a unique `email` and `username`. Email addresses are validated and stored in lowercase.

### Artists

| Method | Endpoint          | Description                                                     |
| ------ | ----------------- | --------------------------------------------------------------- |
| GET    | `/api/artists`     | List artists, optionally filter with `genre` or `search`        |
| GET    | `/api/artists/:id` | Retrieve an artist by ID                                        |
| POST   | `/api/artists`     | Create a new artist (requires `stageName`)                      |
| PUT    | `/api/artists/:id` | Replace an artist (requires `stageName`)                        |
| PATCH  | `/api/artists/:id` | Partially update an artist                                      |
| DELETE | `/api/artists/:id` | Remove an artist                                                |

The POST endpoint requires a unique `stageName`. Optional `genre` and `description` values can also be supplied.

### Database configuration for picture storage

Saving profile or cover images requires a MySQL database that contains the `users` and `images` tables described in the project brief. Configure the connection through the following environment variables before starting the API:

| Variable | Description |
| --- | --- |
| `DB_HOST` | MySQL host name or IP |
| `DB_PORT` | Optional port (defaults to `3306`) |
| `DB_USER` | Database user with permission to read/write the `users` and `images` tables |
| `DB_PASSWORD` | Optional password for the database user |
| `DB_NAME` | Database/schema that contains the tables |
| `DB_CONNECTION_LIMIT` | Optional pool size (defaults to `10`) |

If these variables are not present, regular CRUD endpoints keep working, but the `/api/users/:id/picture` route returns a 500 error explaining which variables are missing.

The repository ships with a single set of database scripts in `DB/sql` that create the `db_robuxfy` schema, tables, foreign keys,
indexes, and stored procedures expected by the API helpers. Run the scripts in numerical order to provision a fresh database.

### Picture upload helper

Endpoint: `POST /api/users/:id/picture`

Request body:

```json
{
  "pictureUrl": "https://example.com/avatar.png",
  "type": "profile" // or "cover"
}
```

Behaviour:

1. Validates the `pictureUrl` length (max `2047` characters) and type (`profile` or `cover`).
2. Inserts the URL into the `images` table.
3. Updates the `users.profile_picture` column with the inserted image id – honoring the foreign-key constraint you provided.
4. Returns the image metadata along with the updated in-memory user.

### Filtering examples

```bash
# Find a user by username (case insensitive)
curl "http://localhost:3000/api/users?username=alex123"

# Search for artists with "dream" in the name or description
curl "http://localhost:3000/api/artists?search=dream"
```

## Example request

Create a new user:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","username":"newuser","displayName":"New User"}'
```

This project stores data in memory only. Restarting the server resets the collections to the seeded sample data.

## Tests

The repository uses Node's built-in test runner. To execute the suite:

```bash
npm test
```

See [TESTING_TUTORIAL.md](TESTING_TUTORIAL.md) for guidance on what each test asserts and how to extend the coverage alongside the stored procedures described in `slaman.txt`.
