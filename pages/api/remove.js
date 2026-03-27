import FormData from 'form-data'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
}

const REMOVE_BG_URL = 'https://api.remove.bg/v1.0/removebg'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')
  const token = process.env.REMOVE_BG_KEY
  if (!token) return res.status(500).send('Missing REMOVE_BG_KEY')

  try {
    const { imageBase64, mime = 'image/png' } = req.body || {}
    if (!imageBase64) return res.status(400).send('No image data')
    // strip possible data URL prefix
    const b64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
    const buffer = Buffer.from(b64, 'base64')

    const fd = new FormData()
    fd.append('image_file', buffer, { filename: 'upload.png', contentType: mime })
    fd.append('size', 'auto')

    const r = await fetch(REMOVE_BG_URL, {
      method: 'POST',
      headers: { 'X-Api-Key': token, ...fd.getHeaders() },
      body: fd,
    })

    if (!r.ok) {
      const text = await r.text()
      console.error('remove.bg error', r.status, text)
      return res.status(r.status).send(text)
    }
    const outBuf = Buffer.from(await r.arrayBuffer())
    res.setHeader('Content-Type', 'image/png')
    res.status(200).send(outBuf)
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message || 'Server error')
  }
}
