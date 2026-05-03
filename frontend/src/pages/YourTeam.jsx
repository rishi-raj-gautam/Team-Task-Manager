import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const YourTeam = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [filterProject, setFilterProject] = useState('All');
  const [filterRole, setFilterRole] = useState('All');

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const data = await api.getMyTeam();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.map(p => {
    if (filterProject !== 'All' && p._id !== filterProject) return null;
    
    const filteredMembers = p.members.filter(m => {
      if (!m.user) return false;
      if (filterRole !== 'All') {
        if (filterRole === 'Leader' && m.role !== 'leader') return false;
        if (filterRole === 'Member' && m.role === 'leader') return false; // anything non-leader
      }
      return true;
    });

    if (filteredMembers.length === 0) return null;
    return { ...p, members: filteredMembers };
  }).filter(Boolean);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const projectColors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-primary-container'];
  const projectStyles = [
    { bg: 'bg-primary-container/10', border: 'border-primary-container/20', text: 'text-primary' },
    { bg: 'bg-secondary-container/10', border: 'border-secondary-container/20', text: 'text-secondary' },
    { bg: 'bg-tertiary-container/10', border: 'border-tertiary-container/20', text: 'text-tertiary' },
    { bg: 'bg-orange-100/30', border: 'border-orange-200/50', text: 'text-orange-700' },
  ];

  return (
    <section className="p-margin flex-1">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="font-h1 text-h1 text-stone-800 mb-xs">Your Team</h1>
            <p className="text-body-lg text-stone-500 max-w-2xl">
              Collaborate with fellow members across your active projects and stay connected with your workspace community.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto mt-4 md:mt-0">
            <select 
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="px-md py-2 bg-white border border-outline-variant/30 text-on-surface-variant font-label-md text-label-md rounded-lg focus:ring-primary focus:border-primary outline-none"
            >
              <option value="All">All Projects</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <select 
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-md py-2 bg-white border border-outline-variant/30 text-on-surface-variant font-label-md text-label-md rounded-lg focus:ring-primary focus:border-primary outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Leader">Leaders</option>
              <option value="Member">Members</option>
            </select>
          </div>
        </div>

        {/* Bento Grid Layout for Team Groups */}
        <div className="space-y-xl">
          {filteredProjects.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-surface-container">
              <span className="material-symbols-outlined text-4xl text-stone-300 mb-2">group_off</span>
              <p className="text-stone-500 font-medium">No team members found for the selected filters.</p>
            </div>
          )}
          {filteredProjects.map((project, pIndex) => {
            const style = projectStyles[pIndex % projectStyles.length];
            const dotColor = projectColors[pIndex % projectColors.length];

            return (
              <div key={project._id} className="space-y-md">
                {/* Group Header */}
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-1.5 ${style.bg} border ${style.border} rounded-full`}>
                    <span className={`w-2 h-2 rounded-full ${dotColor} ${pIndex === 0 ? 'animate-pulse' : ''}`}></span>
                    <h2 className={`text-label-md font-label-md ${style.text} tracking-wide uppercase`}>{project.name}</h2>
                  </div>
                  <div className="flex-1 h-px bg-stone-200/50"></div>
                  <span className="text-xs font-bold text-stone-400">{project.members.length} MEMBER{project.members.length !== 1 ? 'S' : ''}</span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                  {project.members.map((member) => {
                    const isLeader = member.role === 'leader';
                    const isYou = member.user._id === user._id;

                    return (
                      <div 
                        key={member.user._id} 
                        className={`border rounded-xl p-md transition-all group flex flex-col
                          ${isYou 
                            ? 'bg-primary-container/5 border-primary-container/40 shadow-sm shadow-[#E1716F]/10 ring-4 ring-primary-container/5 hover:shadow-md' 
                            : 'bg-surface-container-lowest border-outline-variant/30 shadow-sm shadow-[#E1716F]/5 hover:shadow-md hover:border-primary-container/40'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start mb-md">
                          <div className="relative">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-h2 text-white object-cover border-2 transition-colors ${isYou ? 'border-primary-container bg-primary' : 'border-[#FCECEB] group-hover:border-primary-container bg-secondary'}`}>
                              {member.user.avatar ? (
                                <img src={member.user.avatar} alt={member.user.name} className="w-full h-full rounded-2xl object-cover" />
                              ) : (
                                member.user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            {isLeader && !isYou && (
                              <div className="absolute -bottom-1 -right-1 bg-primary text-white w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                              </div>
                            )}
                          </div>
                          
                          {isYou ? (
                            <div className="px-2 py-1 bg-primary text-white rounded text-[10px] font-status uppercase tracking-wider">YOU</div>
                          ) : isLeader ? (
                            <div className="px-2 py-1 bg-primary-container text-white rounded text-[10px] font-status uppercase tracking-wider">LEADER</div>
                          ) : (
                            <div className="px-2 py-1 bg-[#F7EFE9] text-stone-600 rounded text-[10px] font-status uppercase tracking-wider">MEMBER</div>
                          )}
                        </div>

                        <div className="mb-lg">
                          <h3 className="font-h3 text-stone-900 mb-base leading-tight">{member.user.name}</h3>
                          <p className="text-xs text-stone-500 font-medium truncate">{member.user.email}</p>
                        </div>

                        <div className="mt-auto space-y-md">
                          {!isYou && (
                            <div className="flex flex-col 2xl:flex-row gap-2">
                              <button className="flex-1 py-2 bg-secondary-fixed text-on-secondary-fixed-variant text-[12px] font-bold rounded-lg hover:bg-secondary-container transition-colors flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-sm">chat</span>
                                Message
                              </button>
                              <button className="flex-1 py-2 bg-surface-container-high text-stone-700 text-[12px] font-bold rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-sm">person</span>
                                Profile
                              </button>
                            </div>
                          )}
                          {isYou && (
                             <div className="w-full text-center py-2 bg-primary-container/10 border border-primary-container/20 text-primary text-[11px] font-bold rounded-lg italic">
                               Viewing as Member
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
