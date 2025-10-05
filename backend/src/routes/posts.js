import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, postCreateSchema, postUpdateSchema } from '../middleware/validators.js';

const router = Router();

// List posts with search and pagination
router.get('/', async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  try {
    let where = '';
    let params = [];
    if (search) {
      where = "WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'')) @@ plainto_tsquery('english', $1)";
      params.push(search);
    }

    const listSql = `
      SELECT p.id, p.title, left(p.content, 200) AS excerpt, p.created_at, p.updated_at,
             u.username AS author
      FROM posts p
      JOIN users u ON u.id = p.user_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;
    const countSql = `SELECT COUNT(*) FROM posts p ${where}`;

    const [listRes, countRes] = await Promise.all([
      query(listSql, params),
      query(countSql, params)
    ]);

    res.json({
      data: listRes.rows,
      page: Number(page),
      limit: Number(limit),
      total: Number(countRes.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get post by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `SELECT p.id, p.title, p.content, p.created_at, p.updated_at, u.username AS author, u.id as author_id
       FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id=$1`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create post
router.post('/', requireAuth, validate(postCreateSchema), async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1,$2,$3) RETURNING id, title, content, created_at, updated_at',
      [req.user.id, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post (owner only)
router.put('/:id', requireAuth, validate(postUpdateSchema), async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const ownerRes = await query('SELECT user_id FROM posts WHERE id=$1', [id]);
    if (ownerRes.rowCount === 0) return res.status(404).json({ error: 'Post not found' });
    if (ownerRes.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const fields = [];
    const values = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title=$${idx++}`); values.push(title); }
    if (content !== undefined) { fields.push(`content=$${idx++}`); values.push(content); }
    fields.push(`updated_at=NOW()`);

    const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id=$${idx} RETURNING id, title, content, created_at, updated_at`;
    values.push(id);
    const result = await query(sql, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const ownerRes = await query('SELECT user_id FROM posts WHERE id=$1', [id]);
    if (ownerRes.rowCount === 0) return res.status(404).json({ error: 'Post not found' });
    if (ownerRes.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await query('DELETE FROM posts WHERE id=$1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
