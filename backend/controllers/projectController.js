const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Protected
const getProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === 'Admin') {
      // Admin sees all projects
      projects = await Project.find({})
        .populate('owner', 'name email')
        .populate('members.user', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      // Member sees only projects they belong to
      projects = await Project.find({
        'members.user': req.user._id,
      })
        .populate('owner', 'name email')
        .populate('members.user', 'name email role')
        .sort({ createdAt: -1 });
    }

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Protected
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email role');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Members can only view projects they belong to
    if (req.user.role !== 'Admin') {
      const isMember = project.members.some(
        m => m.user._id.toString() === req.user._id.toString()
      );
      if (!isMember) {
        res.status(403);
        throw new Error('Access denied. You are not a member of this project.');
      }
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, members } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Project name is required');
    }

    const project = await Project.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [
        { user: req.user._id, role: 'leader' },
        ...(members || []),
      ],
      startDate,
      endDate,
    });

    // Log activity
    await Activity.create({
      user: req.user._id,
      project: project._id,
      action: 'created_project',
      details: `Created project "${name}"`,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email role');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const { name, description, startDate, endDate } = req.body;

    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    project.startDate = startDate !== undefined ? startDate : project.startDate;
    project.endDate = endDate !== undefined ? endDate : project.endDate;

    await project.save();

    await Activity.create({
      user: req.user._id,
      project: project._id,
      action: 'updated_project',
      details: `Updated project "${project.name}"`,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email role');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: project._id });
    // Delete all activities for this project
    await Activity.deleteMany({ project: project._id });
    // Delete the project
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project and related data deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive/unarchive project
// @route   PATCH /api/projects/:id/archive
// @access  Admin
const archiveProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    project.isArchived = !project.isArchived;
    await project.save();

    await Activity.create({
      user: req.user._id,
      project: project._id,
      action: 'archived_project',
      details: `${project.isArchived ? 'Archived' : 'Unarchived'} project "${project.name}"`,
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Admin
const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if user is already a member
    const existing = project.members.find(
      m => m.user.toString() === userId
    );
    if (existing) {
      res.status(400);
      throw new Error('User is already a member of this project');
    }

    project.members.push({ user: userId, role: role || 'contributor' });
    await project.save();

    await Activity.create({
      user: req.user._id,
      project: project._id,
      action: 'added_member',
      details: `Added a member to project "${project.name}"`,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email role');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Admin
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );
    await project.save();

    await Activity.create({
      user: req.user._id,
      project: project._id,
      action: 'removed_member',
      details: `Removed a member from project "${project.name}"`,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email role');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  addMember,
  removeMember,
};
