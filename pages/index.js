import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png'].includes(f.type)) return setError('仅支持 JPG/PNG')
    if (f.size > 10 * 1024 * 1024) return setError('文件需小于 10MB')
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResultUrl(null)
  }

  const onSubmit = async () => {
    if (!file) return setError('请先选择图片')
    setLoading(true)
    setError('')
    setResultUrl(null)
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl }),
      })
      if (!res.ok) throw new Error((await res.text()) || `处理失败(${res.status})`)
      const blob = await res.blob()
      setResultUrl(URL.createObjectURL(blob))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Image Background Remover</h1>
          <p className="text-sm text-slate-600 mt-2">上传 JPG/PNG，返回透明背景 PNG，文件大小 &lt; 10MB。</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <input type="file" accept="image/*" onChange={onFileChange} />
          <button className="btn w-full md:w-auto" onClick={onSubmit} disabled={loading}>
            {loading ? '处理中...' : '去背景'}
          </button>
        </div>
        {error && <div className="text-red-600 text-sm whitespace-pre-line">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">原图</h3>
            <div className="border rounded-md bg-slate-100 aspect-video flex items-center justify-center overflow-hidden">
              {preview ? <img src={preview} alt="preview" className="object-contain h-full w-full" /> : <span className="text-slate-400">未选择</span>}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">抠图结果</h3>
            <div className="border rounded-md bg-slate-100 aspect-video flex items-center justify-center overflow-hidden">
              {resultUrl ? <img src={resultUrl} alt="result" className="object-contain h-full w-full" /> : <span className="text-slate-400">无结果</span>}
            </div>
            {resultUrl && (
              <div className="mt-3 flex gap-3 flex-wrap">
                <a className="btn" download="removed.png" href={resultUrl}>下载 PNG</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
