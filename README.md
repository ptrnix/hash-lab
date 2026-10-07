# Hash Lab

A small MERN stack app to experiment with hashing. Enter some text, pick an algorithm, and the backend computes the digest, measures how long it took, and stores it in MongoDB.

## What it shows

- **No plaintext is ever stored**, only the digest, the algorithm and the input length.
- **MD5 and SHA-1** are marked as broken (collision attacks).
- **Salting:** with a random salt, the same input produces a different hash every time. Without it, the same input always gives the same hash, which is what rainbow tables exploit.
- **bcrypt** is slow on purpose. The timing next to each hash makes the difference to SHA-256 visible (roughly 0.05 ms vs. 300 ms at cost factor 12).

## Stack

| Part     | Technology                                             |
| -------- | ------------------------------------------------------ |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Axios           |
| Backend  | Node.js, Express, TypeScript, Mongoose, dotenv         |
| Database | MongoDB in Docker                                      |

## Getting started

Requires Node.js and Docker.

```bash
# 1. configuration (one .env in the project root, used by all three parts)
cp .env.example .env

# 2. database
docker compose up -d

# 3. backend (http://localhost:3000)
cd backend
npm install
npm run dev

# 4. frontend (http://localhost:5173), in a second terminal
cd frontend
npm install
npm run dev
```

## API

| Method | Route             | Description                                      |
| ------ | ----------------- | ------------------------------------------------ |
| GET    | `/api/hashes`     | List all stored hashes, newest first             |
| POST   | `/api/hashes`     | Body: `{ text, algorithm, useSalt }`             |
| DELETE | `/api/hashes/:id` | Delete one hash                                  |

Supported algorithms: `md5`, `sha1`, `sha256`, `sha512`, `bcrypt`.

## Notes

- The MongoDB port is bound to `127.0.0.1` only, so the database is not reachable from the network.
- bcrypt only uses the first 72 bytes of its input. That is a property of the algorithm.
- This is a learning project. For real passwords use bcrypt, scrypt or Argon2, never a plain SHA hash.
