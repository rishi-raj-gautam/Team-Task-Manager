import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); // { user: id, role: string, userObj: object }
  
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    } else {
      // Reset state on close
      setNewProjectName('');
      setNewProjectDescription('');
      setStartDate('');
      setEndDate('');
      setSearchQuery('');
      setSelectedMembers([]);
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      // exclude current user because they are automatically added as the owner/leader
      setAllUsers(data.filter(u => u._id !== (user._id || user.id)));
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    try {
      await api.createProject({
        name: newProjectName,
        description: newProjectDescription || '',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        members: selectedMembers.map(m => ({ user: m.user, role: m.role }))
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project.');
    }
  };

  const handleAddMember = (userObj) => {
    if (!selectedMembers.find(m => m.user === userObj._id)) {
      setSelectedMembers([...selectedMembers, { user: userObj._id, role: 'contributor', userObj }]);
    }
    setSearchQuery('');
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(m => m.user !== userId));
  };

  const handleRoleChange = (userId, newRole) => {
    setSelectedMembers(selectedMembers.map(m => m.user === userId ? { ...m, role: newRole } : m));
  };

  // Filter users based on search query
  const filteredUsers = allUsers.filter(u => {
    if (!searchQuery.trim()) return false;
    const isAlreadySelected = selectedMembers.some(m => m.user === u._id);
    if (isAlreadySelected) return false;
    
    const query = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-stone-900/50 backdrop-blur-sm !mt-0">
      <div className="bg-surface-container-lowest w-full max-w-[42rem] rounded-[24px] shadow-2xl shadow-primary/10 overflow-hidden border border-outline-variant/20 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 md:px-10 md:py-6 border-b border-surface-container-high flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-h2 text-h2 text-on-surface tracking-tight">Create New Project</h2>
            <p className="text-sm text-on-surface-variant font-manrope">Define parameters and assemble your core team.</p>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
        {/* Modal Body (Form) */}
        <form onSubmit={handleCreateProject} className="flex flex-col min-h-0">
          <div className="px-6 py-6 md:px-10 md:py-10 space-y-6 overflow-y-auto">
            {/* Project Basics */}
            <div className="space-y-4">
              <div className="group">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Project Name</label>
                <input 
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all placeholder:text-stone-400 font-body-md" 
                  placeholder="e.g. Website Launch 2024" 
                  type="text"
                />
              </div>
              <div className="group">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Description</label>
                <textarea 
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all placeholder:text-stone-400 font-body-md resize-none" 
                  placeholder="Describe the goals and key milestones of this project..." 
                  rows="3"
                ></textarea>
              </div>
            </div>
            {/* Dates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Start Date</label>
                <div className="relative">
                  <input 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md text-stone-700" 
                    type="date"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">End Date (Estimated)</label>
                <div className="relative">
                  <input 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-body-md text-stone-700" 
                    type="date"
                  />
                </div>
              </div>
            </div>
            {/* Team Members Section */}
            <div className="space-y-4">
              <label className="block font-label-md text-label-md text-on-surface-variant">Team Members</label>
              
              {/* Search Box */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary-container outline-none transition-all font-body-md" 
                  placeholder="Search by name or email..." 
                  type="text"
                />
                
                {/* Search Results Dropdown */}
                {searchQuery.trim() !== '' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-surface-container-high z-10 max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(u => (
                        <div 
                          key={u._id} 
                          className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-0"
                          onClick={() => handleAddMember(u)}
                        >
                          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 text-xs shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-label-md text-sm text-stone-800">{u.name}</p>
                            <p className="text-xs text-stone-500">{u.email}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-stone-500 text-sm">No matching users found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Members List */}
              {selectedMembers.length > 0 && (
                <div className="space-y-2 pt-2">
                  {selectedMembers.map((member) => (
                    <div key={member.user} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-surface-container-low border border-outline-variant/10 rounded-xl gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 shrink-0 border-2 border-white ring-2 ring-stone-100">
                          {member.userObj.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-manrope font-semibold text-sm text-on-surface truncate">{member.userObj.name}</p>
                          <p className="text-xs text-on-surface-variant truncate">{member.userObj.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
                        <select 
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user, e.target.value)}
                          className="flex-1 sm:flex-none bg-white border border-stone-200 text-stone-700 text-xs font-bold py-1.5 px-3 rounded-lg focus:ring-primary focus:border-primary outline-none"
                        >
                          <option value="leader">Project Leader</option>
                          <option value="contributor">Contributor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMember(member.user)}
                          className="p-1.5 text-stone-400 hover:text-error hover:bg-error/10 rounded-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Modal Footer */}
          <div className="px-6 py-4 md:px-10 md:py-6 bg-surface-container-low border-t border-surface-container-high flex justify-end items-center gap-4 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-secondary font-bold hover:bg-secondary-container/20 transition-all active:scale-95 duration-150">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 sm:px-8 sm:py-3 bg-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary-container/20 hover:brightness-110 transition-all active:scale-95 duration-150 flex items-center gap-2">
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
