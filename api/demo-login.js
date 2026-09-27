import { createHash, timingSafeEqual } from 'node:crypto'

function equalSecret(actual, expected) {
  const actualHash = createHash('sha256').update(actual).digest()
  const expectedHash = createHash('sha256').update(expected).digest()
  return timingSafeEqual(actualHash, expectedHash)
}

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0')
  if (process.env.VERCEL_ENV !== 'preview') {
    return response.status(404).json({ error: 'Not found' })
  }
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const expectedEmail = process.env.DEMO_EMAIL?.trim().toLowerCase()
  const expectedPassword = process.env.DEMO_PASSWORD
  if (!expectedEmail || !expectedPassword || expectedPassword.length < 16) {
    return response.status(503).json({ error: 'Preview demo sign-in is not configured' })
  }

  const { email, password } = request.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return response.status(400).json({ error: 'Email and password are required' })
  }

  const validEmail = equalSecret(email.trim().toLowerCase(), expectedEmail)
  const validPassword = equalSecret(password, expectedPassword)
  if (!validEmail || !validPassword) {
    return response.status(401).json({ error: 'Invalid demo email or password' })
  }

  return response.status(200).json({
    demo: true,
    user: {
      name: process.env.DEMO_NAME?.trim() || 'Demo Admin',
      email: expectedEmail,
      role: 'Super Admin',
    },
  })
}