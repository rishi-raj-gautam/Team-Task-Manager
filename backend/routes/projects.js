const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { getProjectTasks, createTask } = require('../controllers/taskController');
const { getProjectActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Project CRUD
router.get('/', protect, getProjects);
router.post('/', protect, checkPermission('CREATE_PROJECT'), createProject);
router.get('/:id', protect, getProject);
router.put('/:id', protect, checkPermission('EDIT_PROJECT'), updateProject);
router.delete('/:id', protect, checkPermission('DELETE_PROJECT'), deleteProject);

// Archive
router.patch('/:id/archive', protect, checkPermission('ARCHIVE_PROJECT'), archiveProject);

// Members
router.post('/:id/members', protect, checkPermission('MANAGE_TEAM'), addMember);
router.delete('/:id/members/:userId', protect, checkPermission('MANAGE_TEAM'), removeMember);

// Tasks within project
router.get('/:projectId/tasks', protect, getProjectTasks);
router.post('/:projectId/tasks', protect, checkPermission('CREATE_TASK'), createTask);

// Activity within project
router.get('/:projectId/activity', protect, getProjectActivity);

module.exports = router;
