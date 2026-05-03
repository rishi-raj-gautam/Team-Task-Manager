// Centralized permission map for role-based access control
const permissions = {
  ADMIN: [
    'CREATE_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'ARCHIVE_PROJECT',
    'VIEW_ALL_PROJECTS',
    'CREATE_TASK', 'EDIT_ANY_TASK', 'DELETE_TASK', 'ASSIGN_TASK',
    'CHANGE_PRIORITY', 'VIEW_ALL_TASKS',
    'MANAGE_TEAM', 'MANAGE_ROLES', 'DEACTIVATE_USERS',
    'VIEW_TEAM', 'COMMENT_TASK',
    'VIEW_ACTIVITY', 'VIEW_ANALYTICS',
  ],
  MEMBER: [
    'VIEW_PROJECT', 'VIEW_ASSIGNED_TASKS',
    'UPDATE_OWN_TASK_STATUS', 'EDIT_OWN_TASK',
    'COMMENT_TASK', 'VIEW_TEAM', 'VIEW_ACTIVITY',
  ],
};

/**
 * Check if a role has a specific permission
 * @param {string} role - 'Admin' or 'Member'
 * @param {string} permission - permission key
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
  const roleKey = role.toUpperCase();
  return permissions[roleKey]?.includes(permission) || false;
};

/**
 * Middleware factory — checks if the authenticated user has a specific permission
 * @param {string} permission - permission key to check
 * @returns {Function} Express middleware
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authenticated'));
    }

    if (hasPermission(req.user.role, permission)) {
      return next();
    }

    res.status(403);
    return next(new Error(`Access denied. Required permission: ${permission}`));
  };
};

module.exports = { permissions, hasPermission, checkPermission };
