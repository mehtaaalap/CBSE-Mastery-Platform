const { Router } = require('express');
const { getMe, updateMe, getProgress } = require('../controllers/student.controller');
const { startQuiz, submitQuiz } = require('../controllers/quiz.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.use(requireAuth, requireRole('student'));

router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/me/progress', getProgress);
router.post('/topics/:topicId/quiz/start', startQuiz);
router.post('/quiz-attempts/:attemptId/submit', submitQuiz);

module.exports = router;
