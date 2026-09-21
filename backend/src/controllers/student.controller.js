const { pool } = require('../config/db');

async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT s.id, s.full_name, s.grade, s.board, s.date_of_birth, s.onboarded_at,
              sc.id AS school_id, sc.name AS school_name
       FROM students s
       LEFT JOIN schools sc ON sc.id = s.school_id
       WHERE s.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    res.json({ student: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  const { fullName, grade, schoolName, dateOfBirth } = req.body;

  if (grade !== undefined && (grade < 6 || grade > 12)) {
    return res.status(400).json({ error: 'grade must be between 6 and 12' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let schoolId = null;
    if (schoolName) {
      const existing = await client.query(`SELECT id FROM schools WHERE name = $1`, [schoolName]);
      if (existing.rows.length > 0) {
        schoolId = existing.rows[0].id;
      } else {
        const created = await client.query(
          `INSERT INTO schools (name) VALUES ($1) RETURNING id`,
          [schoolName]
        );
        schoolId = created.rows[0].id;
      }
    }

    const result = await client.query(
      `UPDATE students
       SET full_name = COALESCE($1, full_name),
           grade = COALESCE($2, grade),
           school_id = COALESCE($3, school_id),
           date_of_birth = COALESCE($4, date_of_birth),
           onboarded_at = COALESCE(onboarded_at, now()),
           updated_at = now()
       WHERE user_id = $5
       RETURNING id, full_name, grade, board, school_id, date_of_birth, onboarded_at`,
      [fullName || null, grade || null, schoolId, dateOfBirth || null, req.user.id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Student profile not found' });
    }

    await client.query('COMMIT');
    res.json({ student: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function getProgress(req, res, next) {
  try {
    const studentResult = await pool.query(`SELECT id FROM students WHERE user_id = $1`, [
      req.user.id,
    ]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const studentId = studentResult.rows[0].id;

    const progress = await pool.query(
      `SELECT sub.id AS subject_id, sub.name AS subject_name,
              COALESCE(AVG(sp.mastery_level), 0)::int AS average_mastery,
              COUNT(sp.id) AS topics_started
       FROM subjects sub
       LEFT JOIN chapters c ON c.subject_id = sub.id
       LEFT JOIN topics t ON t.chapter_id = c.id
       LEFT JOIN student_progress sp ON sp.topic_id = t.id AND sp.student_id = $1
       WHERE sub.grade = (SELECT grade FROM students WHERE id = $1)
       GROUP BY sub.id, sub.name
       ORDER BY sub.name`,
      [studentId]
    );

    res.json({ subjects: progress.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, getProgress };
