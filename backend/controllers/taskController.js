const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// @desc    Get tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Protected
const getProjectTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email role')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks (Admin: all, Member: assigned only)
// @route   GET /api/tasks
// @access  Protected
const getAllTasks = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role !== 'Admin') {
      query.assignee = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email role')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create task in a project
// @route   POST /api/projects/:projectId/tasks
// @access  Admin
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignee, startDate, dueDate, dependencies, recurring, reminderMinutes } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Task title is required');
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const task = await Task.create({
      project: req.params.projectId,
      title,
      description: description || '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      assignee: assignee || req.user._id,
      startDate,
      dueDate,
      dependencies: dependencies || [],
      recurring: recurring || 'none',
      reminderMinutes: reminderMinutes || 0,
    });

    await Activity.create({
      user: req.user._id,
      project: req.params.projectId,
      task: task._id,
      action: 'created_task',
      details: `Created task "${title}"`,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task (full edit for Admin, limited for Member on own tasks)
// @route   PUT /api/tasks/:id
// @access  Protected (Admin: edit all, Member: edit own title/description)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const { title, description, status, priority, assignee, startDate, dueDate, dependencies, recurring, reminderMinutes } = req.body;

    if (req.user.role === 'Admin') {
      // Admin can edit everything
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status || task.status;
      task.priority = priority || task.priority;
      task.assignee = assignee || task.assignee;
      task.startDate = startDate !== undefined ? startDate : task.startDate;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
      task.dependencies = dependencies !== undefined ? dependencies : task.dependencies;
      task.recurring = recurring || task.recurring;
      task.reminderMinutes = reminderMinutes !== undefined ? reminderMinutes : task.reminderMinutes;
    } else {
      // Member can only edit own assigned tasks, and only title/description/dates
      if (!task.assignee || task.assignee.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You can only edit tasks assigned to you');
      }
      // Members cannot change priority, or assignee
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
    }

    await task.save();

    await Activity.create({
      user: req.user._id,
      project: task.project,
      task: task._id,
      action: 'updated_task',
      details: `Updated task "${task.title}"`,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status only
// @route   PATCH /api/tasks/:id/status
// @access  Protected (Member can update own assigned tasks)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['To Do', 'In Progress', 'Done'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status. Must be: To Do, In Progress, or Done');
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Members can only update their own assigned tasks
    if (req.user.role !== 'Admin') {
      if (!task.assignee || task.assignee.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You can only update the status of tasks assigned to you');
      }
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await Activity.create({
      user: req.user._id,
      project: task.project,
      task: task._id,
      action: 'moved_task',
      details: `Moved "${task.title}" from ${oldStatus} to ${status}`,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await Activity.create({
      user: req.user._id,
      project: task.project,
      task: task._id,
      action: 'deleted_task',
      details: `Deleted task "${task.title}"`,
    });

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Protected
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400);
      throw new Error('Comment text is required');
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    task.comments.push({
      user: req.user._id,
      text,
    });

    await task.save();

    await Activity.create({
      user: req.user._id,
      project: task.project,
      task: task._id,
      action: 'commented',
      details: `Commented on "${task.title}"`,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role')
      .populate('comments.user', 'name email');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectTasks,
  getAllTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
};
