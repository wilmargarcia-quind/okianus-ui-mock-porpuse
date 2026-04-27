const WEBHOOK_URL =
  'https://automations.quind.io/webhook/0b753b94-1a88-4a80-80a7-6a5ae4930f7c'

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  let upstream
  try {
    upstream = await fetch(WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(req.body),
    })
  } catch (err) {
    // fetch itself failed (DNS, connection refused, timeout, etc.)
    return res.status(502).json({ stage: 'fetch', error: err.message })
  }

  let text
  try {
    text = await upstream.text()
  } catch (err) {
    return res.status(502).json({ stage: 'read_body', status: upstream.status, error: err.message })
  }

  if (!upstream.ok) {
    return res.status(502).json({ stage: 'n8n_error', status: upstream.status, body: text })
  }

  try {
    const data = JSON.parse(text)
    return res.status(200).json(data)
  } catch {
    // n8n returned non-JSON — pass through as plain text
    return res.status(200).json({ output: text })
  }
}
