const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats?userId=&projectId=&status=
// @access  Protected
const getDashboardStats = async (req, res, next) => {
  try {
    const { userId, projectId, status } = req.query;
    let taskQuery = {};
    let projectQuery = {};

    if (req.user.role !== 'Admin') {
      // Member sees only their own tasks
      taskQuery.assignee = req.user._id;
      projectQuery = { 'members.user': req.user._id };
    }

    // Apply filters (Admin only can filter by user)
    if (userId && req.user.role === 'Admin') {
      taskQuery.assignee = userId;
    }
    if (projectId) {
      taskQuery.project = projectId;
    }
    if (status) {
      taskQuery.status = status;
    }

    const [tasks, projects, activities] = await Promise.all([
      Task.find(taskQuery).populate('project', 'name').populate('assignee', 'name email'),
      Project.find(projectQuery).populate('owner', 'name email').populate('members.user', 'name email'),
      Activity.find(req.user.role === 'Admin' ? {} : { user: req.user._id })
        .populate('user', 'name email')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const now = new Date();
    const todoTasks = tasks.filter(t => t.status === 'To Do').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const doneTasks = tasks.filter(t => t.status === 'Done').length;
    const overdueTasks = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
    ).length;

    res.json({
      projects: projects.length,
      tasks: {
        total: tasks.length,
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        overdue: overdueTasks,
      },
      completionRate: tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0,
      recentActivity: activities,
      projectsList: projects,
      tasksList: tasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
