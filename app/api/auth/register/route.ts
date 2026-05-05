import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { registrationSchema } from '@/lib/validations'
import { getUserByEmail, getUserByUsername, createUser } from '@/lib/db/users'

function deriveUsername(email: string): string {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase()
  return base || 'user'
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  try {
    const parsed = registrationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    if (getUserByEmail(email)) {
      return NextResponse.json(
        { error: 'Email already in use', code: 'VALIDATION_ERROR' },
        { status: 409 }
      )
    }

    let username = deriveUsername(email)
    if (getUserByUsername(username)) {
      username = `${username}${Math.floor(1000 + Math.random() * 9000)}`
    }

    const passwordHash = await bcrypt.hash(password, 12)
    createUser(email, username, passwordHash)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/auth/register]', error)
    return NextResponse.json(
      { error: 'Registration failed', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
