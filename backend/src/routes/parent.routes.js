const { Router } = require('express');
const {
  getMe,
  updateMe,
  linkStudent,
  getLinkedStudents,
} = require('../controllers/parent.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.use(requireAuth, requireRole('parent'));

router.get('/me', getMe);
router.put('/me', updateMe);
router.post('/students/link', linkStudent);
router.get('/students', getLinkedStudents);

module.exports = router;
