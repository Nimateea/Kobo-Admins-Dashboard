export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0')

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim()
  const demoEmail = process.env.DEMO_EMAIL?.trim().toLowerCase()
  const demoPassword = process.env.DEMO_PASSWORD
  if (process.env.VERCEL_ENV === 'preview' && demoEmail && demoPassword?.length >= 16) {
    return response.status(200).json({ demoMode: true, demoEmail })
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return response.status(503).json({ error: 'Authentication is not configured' })
  }

  let parsedUrl
  try {
    parsedUrl = new URL(supabaseUrl)
  } catch {
    return response.status(503).json({ error: 'Authentication configuration is invalid' })
  }
  if (parsedUrl.protocol !== 'https:') {
    return response.status(503).json({ error: 'Authentication URL must use HTTPS' })
  }

  return response.status(200).json({ supabaseUrl: parsedUrl.origin, supabaseAnonKey })
}