import { Router } from 'express';
import { query } from '../db/pool.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signUser } from '../utils/jwt.js';
import { validate, registerSchema, loginSchema } from '../middleware/validators.js';

const router = Router();

router.post('/register', validate(registerSchema), async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const password_hash = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1,$2,$3) RETURNING id, username, email, created_at',
      [username, email, password_hash]
    );
    const user = result.rows[0];
    const token = signUser({ id: user.id, email: user.email, username: user.username });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await query('SELECT id, username, email, password_hash FROM users WHERE email=$1', [email]);
    if (result.rowCount === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = signUser({ id: user.id, email: user.email, username: user.username });
    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
