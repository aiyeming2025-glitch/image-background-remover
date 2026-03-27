import fs from 'fs'
import formidable from 'formidable'
import FormData from 'form-data'

export const config = { api: { bodyParser: false } }

const REMOVE_BG_URL = 'https://api.remove.bg/v1.0/removebg'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')
  const token = process.env.REMOVE_BG_KEY
  if (!token) return res.status(500).send('Missing REMOVE_BG_KEY')

  try {
    const { filepath, filename, mimetype } = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: false, keepExtensions: true })
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        const f = Array.isArray(files.image) ? files.image[0] : files.image
        if (!f) return reject(new Error('No file'))
        resolve({ filepath: f.filepath, filename: f.originalFilename || 'upload.jpg', mimetype: f.mimetype || 'image/jpeg' })
      })
    })

    const fd = new FormData()
    fd.append('image_file', fs.createReadStream(filepath), { filename, contentType: mimetype })
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
