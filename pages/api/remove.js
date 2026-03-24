export const config = {
  api: {
    bodyParser: false,
  },
}

const REMOVE_BG_URL = 'https://api.remove.bg/v1.0/removebg'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')
  const token = process.env.REMOVE_BG_KEY
  if (!token) return res.status(500).send('Missing REMOVE_BG_KEY')

  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)

    // parse multipart manually with undici FormData (edge safe)
    const form = new FormData()
    form.append('image_file', new Blob([buffer]), 'upload.png')
    form.append('size', 'auto')

    const r = await fetch(REMOVE_BG_URL, {
      method: 'POST',
      headers: { 'X-Api-Key': token },
      body: form,
    })

    if (!r.ok) {
      const text = await r.text()
      return res.status(r.status).send(text)
    }
    const outBuf = Buffer.from(await r.arrayBuffer())
    res.setHeader('Content-Type', 'image/png')
    res.status(200).send(outBuf)
  } catch (err) {
    res.status(500).send(err.message || 'Server error')
  }
}
