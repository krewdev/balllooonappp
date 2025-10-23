const http = require('http')
const https = require('https')

const BASE = process.env.BASE_URL || 'http://localhost:3000'

function check(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE)
    const lib = url.protocol === 'https:' ? https : http
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 5000,
    }

    const req = lib.request(opts, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data })
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy(new Error('timeout'))
    })

    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body))
    req.end()
  })
}

;(async () => {
  try {
    console.log('Running smoke tests against', BASE)

    const home = await check('/')
    console.log('GET / ->', home.status)
    if (home.status !== 200) throw new Error('Home page not OK')

    const meisterPage = await check('/meister/register')
    console.log('GET /meister/register ->', meisterPage.status)
    if (meisterPage.status !== 200) throw new Error('Balloonmeister register page not OK')

    const meisterList = await check('/api/meister/list')
    console.log('GET /api/meister/list ->', meisterList.status)
    if (![200,204].includes(meisterList.status)) throw new Error('meister list endpoint not OK')

    // Minimal create-checkout-session test (non-destructive) - expects 400 or 200 depending on validation
    const cc = await check('/api/create-checkout-session', 'POST', { type: 'meister', tier: 'basic' })
    console.log('POST /api/create-checkout-session ->', cc.status)
    if (![200,201,400,422].includes(cc.status)) throw new Error('create-checkout-session unexpected response')

    console.log('Smoke tests passed')
    process.exit(0)
  } catch (err) {
    console.error('Smoke test failed:', err && err.message ? err.message : err)
    process.exit(2)
  }
})()
