import formidable from 'formidable'

export const config = { api: { bodyParser: false } }

const REMOVE_BG_URL = 'https://api.remove.bg/v1.0/removebg'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')
  const token = process.env.REMOVE_BG_KEY
  if (!token) return res.status(500).send('Missing REMOVE_BG_KEY')

  try {
    // Parse multipart fields only (no files needed now)
    const { b64 } = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: false })
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        // find first non-empty base64 field
        const candidates = [fields.imageBase64, fields.image_file_b64, fields.image]
        const found = candidates.find((v) => {
          if (Array.isArray(v)) return v[0]
          return v
        })
        if (!found) return reject(new Error('No image data'))
        const val = Array.isArray(found) ? found[0] : found
        resolve({ b64: val })
      })
    })

    const cleanB64 = b64.includes(',') ? b64.split(',')[1] : b64
    const body = new URLSearchParams()
    body.append('image_file_b64', cleanB64)
    body.append('size', 'auto')

    const r = await fetch(REMOVE_BG_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
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
