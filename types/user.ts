export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  createdAt: string
}

/** Safe for API responses — passwordHash excluded */
export type PublicUser = Omit<User, 'passwordHash'>

/** Stored in NextAuth JWT — minimal, no sensitive fields */
export interface SessionUser {
  userId: string
  email: string
  username: string
}
