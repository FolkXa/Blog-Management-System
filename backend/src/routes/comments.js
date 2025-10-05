import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, commentSchema } from '../middleware/validators.js';

const router = Router();

// List comments for a post
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params; // post id
  try {
    const result = await query(
      `SELECT c.id, c.content, c.created_at, u.username AS author
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.post_id=$1 ORDER BY c.created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to a post
router.post('/:id/comments', requireAuth, validate(commentSchema), async (req, res) => {
  const { id } = req.params; // post id
  const { content } = req.body;
  try {
    // ensure post exists
    const post = await query('SELECT id FROM posts WHERE id=$1', [id]);
    if (post.rowCount === 0) return res.status(404).json({ error: 'Post not found' });

    const result = await query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1,$2,$3) RETURNING id, content, created_at',
      [id, req.user.id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
