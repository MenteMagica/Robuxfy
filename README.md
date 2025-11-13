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
