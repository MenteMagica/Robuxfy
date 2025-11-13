# Robuxfy API

A minimal Express.js CRUD API that manages **users** and **artists** in memory. It is intended as a starting point that you can extend with persistent storage, authentication, and business rules.

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

| Method | Endpoint        | Description            |
| ------ | ---------------- | ---------------------- |
| GET    | `/api/users`     | List all users         |
| GET    | `/api/users/:id` | Retrieve a user by ID  |
| POST   | `/api/users`     | Create a new user      |
| PUT    | `/api/users/:id` | Update an existing user|
| DELETE | `/api/users/:id` | Remove a user          |

The POST endpoint expects `email`, `username`, and `displayName`. PUT allows any subset of those fields.

### Artists

| Method | Endpoint          | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | `/api/artists`     | List all artists          |
| GET    | `/api/artists/:id` | Retrieve an artist by ID  |
| POST   | `/api/artists`     | Create a new artist       |
| PUT    | `/api/artists/:id` | Update an existing artist |
| DELETE | `/api/artists/:id` | Remove an artist          |

The POST endpoint requires `stageName`. Optional `genre` and `description` values can also be supplied. PUT accepts any subset of those fields.

## Example request

Create a new user:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","username":"newuser","displayName":"New User"}'
```

This project stores data in memory only. Restarting the server resets the collections to the seeded sample data.
