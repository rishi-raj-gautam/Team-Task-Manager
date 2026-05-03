const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

router.get('/', protect, getAllTasks);
router.put('/:id', protect, updateTask); // Admin: full edit, Member: own task title/desc
router.patch('/:id/status', protect, updateTaskStatus); // Member can update own task status
router.delete('/:id', protect, checkPermission('DELETE_TASK'), deleteTask);
router.post('/:id/comments', protect, addComment); // Both can comment

module.exports = router;
