import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'

export default function PostForm({ mode }) {
  const isEdit = mode === 'edit'
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return
      try {
        const res = await api.get(`/posts/${id}`)
        setTitle(res.data.title)
        setContent(res.data.content)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [id, isEdit])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isEdit) {
        await api.put(`/posts/${id}`, { title, content })
        navigate(`/posts/${id}`)
      } else {
        const res = await api.post('/posts', { title, content })
        navigate(`/posts/${res.data.id}`)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save post')
    }
  }

  return (
    <div className="card form-card">
      <h2>{isEdit ? 'Edit Post' : 'New Post'}</h2>
      <form onSubmit={onSubmit}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Content</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} required />

        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit">{isEdit ? 'Update' : 'Create'}</button>
      </form>
    </div>
  )
}
