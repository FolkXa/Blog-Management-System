import dotenv from 'dotenv'
import { pool } from '../db/pool.js'
import { hashPassword } from '../utils/hash.js'

dotenv.config()

async function seed() {
  const client = await pool.connect()
  try {
    console.log('Seeding database...')
    await client.query('BEGIN')

    // Wipe existing data (respect FK order)
    await client.query('DELETE FROM comments')
    await client.query('DELETE FROM posts')
    await client.query('DELETE FROM users')

    // Users
    const passAlice = await hashPassword('password123')
    const passBob = await hashPassword('password123')

    const usersRes = await client.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1,$2,$3), ($4,$5,$6)
       RETURNING id, username, email` ,
      ['alice', 'alice@example.com', passAlice, 'bobby', 'bobby@example.com', passBob]
    )
    const [alice, bob] = usersRes.rows

    // Posts
    const postsRes = await client.query(
      `INSERT INTO posts (user_id, title, content)
       VALUES ($1,$2,$3), ($4,$5,$6), ($7,$8,$9)
       RETURNING id` ,
      [
        alice.id, 'Welcome to the blog', 'This is the first sample post. Have fun!',
        bob.id, 'Node + React Stack', 'We are building a full-stack blog app.',
        bob.id, 'Search Feature', 'Use the search box to find posts quickly.'
      ]
    )
    const [p1, p2, p3] = postsRes.rows

    // Comments
    await client.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES
         ($1, $2, $3),
         ($1, $4, $5),
         ($2, $2, $6)` ,
      [
        p1.id, alice.id, 'First! Great post.',
        bob.id, 'Thanks for sharing!',
        'Loving this tech stack.'
      ]
    )

    await client.query('COMMIT')
    console.log('Seed completed successfully')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
