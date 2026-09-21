const { pool } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

async function register(req, res, next) {
  const { email, password, role, fullName } = req.body;

  if (!email || !password || !role || !fullName) {
    return res.status(400).json({ error: 'email, password, role, and fullName are required' });
  }
  if (!['student', 'parent'].includes(role)) {
    return res.status(400).json({ error: 'role must be either "student" or "parent"' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const passwordHash = await hashPassword(password);
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role`,
      [email.toLowerCase().trim(), passwordHash, role]
    );
    const user = userResult.rows[0];

    if (role === 'student') {
      await client.query(
        `INSERT INTO students (user_id, full_name) VALUES ($1, $2)`,
        [user.id, fullName]
      );
    } else {
      await client.query(
        `INSERT INTO parents (user_id, full_name) VALUES ($1, $2)`,
        [user.id, fullName]
      );
    }

    await client.query('COMMIT');

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    next(err);
  } finally {
    client.release();
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, role FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, email, role, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
