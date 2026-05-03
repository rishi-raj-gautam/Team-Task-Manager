const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created_project', 'updated_project', 'archived_project',
      'added_member', 'removed_member',
      'created_task', 'updated_task', 'moved_task', 'deleted_task',
      'commented', 'assigned_task',
    ],
  },
  details: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
