import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const TaskDetailPanel = ({ task, projectMembers, onClose, onTaskUpdated }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'Medium',
    assignee: task.assignee?._id || task.assignee?.id || '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    status: task.status
  });
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user.role === 'Admin';
  const isAssignee = task.assignee && (task.assignee._id === user._id || task.assignee.id === user.id);
  const canEdit = isAdmin || isAssignee;

  const handleSave = async () => {
    if (!editForm.title.trim()) return;
    setIsSubmitting(true);
    try {
      if (isAdmin) {
        // Admin full edit
        await api.updateTask(task._id, editForm);
      } else if (isAssignee) {
        // Member limited edit
        await api.updateTask(task._id, {
          title: editForm.title,
          description: editForm.description
        });
        if (editForm.status !== task.status) {
            await api.updateTaskStatus(task._id, editForm.status);
        }
      }
      setIsEditing(false);
      onTaskUpdated();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(task._id);
      onClose();
      onTaskUpdated();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await api.addComment(task._id, newComment);
      setNewComment('');
      onTaskUpdated();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-[40rem] bg-surface h-full shadow-2xl flex flex-col animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
              task.priority === 'High' ? 'bg-primary/10 text-primary' : 
              task.priority === 'Medium' ? 'bg-secondary-container/20 text-on-secondary-container' : 
              'bg-tertiary-container/20 text-on-tertiary-container'
            }`}>
              {task.priority || 'Medium'} Priority
            </span>
            <span className="text-sm font-label-md text-stone-500">{task.status}</span>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            )}
            {isAdmin && (
              <button onClick={handleDelete} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Main Info */}
          {isEditing ? (
            <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Title</label>
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-h3 text-base"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg h-24 resize-none"
                />
              </div>
              
              {isAdmin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Priority</label>
                    <select 
                      value={editForm.priority}
                      onChange={e => setEditForm({...editForm, priority: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Status</label>
                    <select 
                      value={editForm.status}
                      onChange={e => setEditForm({...editForm, status: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Assignee</label>
                    <select 
                      value={editForm.assignee}
                      onChange={e => setEditForm({...editForm, assignee: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg"
                    >
                      <option value="">Unassigned</option>
                      {projectMembers.map(m => (
                        <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Due Date</label>
                    <input 
                      type="date"
                      value={editForm.dueDate}
                      onChange={e => setEditForm({...editForm, dueDate: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Status change is allowed for members on their own tasks */}
              {!isAdmin && isAssignee && (
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Status</label>
                   <select 
                     value={editForm.status}
                     onChange={e => setEditForm({...editForm, status: e.target.value})}
                     className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg"
                   >
                     <option value="To Do">To Do</option>
                     <option value="In Progress">In Progress</option>
                     <option value="Done">Done</option>
                   </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg text-sm font-medium">Cancel</button>
                <button onClick={handleSave} disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">Save Changes</button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-h2 text-2xl text-on-surface mb-4">{task.title}</h2>
              
              <div className="flex flex-wrap gap-6 mb-8 text-sm">
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase mb-1">Assignee</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {task.assignee?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="font-medium">{task.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase mb-1">Due Date</p>
                  <div className="flex items-center gap-2 text-stone-700">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span className="font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'}</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-stone-600">
                <p className="text-xs font-bold text-stone-400 uppercase mb-2">Description</p>
                <p className="whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-8 border-t border-stone-200">
            <h3 className="font-h3 text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">forum</span>
              Activity & Comments
            </h3>

            <div className="space-y-6 mb-8">
              {task.comments?.map((comment, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex-shrink-0 flex items-center justify-center text-sm font-bold text-stone-600">
                    {comment.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 bg-surface-container-lowest p-4 rounded-xl rounded-tl-none border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-label-md text-sm">{comment.user?.name || 'Unknown User'}</span>
                      <span className="text-xs text-stone-400">
                        {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>
              ))}
              {(!task.comments || task.comments.length === 0) && (
                <p className="text-stone-400 text-sm text-center py-4">No comments yet.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center text-sm font-bold">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Ask a question or post an update..."
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-stone-300 rounded-xl rounded-tl-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors min-h-[80px] resize-none text-sm"
                />
                <div className="flex justify-end mt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
