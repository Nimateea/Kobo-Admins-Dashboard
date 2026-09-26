import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { resolve } from 'node:path'
import configHandler from '../api/config.js'

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const schema = await readFile(new URL('../supabase/migrations/20260926000000_admin_profiles.sql', import.meta.url), 'utf8')
const deployment = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'))

test('all inline scripts parse as JavaScript', () => {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes, body]) => !/(?:^|\s)src\s*=/.test(attributes) && body.trim())
  assert.equal(scripts.length, 3)
  for (const [, , body] of scripts) assert.doesNotThrow(() => new Function(body))
})

test('login requires Supabase password, verified TOTP, and an active admin profile', () => {
  assert.match(html, /auth\.signInWithPassword\(/)
  assert.match(html, /auth\.mfa\.listFactors\(/)
  assert.match(html, /auth\.mfa\.enroll\(/)
  assert.match(html, /auth\.mfa\.verify\(/)
  assert.match(html, /from\('admin_profiles'\)/)
  assert.match(html, /profile\.status!=='active'/)
  assert.doesNotMatch(html, /KoboAdmin#2026|demo: any 6 digits/)
})

test('auth config fails closed when Supabase environment values are absent', () => {
  const previousUrl = process.env.SUPABASE_URL
  const previousKey = process.env.SUPABASE_ANON_KEY
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_ANON_KEY
  const result = invokeConfig('GET')
  if (previousUrl === undefined) delete process.env.SUPABASE_URL
  else process.env.SUPABASE_URL = previousUrl
  if (previousKey === undefined) delete process.env.SUPABASE_ANON_KEY
  else process.env.SUPABASE_ANON_KEY = previousKey
  assert.equal(result.statusCode, 503)
  assert.deepEqual(result.body, { error: 'Authentication is not configured' })
  assert.equal(result.headers['Cache-Control'], 'no-store, max-age=0')
})

test('auth config exposes only public client credentials over HTTPS', () => {
  const previousUrl = process.env.SUPABASE_URL
  const previousKey = process.env.SUPABASE_ANON_KEY
  process.env.SUPABASE_URL = 'https://example.supabase.co/path'
  process.env.SUPABASE_ANON_KEY = 'public-anon-key'
  const result = invokeConfig('GET')
  if (previousUrl === undefined) delete process.env.SUPABASE_URL
  else process.env.SUPABASE_URL = previousUrl
  if (previousKey === undefined) delete process.env.SUPABASE_ANON_KEY
  else process.env.SUPABASE_ANON_KEY = previousKey
  assert.equal(result.statusCode, 200)
  assert.deepEqual(result.body, {
    supabaseUrl: 'https://example.supabase.co',
    supabaseAnonKey: 'public-anon-key',
  })
  assert.equal('serviceRoleKey' in result.body, false)
})

test('auth config rejects non-GET requests and non-HTTPS URLs', () => {
  assert.equal(invokeConfig('POST').statusCode, 405)
  const previousUrl = process.env.SUPABASE_URL
  const previousKey = process.env.SUPABASE_ANON_KEY
  process.env.SUPABASE_URL = 'http://example.supabase.co'
  process.env.SUPABASE_ANON_KEY = 'public-anon-key'
  const result = invokeConfig('GET')
  if (previousUrl === undefined) delete process.env.SUPABASE_URL
  else process.env.SUPABASE_URL = previousUrl
  if (previousKey === undefined) delete process.env.SUPABASE_ANON_KEY
  else process.env.SUPABASE_ANON_KEY = previousKey
  assert.equal(result.statusCode, 503)
  assert.deepEqual(result.body, { error: 'Authentication URL must use HTTPS' })
})

test('admin profile access is row-scoped and clients cannot write roles', () => {
  assert.match(schema, /enable row level security/i)
  assert.match(schema, /force row level security/i)
  assert.match(schema, /user_id = \(select auth\.uid\(\)\)/)
  assert.match(schema, /revoke all on public\.admin_profiles from anon, authenticated/i)
  assert.doesNotMatch(schema, /for (?:insert|update|delete)\s+to authenticated/i)
})

test('deployment applies baseline browser security headers', () => {
  const headers = deployment.headers[0].headers
  const configured = new Map(headers.map(({ key, value }) => [key.toLowerCase(), value]))
  assert.equal(configured.get('x-content-type-options'), 'nosniff')
  assert.equal(configured.get('x-frame-options'), 'DENY')
  assert.equal(configured.get('referrer-policy'), 'strict-origin-when-cross-origin')
  assert.ok(configured.has('permissions-policy'))
})

test('serverless config handler passes Node syntax check', async () => {
  const { spawnSync } = await import('node:child_process')
  const result = spawnSync(process.execPath, ['--check', resolve('api/config.js')], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})

function invokeConfig(method) {
  const result = { headers: {}, statusCode: 200, body: undefined }
  const response = {
    setHeader(name, value) { result.headers[name] = value },
    status(code) { result.statusCode = code; return this },
    json(body) { result.body = body; return this },
  }
  configHandler({ method }, response)
  return result
}