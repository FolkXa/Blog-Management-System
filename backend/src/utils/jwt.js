import jwt from 'jsonwebtoken';

export function signUser(user) {
  const payload = { sub: user.id, email: user.email, username: user.username };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}
