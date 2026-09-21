const { Router } = require('express');
const { getMe, updateMe, getProgress } = require('../controllers/student.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.use(requireAuth, requireRole('student'));

router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/me/progress', getProgress);

module.exports = router;
