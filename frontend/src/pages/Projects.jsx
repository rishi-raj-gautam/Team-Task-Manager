import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const [projectData, userData] = await Promise.all([
        api.getProjects(),
        api.getUsers(),
      ]);
      setProjects(projectData);
      setUsers(userData);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  const handleDeactivateUser = async (userId, isDeactivated) => {
    if (!window.confirm(`Are you sure you want to ${isDeactivated ? 'reactivate' : 'deactivate'} this user?`)) return;
    try {
      await api.deactivateUser(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isDeactivated: !isDeactivated } : u));
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const adminsCount = users.filter(u => u.role === 'Admin').length;
  const membersCount = users.filter(u => u.role === 'Member').length;
  const totalUsers = users.length || 1;

  return (
    <>
      {/* Hero/Bento Header Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-10">
        <div className="lg:col-span-2 bg-white rounded-xl p-8 tonal-elevation-1 border-l-4 border-primary flex flex-col justify-between">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface mb-2">Project Portfolio</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Manage your organization's active initiatives and strategic goals in one unified view.</p>
          </div>
          <div className="flex flex-wrap gap-6 md:gap-10 mt-8">
            <div>
              <p className="text-status font-status text-on-surface-variant uppercase mb-1">Active Projects</p>
              <p className="text-h2 font-h2 text-primary">{projects.length}</p>
            </div>
            <div>
              <p className="text-status font-status text-on-surface-variant uppercase mb-1">Healthy</p>
              <p className="text-h2 font-h2 text-secondary">84%</p>
            </div>
            <div>
              <p className="text-status font-status text-on-surface-variant uppercase mb-1">Due Soon</p>
              <p className="text-h2 font-h2 text-tertiary">3</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary-container rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-secondary-container text-3xl">rocket_launch</span>
          </div>
          <h3 className="font-h3 text-h3 text-on-secondary-container mb-2">New Milestone?</h3>
          <p className="font-label-md text-label-md text-on-secondary-container/80 mb-6">Kickstart your next big idea with a new project space.</p>
        </div>
      </section>

      {/* Project Grid */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-h3 text-h3">Active Initiatives</h3>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="p-2 bg-stone-100 border border-stone-200 rounded-lg text-primary transition-colors">
              <span className="material-symbols-outlined">list</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl tonal-elevation-1 overflow-x-auto border border-stone-100">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-200/60">
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">PROJECT NAME</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">STATUS</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">PROJECT LEAD</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">HEALTH</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {projects.map((project, idx) => {
                const colors = ['bg-primary-container', 'bg-tertiary', 'bg-error'];
                const badgeColors = ['bg-primary-container/10 text-primary-container', 'bg-stone-100 text-stone-500', 'bg-error-container text-on-error-container'];
                const statusTexts = ['In Progress', 'Archived', 'At Risk'];
                
                return (
                  <tr key={project._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 rounded-full ${colors[idx % 3]}`}></div>
                        <div>
                          <Link to={`/projects/${project._id}`} className="font-label-md text-on-surface hover:text-primary transition-colors">{project.name}</Link>
                          <p className="text-xs text-stone-400">{project.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-status font-status uppercase ${badgeColors[idx % 3]}`}>{statusTexts[idx % 3]}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold">{project.owner?.name?.charAt(0) || 'L'}</div>
                        <span className="text-body-md font-medium text-stone-600">{project.owner?.name || 'Leader'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-24 bg-stone-100 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[idx % 3]} w-[${Math.floor(Math.random() * 50 + 50)}%]`}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link to={`/projects/${project._id}`} className="text-stone-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Workspace Members Section */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-gutter">
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-h3 text-h3">Workspace Members</h3>
            <button className="text-primary font-label-md flex items-center gap-1 hover:underline">
              View History
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((member, idx) => (
              <div key={member._id} className={`bg-white p-5 rounded-xl border border-stone-200/60 flex items-center justify-between group hover:border-primary-container transition-all shadow-sm ${member.isDeactivated ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-stone-200 border-2 border-white ring-2 ring-stone-100 flex items-center justify-center font-bold text-stone-500">
                      {member.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${member.role === 'Admin' ? 'bg-secondary' : 'bg-stone-300'}`}></div>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface">
                      {member.name} {member._id === user._id && '(You)'}
                      {member.isDeactivated && <span className="text-error text-xs ml-2">Deactivated</span>}
                    </p>
                    <p className="text-xs text-stone-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.role === 'Admin' && member._id !== user._id ? (
                    <>
                      <select 
                        value={member.role}
                        onChange={(e) => handleRoleChange(member._id, e.target.value)}
                        className="px-2 py-1 text-xs border border-stone-300 rounded focus:outline-none focus:border-primary bg-stone-50"
                        disabled={member.isDeactivated}
                      >
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <button 
                        onClick={() => handleDeactivateUser(member._id, member.isDeactivated)}
                        className="p-1.5 rounded-md hover:bg-error/10 text-stone-400 hover:text-error transition-colors"
                        title={member.isDeactivated ? "Reactivate User" : "Deactivate User"}
                      >
                        <span className="material-symbols-outlined text-sm">{member.isDeactivated ? 'person_add' : 'person_remove'}</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${member.role === 'Admin' ? 'bg-primary text-white' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution Sidebar */}
        <div className="bg-surface-container rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-label-md text-label-md mb-4 text-on-surface-variant">Role Distribution</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body-md text-stone-600">Admins</span>
                <span className="font-bold text-primary">0{adminsCount}</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${(adminsCount/totalUsers)*100}%` }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-md text-stone-600">Members</span>
                <span className="font-bold text-secondary">0{membersCount}</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full" style={{ width: `${(membersCount/totalUsers)*100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-stone-200">
            <button className="w-full py-2 bg-white text-stone-600 rounded-lg font-label-md border border-stone-200 hover:bg-stone-50 transition-colors">
              Manage Permissions
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
