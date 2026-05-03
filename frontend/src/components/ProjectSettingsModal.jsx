import { useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';

export const ProjectSettingsModal = ({ project, users, onClose, onProjectUpdated, onProjectDeleted }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description || '',
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
  });
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('contributor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.updateProject(project._id, editForm);
      onProjectUpdated();
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberId) return;
    setIsSubmitting(true);
    try {
      await api.addProjectMember(project._id, newMemberId, newMemberRole);
      setNewMemberId('');
      onProjectUpdated();
    } catch (err) {
      console.error('Failed to add member:', err);
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.removeProjectMember(project._id, userId);
      onProjectUpdated();
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm(`Are you sure you want to ${project.isArchived ? 'unarchive' : 'archive'} this project?`)) return;
    try {
      await api.archiveProject(project._id);
      onProjectUpdated();
    } catch (err) {
      console.error('Failed to archive project:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this project? This action cannot be undone and will delete all associated tasks and activity.')) return;
    try {
      await api.deleteProject(project._id);
      onProjectDeleted();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const availableUsers = users.filter(u => !project.members.some(m => m.user._id === u._id));

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-stone-900/50 backdrop-blur-sm !mt-0">
      <div className="bg-surface-container-lowest w-full max-w-[42rem] rounded-[24px] shadow-2xl shadow-primary/10 overflow-hidden border border-outline-variant/20 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 md:px-10 md:py-6 border-b border-surface-container-high flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-h2 text-h2 text-on-surface tracking-tight">Project Settings</h2>
            <p className="text-sm text-on-surface-variant font-manrope">Manage details, project team members, and access.</p>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-container-high px-6 md:px-10 shrink-0">
          {['details', 'members', 'danger'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-label-md text-sm capitalize border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-primary text-primary font-bold' 
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-surface-container-highest'
              }`}
            >
              {tab === 'danger' ? 'Danger Zone' : tab === 'members' ? 'Project Team' : tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-col min-h-0 overflow-y-auto">
          {activeTab === 'details' && (
            <form onSubmit={handleUpdateDetails} className="flex flex-col h-full">
              <div className="px-6 py-6 md:px-10 space-y-6 flex-1">
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Project Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-on-surface font-body-md"
                  />
                </div>
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl h-24 resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-on-surface font-body-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Start Date</label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={e => setEditForm({...editForm, startDate: e.target.value})}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-on-surface font-body-md"
                    />
                  </div>
                  <div className="group">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">End Date</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={e => setEditForm({...editForm, endDate: e.target.value})}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-on-surface font-body-md"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 md:px-10 border-t border-surface-container-high bg-surface-container-lowest shrink-0 flex justify-end gap-4 rounded-b-[24px]">
                <button type="submit" disabled={isSubmitting} className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-label-md hover:opacity-90 disabled:opacity-50 transition-opacity">
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'members' && (
            <div className="px-6 py-6 md:px-10 space-y-8 flex-1">
              <form onSubmit={handleAddMember} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/50 shadow-sm">
                <h4 className="font-h3 text-h3 text-on-surface mb-4">Add to Project Team</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    value={newMemberId}
                    onChange={e => setNewMemberId(e.target.value)}
                    required
                    className="flex-1 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-on-surface"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <select 
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value)}
                    className="w-full sm:w-40 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-on-surface"
                  >
                    <option value="contributor">Contributor</option>
                    <option value="leader">Leader</option>
                  </select>
                  <button type="submit" disabled={isSubmitting || !newMemberId} className="px-6 py-2.5 bg-on-surface text-surface rounded-xl font-label-md hover:opacity-90 disabled:opacity-50 transition-opacity">
                    Add
                  </button>
                </div>
                {availableUsers.length === 0 && (
                  <p className="text-sm text-on-surface-variant mt-3">All workspace users are already in this project.</p>
                )}
              </form>

              <div>
                <h4 className="font-h3 text-h3 text-on-surface mb-4 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">{project.members.length}</span>
                  Current Members
                </h4>
                <div className="divide-y divide-outline-variant/30 border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm">
                  {project.members.map(member => (
                    <div key={member.user._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-container/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {member.user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface">{member.user.name}</p>
                          <p className="text-sm text-on-surface-variant">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          member.role === 'leader' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {member.role}
                        </span>
                        {project.owner?._id !== member.user._id && (
                          <button onClick={() => handleRemoveMember(member.user._id)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-sm">person_remove</span>
                          </button>
                        )}
                        {project.owner?._id === member.user._id && (
                          <span className="text-xs text-on-surface-variant italic px-2">Owner</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="px-6 py-6 md:px-10 space-y-6 flex-1 mb-8">
              <div className="bg-[#FFF4F0] border border-[#FFD8C9] p-6 rounded-2xl">
                <h4 className="font-h3 text-h3 text-[#C84A22] mb-2">Archive Project</h4>
                <p className="text-body-md text-[#9C3110] mb-5">Archiving a project makes it read-only. Tasks cannot be edited, but historical data is preserved.</p>
                <button onClick={handleArchive} className="px-6 py-2.5 bg-white border border-[#FFD8C9] text-[#C84A22] rounded-full text-sm font-bold hover:bg-[#FFEAE2] transition-colors shadow-sm">
                  {project.isArchived ? 'Unarchive Project' : 'Archive Project'}
                </button>
              </div>

              <div className="bg-error/10 border border-error/20 p-6 rounded-2xl">
                <h4 className="font-h3 text-h3 text-error mb-2">Delete Project</h4>
                <p className="text-body-md text-error/80 mb-5">Permanently delete this project, all of its tasks, and activity logs. This action cannot be undone.</p>
                <button onClick={handleDelete} className="px-6 py-2.5 bg-error text-white rounded-full text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
