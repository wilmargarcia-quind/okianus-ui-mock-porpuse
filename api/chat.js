const WEBHOOK_URL =
  'https://automations.quind.io/webhook/0b753b94-1a88-4a80-80a7-6a5ae4930f7c'

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  // 25-second timeout — n8n AI can be slow
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25_000)

  let upstream
  try {
    upstream = await fetch(WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(req.body),
      signal:  controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    const isTimeout = err.name === 'AbortError'
    console.error('[chat] fetch failed:', err.name, err.message)
    return res.status(502).json({
      stage: isTimeout ? 'timeout' : 'fetch',
      error: err.message,
    })
  }

  clearTimeout(timer)

  let text
  try {
    text = await upstream.text()
  } catch (err) {
    console.error('[chat] read_body failed:', err.message)
    return res.status(502).json({
      stage:  'read_body',
      status: upstream.status,
      error:  err.message,
    })
  }

  if (!upstream.ok) {
    console.error('[chat] n8n_error status=%d body=%s', upstream.status, text.slice(0, 200))
    return res.status(502).json({
      stage:  'n8n_error',
      status: upstream.status,
      body:   text.slice(0, 500),
    })
  }

  try {
    const data = JSON.parse(text)
    return res.status(200).json(data)
  } catch {
    // n8n returned non-JSON — wrap as { output }
    return res.status(200).json({ output: text })
  }
}
