import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const load = async () => {
    try {
      const [p, c] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/posts/${id}/comments`)
      ])
      setPost(p.data)
      setComments(c.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { load() }, [id])

  const addComment = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/posts/${id}/comments`, { content: newComment })
      setNewComment('')
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add comment')
    }
  }

  const onDelete = async () => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${id}`)
      navigate('/')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post')
    }
  }

  if (!post) return <p>Loading...</p>

  const isOwner = isAuthenticated && user?.id === post.author_id

  return (
    <div className="post-detail">
      <h2>{post.title}</h2>
      <p className="meta">By {post.author} • {dayjs(post.created_at).format('YYYY-MM-DD HH:mm')}</p>
      <div className="content">{post.content}</div>

      {isOwner && (
        <div className="owner-actions">
          <Link className="btn" to={`/edit/${post.id}`}>Edit</Link>
          <button className="btn outline" onClick={onDelete}>Delete</button>
        </div>
      )}

      <h3>Comments</h3>
      <ul className="comments">
        {comments.map(c => (
          <li key={c.id} className="comment">
            <div className="comment-meta">{c.author} • {dayjs(c.created_at).format('YYYY-MM-DD HH:mm')}</div>
            <div>{c.content}</div>
          </li>
        ))}
      </ul>

      {isAuthenticated ? (
        <form className="comment-form" onSubmit={addComment}>
          <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Comment" required />
          {error && <div className="error">{error}</div>}
          <button className="btn" type="submit">Add Comment</button>
        </form>
      ) : (
        <p><Link to="/login">Login</Link> to comment</p>
      )}
    </div>
  )
}
