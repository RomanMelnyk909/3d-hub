import type { User } from '@/types/user'
import { db } from './index'

interface DbUserRow {
  id: string
  email: string
  username: string
  password_hash: string
  created_at: number
}

function mapRowToUser(row: DbUserRow): User {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at * 1000).toISOString(),
  }
}

export function createUser(
  email: string,
  username: string,
  passwordHash: string
): User {
  const id = crypto.randomUUID()
  const createdAt = Math.floor(Date.now() / 1000)

  db.prepare(
    `INSERT INTO users (id, email, username, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, email, username, passwordHash, createdAt)

  return {
    id,
    email,
    username,
    passwordHash,
    createdAt: new Date(createdAt * 1000).toISOString(),
  }
}

export function getUserByEmail(email: string): User | null {
  const row = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email) as DbUserRow | undefined
  return row ? mapRowToUser(row) : null
}

export function getUserByUsername(username: string): User | null {
  const row = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username) as DbUserRow | undefined
  return row ? mapRowToUser(row) : null
}
