const { pool } = require('../config/db');

const QUESTIONS_PER_QUIZ = 5;

async function startQuiz(req, res, next) {
  const { topicId } = req.params;

  try {
    const studentResult = await pool.query(`SELECT id FROM students WHERE user_id = $1`, [
      req.user.id,
    ]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const studentId = studentResult.rows[0].id;

    const questionsResult = await pool.query(
      `SELECT id, question_text, options, difficulty
       FROM quiz_questions
       WHERE topic_id = $1
       ORDER BY random()
       LIMIT $2`,
      [topicId, QUESTIONS_PER_QUIZ]
    );

    if (questionsResult.rows.length === 0) {
      return res.status(404).json({ error: 'No quiz questions available for this topic yet' });
    }

    const attemptResult = await pool.query(
      `INSERT INTO quiz_attempts (student_id, topic_id, total_questions)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [studentId, topicId, questionsResult.rows.length]
    );

    res.status(201).json({
      attemptId: attemptResult.rows[0].id,
      questions: questionsResult.rows,
    });
  } catch (err) {
    next(err);
  }
}

async function submitQuiz(req, res, next) {
  const { attemptId } = req.params;
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers must be a non-empty array' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const studentResult = await client.query(`SELECT id FROM students WHERE user_id = $1`, [
      req.user.id,
    ]);
    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const studentId = studentResult.rows[0].id;

    const attemptResult = await client.query(
      `SELECT id, student_id, topic_id, total_questions, completed_at
       FROM quiz_attempts WHERE id = $1`,
      [attemptId]
    );
    const attempt = attemptResult.rows[0];
    if (!attempt || attempt.student_id !== studentId) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }
    if (attempt.completed_at) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This quiz attempt was already submitted' });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questionsResult = await client.query(
      `SELECT id, correct_option FROM quiz_questions WHERE id = ANY($1::uuid[])`,
      [questionIds]
    );
    const correctByQuestion = new Map(questionsResult.rows.map((q) => [q.id, q.correct_option]));

    let correctCount = 0;
    const results = [];
    for (const answer of answers) {
      const correctOption = correctByQuestion.get(answer.questionId);
      const isCorrect = Boolean(correctOption) && correctOption === answer.selectedOption;
      if (isCorrect) correctCount += 1;
      results.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        correctOption,
        isCorrect,
      });

      await client.query(
        `INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option, is_correct)
         VALUES ($1, $2, $3, $4)`,
        [attemptId, answer.questionId, answer.selectedOption || null, isCorrect]
      );
    }

    const scorePercent = Math.round((correctCount / attempt.total_questions) * 100);

    await client.query(`UPDATE quiz_attempts SET score = $1, completed_at = now() WHERE id = $2`, [
      scorePercent,
      attemptId,
    ]);

    await client.query(
      `INSERT INTO student_progress (student_id, topic_id, mastery_level, last_studied_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (student_id, topic_id)
       DO UPDATE SET mastery_level = $3, last_studied_at = now(), updated_at = now()`,
      [studentId, attempt.topic_id, scorePercent]
    );

    await client.query('COMMIT');

    res.json({
      score: scorePercent,
      correctCount,
      totalQuestions: attempt.total_questions,
      results,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { startQuiz, submitQuiz };
