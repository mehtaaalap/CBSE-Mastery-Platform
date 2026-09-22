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
    const studentResult = await pool.query(`SELECT id, grade FROM students WHERE user_id = $1`, [
      req.user.id,
    ]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const { id: studentId, grade } = studentResult.rows[0];

    const subjectsResult = await pool.query(
      `SELECT id, name FROM subjects WHERE grade = $1 ORDER BY name`,
      [grade]
    );

    const topicsResult = await pool.query(
      `SELECT sub.id AS subject_id, c.name AS chapter_name, t.id AS topic_id, t.name AS topic_name,
              COALESCE(sp.mastery_level, 0) AS mastery_level,
              EXISTS(SELECT 1 FROM quiz_questions qq WHERE qq.topic_id = t.id) AS has_quiz
       FROM subjects sub
       JOIN chapters c ON c.subject_id = sub.id
       JOIN topics t ON t.chapter_id = c.id
       LEFT JOIN student_progress sp ON sp.topic_id = t.id AND sp.student_id = $1
       WHERE sub.grade = $2
       ORDER BY sub.name, c.chapter_number, t.name`,
      [studentId, grade]
    );

    const subjects = subjectsResult.rows.map((subject) => {
      const topics = topicsResult.rows.filter((row) => row.subject_id === subject.id);
      const started = topics.filter((topic) => topic.mastery_level > 0);
      const averageMastery = started.length
        ? Math.round(started.reduce((sum, topic) => sum + topic.mastery_level, 0) / started.length)
        : 0;
      return {
        subject_id: subject.id,
        subject_name: subject.name,
        average_mastery: averageMastery,
        topics_started: started.length,
        topics: topics.map((topic) => ({
          id: topic.topic_id,
          name: topic.topic_name,
          chapter: topic.chapter_name,
          mastery_level: topic.mastery_level,
          has_quiz: topic.has_quiz,
        })),
      };
    });

    res.json({ subjects });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, getProgress };
