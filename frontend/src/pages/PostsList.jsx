import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import dayjs from 'dayjs'

export default function PostsList() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/posts', { params: { search, page, limit } })
      setPosts(res.data.data)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [page])

  const onSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="list-page">
      <form className="search" onSubmit={onSearch}>
        <input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn" type="submit">Search</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <ul className="posts">
          {posts.map(p => (
            <li key={p.id} className="post-item">
              <Link to={`/posts/${p.id}`} className="title">{p.title}</Link>
              <p className="meta">By {p.author} • {dayjs(p.created_at).format('YYYY-MM-DD HH:mm')}</p>
              <p className="excerpt">{p.excerpt}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="pagination">
        <button className="btn outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>{page} / {totalPages}</span>
        <button className="btn outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  )
}
