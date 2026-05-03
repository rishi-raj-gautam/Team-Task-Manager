import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const WorkspaceMembers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc'); // 'name-asc', 'name-desc', 'date-asc', 'date-desc'

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [openActionMenu, setOpenActionMenu] = useState(null);

  const { setIsInviteMemberOpen } = useOutletContext();
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState(null);

  // Dropdown states for inline role changes
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setOpenRoleDropdown(null);
      loadUsers(); // refresh data
    } catch (error) {
      alert('Failed to update role. Only admins can do this.');
      console.error(error);
    }
  };

  const handleToggleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to change the status of this user?')) return;
    try {
      await api.deactivateUser(userId);
      loadUsers(); // refresh data
    } catch (error) {
      alert('Failed to update user status.');
      console.error(error);
    }
  };

  // Restrict access
  if (user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  // Derived state
  let filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    const matchesStatus = statusFilter 
      ? (statusFilter === 'Active' ? !u.isDeactivated : u.isDeactivated)
      : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sorting
  filteredUsers.sort((a, b) => {
    if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
    if (sortOrder === 'date-asc') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (sortOrder === 'date-desc') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return 0;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const handleBulkSuspend = async () => {
    if (!window.confirm(`Are you sure you want to suspend ${selectedUsers.length} users?`)) return;
    try {
      await Promise.all(selectedUsers.map(id => api.deactivateUser(id)));
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      alert('Failed to suspend all selected users.');
      console.error(error);
    }
  };

  const adminsCount = users.filter(u => u.role === 'Admin').length;
  const leadersCount = users.filter(u => u.role === 'Leader').length;
  const membersCount = users.filter(u => u.role === 'Member').length;
  const totalUsers = users.length || 1; // prevent div by zero

  const adminPct = (adminsCount / totalUsers) * 100;
  const leaderPct = (leadersCount / totalUsers) * 100;
  const memberPct = (membersCount / totalUsers) * 100;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-stone-200 bg-white">
        <div>
          <h1 style={{fontSize:'24px',fontWeight:600,color:'#9f3f3f'}}>Workspace Members</h1>
          <p style={{fontSize:'13px',color:'#897270',marginTop:'2px'}}>Manage roles, access, and invitations across your workspace</p>
        </div>
        <button
          onClick={() => setIsInviteMemberOpen(true)}
          style={{background:'#9f3f3f',color:'#fff',padding:'8px 18px',borderRadius:'8px',border:'none',cursor:'pointer',fontWeight:600,fontSize:'13px',display:'flex',alignItems:'center',gap:'6px'}}
        >
          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>person_add</span>
          Invite Member
        </button>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        <div className="col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-4 rounded-xl shadow-sm border border-stone-100">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-sm" 
              placeholder="Search by name or email..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex items-center bg-surface px-3 py-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm mr-2">filter_list</span>
              <select 
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-transparent border-none outline-none font-label-md text-xs cursor-pointer appearance-none pr-4"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Leader">Leader</option>
                <option value="Member">Member</option>
              </select>
            </div>
            <div className="relative flex items-center bg-surface px-3 py-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm mr-2">verified</span>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none font-label-md text-xs cursor-pointer appearance-none pr-4"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
            <div className="relative flex items-center bg-surface px-3 py-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm mr-2">sort</span>
              <select 
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="bg-transparent border-none outline-none font-label-md text-xs cursor-pointer appearance-none pr-4"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
              </select>
            </div>
            {(searchQuery || roleFilter || statusFilter || sortOrder !== 'name-asc') && (
              <button 
                onClick={() => { setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); }}
                className="text-stone-500 font-label-md text-xs hover:text-primary transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Member Table */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_12px_24px_-10px_rgba(159,63,63,0.06)] overflow-visible border border-stone-100">
            
            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
              <div className="bg-[#F9EBEA] px-6 py-3 flex items-center justify-between border-b border-[#E1716F]/20 rounded-t-xl transition-all">
                <div className="flex items-center gap-4">
                  <span className="font-label-md text-[#E1716F]">{selectedUsers.length} members selected</span>
                  <div className="h-4 w-px bg-[#E1716F]/30"></div>
                  {/* For now, bulk role change opens a prompt for simplicity, could be a modal */}
                  <button 
                    onClick={() => {
                      const role = window.prompt("Enter new role (Admin, Leader, Member):");
                      if (role && ['Admin', 'Leader', 'Member'].includes(role)) {
                        Promise.all(selectedUsers.map(id => api.updateUserRole(id, role))).then(() => {
                          setSelectedUsers([]); loadUsers();
                        }).catch(e => alert('Failed to update roles.'));
                      }
                    }}
                    className="flex items-center gap-2 text-on-surface-variant font-label-md text-xs hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> Change Role
                  </button>
                  <button onClick={handleBulkSuspend} className="flex items-center gap-2 text-on-surface-variant font-label-md text-xs hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">block</span> Suspend
                  </button>
                  <button onClick={() => alert('Bulk Delete is not currently supported by the backend.')} className="flex items-center gap-2 text-error font-label-md text-xs hover:opacity-80 transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span> Delete
                  </button>
                </div>
                <button onClick={() => setSelectedUsers([])} className="text-stone-500 hover:text-stone-800 transition-colors"><span className="material-symbols-outlined">close</span></button>
              </div>
            )}

            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="p-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded text-primary focus:ring-primary border-outline-variant cursor-pointer" 
                      checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 font-label-md text-stone-500 uppercase text-[10px] tracking-widest">Name + Avatar</th>
                  <th className="p-4 font-label-md text-stone-500 uppercase text-[10px] tracking-widest">Email</th>
                  <th className="p-4 font-label-md text-stone-500 uppercase text-[10px] tracking-widest">Role</th>
                  <th className="p-4 font-label-md text-stone-500 uppercase text-[10px] tracking-widest">Status</th>
                  <th className="p-4 font-label-md text-stone-500 uppercase text-[10px] tracking-widest">Joined Date</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map(member => (
                  <tr key={member._id} className={`hover:bg-surface-container-low transition-colors group ${member.isDeactivated ? 'opacity-60' : ''} ${selectedUsers.includes(member._id) ? 'bg-surface-container-low' : ''}`}>
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded text-primary focus:ring-primary border-outline-variant cursor-pointer" 
                        checked={selectedUsers.includes(member._id)}
                        onChange={() => handleSelectUser(member._id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border-2 p-0.5 ${
                          member.role === 'Admin' ? 'border-primary-container' : 
                          member.role === 'Leader' ? 'border-secondary-container' : 
                          'border-tertiary-container'
                        }`}>
                          <div className="w-full h-full rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500 text-sm">
                            {member.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface flex items-center gap-2">
                            {member.name} {member._id === user._id && <span className="text-[10px] bg-stone-100 px-1.5 rounded text-stone-500">You</span>}
                          </p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">{member.role} Workspace</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-body-md text-on-surface-variant">{member.email}</td>
                    <td className="p-4 relative">
                      <div 
                        className="flex items-center gap-1 cursor-pointer group/role"
                        onClick={() => member._id !== user._id && setOpenRoleDropdown(openRoleDropdown === member._id ? null : member._id)}
                      >
                        <span className="font-label-md text-xs text-on-surface">{member.role}</span>
                        {member._id !== user._id && (
                          <span className="material-symbols-outlined text-[16px] text-stone-400 group-hover/role:text-primary">arrow_drop_down</span>
                        )}
                      </div>
                      
                      {openRoleDropdown === member._id && (
                        <div className="absolute top-full left-4 mt-1 w-32 bg-white rounded-lg shadow-lg border border-stone-100 overflow-hidden z-50">
                          {['Admin', 'Leader', 'Member'].map(r => (
                            <button
                              key={r}
                              onClick={() => handleRoleChange(member._id, r)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 ${member.role === r ? 'font-bold text-primary' : 'text-stone-700'}`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {member.isDeactivated ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500">Disabled</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Active</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-body-md text-stone-500">
                      {new Date(member.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 relative">
                      <button 
                        onClick={() => setOpenActionMenu(openActionMenu === member._id ? null : member._id)}
                        className="p-1 rounded-full hover:bg-stone-200 text-stone-400 transition-colors"
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>

                      {openActionMenu === member._id && (
                        <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden z-50 flex flex-col py-2 text-sm font-label-md">
                          <button onClick={() => { setOpenActionMenu(null); setSelectedUserForDrawer(member); }} className="flex items-center gap-3 px-4 py-2 hover:bg-stone-50 text-stone-700 text-left">
                            <span className="material-symbols-outlined text-[18px]">person</span> View Profile
                          </button>
                          
                          {member._id !== user._id && (
                            <>
                              <button onClick={() => { setOpenActionMenu(null); handleToggleDeactivate(member._id); }} className="flex items-center gap-3 px-4 py-2 hover:bg-stone-50 text-stone-700 text-left">
                                <span className="material-symbols-outlined text-[18px]">{member.isDeactivated ? 'check_circle' : 'block'}</span> {member.isDeactivated ? 'Reactivate User' : 'Suspend Account'}
                              </button>
                              <div className="h-px bg-stone-100 my-1"></div>
                              <button onClick={() => { setOpenActionMenu(null); alert('Delete functionality not yet exposed on backend.'); }} className="flex items-center gap-3 px-4 py-2 hover:bg-error/10 text-error text-left">
                                <span className="material-symbols-outlined text-[18px]">delete</span> Remove User
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-stone-500">
                No members found matching your filters.
              </div>
            )}
            
            <div className="p-4 border-t border-stone-100 flex items-center justify-between">
              <p className="text-xs font-body-md text-stone-500">Showing {filteredUsers.length} of {users.length} members</p>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="col-span-12 lg:col-span-3 space-y-gutter">
          
          {/* Role Distribution Card */}
          <div className="bg-surface-container rounded-xl p-6 border border-[#E1716F]/10 shadow-sm">
            <h3 className="font-label-md text-stone-600 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
              Role Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <p className="text-sm font-body-md text-on-surface">Total Members</p>
                </div>
                <span className="font-h3 text-xl">{users.length}</span>
              </div>
              
              <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden flex">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${adminPct}%` }}></div>
                <div className="h-full bg-secondary-container transition-all duration-500" style={{ width: `${leaderPct}%` }}></div>
                <div className="h-full bg-tertiary-container transition-all duration-500" style={{ width: `${memberPct}%` }}></div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-stone-100/50">
                  <span className="text-xs font-label-md text-stone-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Admins
                  </span>
                  <span className="text-sm font-bold text-on-surface">{adminsCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-stone-100/50">
                  <span className="text-xs font-label-md text-stone-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary-container"></div>
                    Leaders
                  </span>
                  <span className="text-sm font-bold text-on-surface">{leadersCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-stone-100/50">
                  <span className="text-xs font-label-md text-stone-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-tertiary-container"></div>
                    Members
                  </span>
                  <span className="text-sm font-bold text-on-surface">{membersCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invitation Status Card (Mocked) */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-stone-100 shadow-sm overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#F9EBEA] rounded-full opacity-50"></div>
            <h3 className="font-label-md text-stone-600 mb-4 relative z-10">Pending Invites</h3>
            <div className="flex items-end gap-2 mb-4 relative z-10">
              <span className="font-h1 text-primary">0</span>
              <span className="text-xs font-body-md text-stone-400 pb-2">Expiring soon</span>
            </div>
            <button className="w-full border border-[#E1716F] text-primary py-2 rounded-lg font-label-md text-xs hover:bg-[#F9EBEA] transition-all relative z-10">
              Manage Invitations
            </button>
          </div>

          {/* Admin Action Card (Mocked) */}
          <div className="bg-secondary text-on-secondary rounded-xl p-6 shadow-lg shadow-secondary/10">
            <h3 className="font-label-md mb-2">Workspace Health</h3>
            <p className="text-xs opacity-90 mb-4">All roles are up to date and active.</p>
            <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg font-label-md text-xs transition-colors flex items-center justify-center gap-2">
              Review Settings
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

        </div>
      </div>


      {/* User Profile Drawer */}
      {selectedUserForDrawer && createPortal(
        <div onClick={() => setSelectedUserForDrawer(null)} style={{position:'fixed',inset:0,zIndex:9999,display:'flex',justifyContent:'flex-end',background:'rgba(0,0,0,0.25)'}}>
          <div onClick={e => e.stopPropagation()} style={{width:'100%',maxWidth:'420px',background:'#fff',height:'100%',boxShadow:'-8px 0 40px rgba(0,0,0,0.15)',display:'flex',flexDirection:'column',animation:'slideInRight 0.3s ease',fontFamily:'Manrope,sans-serif'}}>
            {/* Drawer Header */}
            <div style={{padding:'24px',background:'#f5f4ec',borderBottom:'1px solid #e9e8e1',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                <div style={{width:'60px',height:'60px',borderRadius:'50%',background:'#dcc0be',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:700,color:'#9f3f3f',border:'3px solid #e1716f',flexShrink:0}}>
                  {selectedUserForDrawer.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{fontSize:'20px',fontWeight:600,color:'#1b1c17',margin:'0 0 4px'}}>{selectedUserForDrawer.name}</h2>
                  <p style={{fontSize:'13px',color:'#897270',margin:'0 0 8px'}}>{selectedUserForDrawer.email}</p>
                  <span style={{fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',background:'#efeee6',color:'#564241',padding:'2px 8px',borderRadius:'4px'}}>
                    {selectedUserForDrawer.role}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedUserForDrawer(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#897270',display:'flex',padding:'4px'}}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{flex:1,overflowY:'auto',padding:'24px',display:'flex',flexDirection:'column',gap:'28px'}}>
              <div>
                <h3 style={{fontSize:'15px',fontWeight:600,color:'#1b1c17',margin:'0 0 14px'}}>Account Details</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div style={{background:'#fff',border:'1px solid #e9e8e1',borderRadius:'12px',padding:'14px'}}>
                    <p style={{fontSize:'10px',fontWeight:700,color:'#897270',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 6px'}}>Status</p>
                    <p style={{fontSize:'14px',fontWeight:600,color: selectedUserForDrawer.isDeactivated ? '#897270' : '#15803d',margin:0}}>
                      {selectedUserForDrawer.isDeactivated ? 'Disabled' : 'Active'}
                    </p>
                  </div>
                  <div style={{background:'#fff',border:'1px solid #e9e8e1',borderRadius:'12px',padding:'14px'}}>
                    <p style={{fontSize:'10px',fontWeight:700,color:'#897270',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 6px'}}>Joined</p>
                    <p style={{fontSize:'14px',fontWeight:600,color:'#1b1c17',margin:0}}>
                      {new Date(selectedUserForDrawer.createdAt || Date.now()).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{fontSize:'15px',fontWeight:600,color:'#1b1c17',margin:'0 0 14px'}}>Recent Activity</h3>
                <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                  {[{icon:'login',text:'Logged in to workspace',time:'2 hours ago'},{icon:'edit',text:'Updated profile settings',time:'Yesterday'},{icon:'task_alt',text:'Completed assigned tasks',time:'3 days ago'}].map((a,i) => (
                    <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
                      <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#f5f4ec',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span className="material-symbols-outlined" style={{fontSize:'16px',color:'#9f3f3f'}}>{a.icon}</span>
                      </div>
                      <div>
                        <p style={{fontSize:'13px',color:'#1b1c17',margin:'0 0 2px'}}>{a.text}</p>
                        <p style={{fontSize:'11px',color:'#897270',margin:0}}>{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            {selectedUserForDrawer._id !== user._id && (
              <div style={{padding:'16px 24px',borderTop:'1px solid #e9e8e1',background:'#fff'}}>
                <button
                  onClick={() => { setSelectedUserForDrawer(null); handleToggleDeactivate(selectedUserForDrawer._id); }}
                  style={{width:'100%',padding:'12px',border:'1px solid #dcc0be',borderRadius:'12px',cursor:'pointer',fontSize:'13px',fontWeight:600,color:'#564241',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}
                >
                  <span className="material-symbols-outlined" style={{fontSize:'18px'}}>
                    {selectedUserForDrawer.isDeactivated ? 'check_circle' : 'block'}
                  </span>
                  {selectedUserForDrawer.isDeactivated ? 'Reactivate Account' : 'Suspend Account'}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
