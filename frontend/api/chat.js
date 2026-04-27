const WEBHOOK_URL =
  'https://automations.quind.io/webhook/0b753b94-1a88-4a80-80a7-6a5ae4930f7c'

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    const upstream = await fetch(WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(req.body),
    })
    const data = await upstream.json()
    return res.status(200).json(data)
  } catch (err) {
    return res.status(502).json({ error: 'upstream_error' })
  }
}
