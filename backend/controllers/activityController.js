const Activity = require('../models/Activity');

// @desc    Get activity for a project
// @route   GET /api/projects/:projectId/activity
// @access  Protected
const getProjectActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ project: req.params.projectId })
      .populate('user', 'name email')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjectActivity };
