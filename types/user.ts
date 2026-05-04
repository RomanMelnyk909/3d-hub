export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  createdAt: string
}

/** Safe for API responses — passwordHash excluded */
export interface PublicUser {
  id: string
  email: string
  username: string
  createdAt: string
}

/** Stored in NextAuth JWT — minimal, no sensitive fields */
export interface SessionUser {
  userId: string
  email: string
  username: string
}
