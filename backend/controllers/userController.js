const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get all users
// @route   GET /api/users
// @access  Protected
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['Admin', 'Member'].includes(role)) {
      res.status(400);
      throw new Error('Role must be Admin or Member');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.role = role;
    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user
// @route   PATCH /api/users/:id/deactivate
// @access  Admin
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Cannot deactivate yourself
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot deactivate your own account');
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's team from their projects
// @route   GET /api/users/team
// @access  Protected
const getTeamMembers = async (req, res, next) => {
  try {
    // Find projects where the current user is a member
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email role avatar isActive')
      .select('name members');

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, updateUserRole, deactivateUser, getTeamMembers };
