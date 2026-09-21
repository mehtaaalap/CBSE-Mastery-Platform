const { pool } = require('../config/db');

async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, full_name, phone FROM parents WHERE user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent profile not found' });
    }
    res.json({ parent: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  const { fullName, phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE parents
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           updated_at = now()
       WHERE user_id = $3
       RETURNING id, full_name, phone`,
      [fullName || null, phone || null, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parent profile not found' });
    }
    res.json({ parent: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function linkStudent(req, res, next) {
  const { studentEmail, relationship } = req.body;
  if (!studentEmail) {
    return res.status(400).json({ error: 'studentEmail is required' });
  }

  try {
    const parentResult = await pool.query(`SELECT id FROM parents WHERE user_id = $1`, [
      req.user.id,
    ]);
    if (parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parent profile not found' });
    }
    const parentId = parentResult.rows[0].id;

    const studentResult = await pool.query(
      `SELECT s.id, s.full_name FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE u.email = $1`,
      [studentEmail.toLowerCase().trim()]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'No student account found with that email' });
    }
    const student = studentResult.rows[0];

    await pool.query(
      `INSERT INTO parent_student_links (parent_id, student_id, relationship)
       VALUES ($1, $2, $3)
       ON CONFLICT (parent_id, student_id) DO UPDATE SET relationship = EXCLUDED.relationship`,
      [parentId, student.id, relationship || 'guardian']
    );

    res.status(201).json({ linked: { id: student.id, fullName: student.full_name } });
  } catch (err) {
    next(err);
  }
}

async function getLinkedStudents(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT s.id, s.full_name, s.grade, psl.relationship,
              COALESCE(AVG(sp.mastery_level), 0)::int AS overall_mastery
       FROM parent_student_links psl
       JOIN parents p ON p.id = psl.parent_id
       JOIN students s ON s.id = psl.student_id
       LEFT JOIN student_progress sp ON sp.student_id = s.id
       WHERE p.user_id = $1
       GROUP BY s.id, s.full_name, s.grade, psl.relationship
       ORDER BY s.full_name`,
      [req.user.id]
    );
    res.json({ students: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, linkStudent, getLinkedStudents };
