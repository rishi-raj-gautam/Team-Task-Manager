import { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ userId: '', projectId: '', status: '' });
  const [allUsers, setAllUsers] = useState([]);
  const { user } = useAuth();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardStats(filters);
      setStats(data);
      if (user.role === 'Admin' && allUsers.length === 0) {
        const usersData = await api.getUsers();
        setAllUsers(usersData);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  if (isLoading || !stats) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const { tasks, projects, completionRate, recentActivity, projectsList, tasksList } = stats;

  return (
    <>
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Good morning, {user?.name?.split(' ')[0]}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Here's what's happening across your workspace today.</p>
        </div>
        
        {user.role === 'Admin' && (
          <div className="flex gap-3 items-center bg-white p-2 rounded-xl border border-stone-200">
            <span className="material-symbols-outlined text-stone-400 pl-2">filter_list</span>
            <select 
              value={filters.userId} 
              onChange={e => setFilters({...filters, userId: e.target.value})}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium outline-none focus:border-primary"
            >
              <option value="">All Users</option>
              {allUsers.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
            <select 
              value={filters.status} 
              onChange={e => setFilters({...filters, status: e.target.value})}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        )}
      </section>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_24px_-10px_rgba(225,113,111,0.08)] border-l-4 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Active Projects</p>
              <h3 className="font-h1 text-h2 mt-1">{projects < 10 ? `0${projects}` : projects}</h3>
            </div>
            <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">rocket_launch</span>
          </div>
          <p className="text-sm text-on-surface-variant mt-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-green-600">trending_up</span>
            <span className="text-green-600 font-semibold">+{projects}</span> active now
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_24px_-10px_rgba(225,113,111,0.08)] border-l-4 border-primary-container">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Completed Tasks</p>
              <h3 className="font-h1 text-h2 mt-1">{tasks.done < 10 ? `0${tasks.done}` : tasks.done}</h3>
            </div>
            <span className="material-symbols-outlined text-primary-container p-2 bg-primary-container/10 rounded-lg">task_alt</span>
          </div>
          <p className="text-sm text-on-surface-variant mt-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-green-600">trending_up</span>
            <span className="text-green-600 font-semibold">{completionRate}%</span> completion rate
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_24px_-10px_rgba(225,113,111,0.08)] border-l-4 border-error">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Overdue Tasks</p>
              <h3 className="font-h1 text-h2 mt-1">{tasks.overdue < 10 ? `0${tasks.overdue}` : tasks.overdue}</h3>
            </div>
            <span className="material-symbols-outlined text-error p-2 bg-error/10 rounded-lg">warning</span>
          </div>
          <p className="text-sm text-on-surface-variant mt-4 flex items-center gap-1">
            {tasks.overdue > 0 ? (
              <>
                <span className="material-symbols-outlined text-sm text-error">priority_high</span>
                Requires immediate attention
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
                All tasks on track
              </>
            )}
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Project Overview & Tasks */}
        <div className="lg:col-span-8 space-y-gutter">
          
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_24px_-10px_rgba(225,113,111,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 text-on-surface">Project Overview</h3>
              <Link to="/projects" className="text-primary font-label-md flex items-center gap-1 hover:underline">
                View all <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            <div className="space-y-6">
              {projectsList.slice(0,3).map((project, idx) => {
                const pTasks = tasksList.filter(t => {
                  const projId = t.project?._id || t.project;
                  return projId === project._id || projId === project.id;
                });
                const pDone = pTasks.filter(t => t.status === 'Done').length;
                const progress = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
                const colors = ['bg-primary', 'bg-primary-container', 'bg-tertiary'];
                const textColors = ['text-primary', 'text-primary-container', 'text-tertiary'];
                const icons = ['brand_family', 'language', 'inventory_2'];

                return (
                  <div key={project._id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-stone-600">{icons[idx % 3]}</span>
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface">{project.name}</p>
                          <p className="text-xs text-on-surface-variant">{project.members?.length || 0} members • {progress === 100 ? 'Completed' : 'Active'}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold ${textColors[idx % 3]}`}>{progress}%</p>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className={`${colors[idx % 3]} h-2 rounded-full`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_24px_-10px_rgba(225,113,111,0.04)]">
            <h3 className="font-h3 text-h3 text-on-surface mb-6">Upcoming Deadlines</h3>
            <div className="divide-y divide-stone-100">
              {tasksList
                .filter(t => t.status !== 'Done' && t.dueDate)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 3)
                .map((task, i) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div key={task._id} className="py-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <button className="w-6 h-6 rounded-full border-2 border-stone-200 hover:border-primary transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs text-transparent hover:text-primary">check</span>
                      </button>
                      <div>
                        <p className="font-body-md text-on-surface group-hover:text-primary transition-colors cursor-pointer">{task.title}</p>
                        <span className={`text-xs font-status px-2 py-0.5 rounded ${
                          task.priority === 'High' ? 'bg-primary/10 text-primary' :
                          task.priority === 'Medium' ? 'bg-secondary-container/20 text-on-secondary-container' :
                          'bg-tertiary-fixed text-on-tertiary-fixed'
                        }`}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-error' : 'text-on-surface-variant'}`}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-low rounded-xl p-8 sticky top-24">
            <h3 className="font-h3 text-h3 text-on-surface mb-6">Recent Activity</h3>
            <div className="relative space-y-8 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              
              {recentActivity.slice(0, 5).map((activity) => {
                const iconMap = {
                  created_project: 'folder_open',
                  created_task: 'add_task',
                  moved_task: 'swap_horiz',
                  updated_task: 'edit',
                  commented: 'chat_bubble',
                  added_member: 'person_add',
                  removed_member: 'person_remove',
                  archived_project: 'archive',
                  deleted_task: 'delete',
                  assigned_task: 'assignment_ind',
                  updated_project: 'edit_note',
                };
                const bgMap = {
                  created_project: 'bg-primary',
                  created_task: 'bg-primary-container',
                  moved_task: 'bg-tertiary',
                  commented: 'bg-secondary',
                  default: 'bg-stone-400',
                };
                return (
                  <div key={activity._id} className="relative pl-12">
                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-surface-container-low overflow-hidden ${bgMap[activity.action] || bgMap.default} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white text-lg">{iconMap[activity.action] || 'info'}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      <span className="font-bold text-on-surface">{activity.user?.name || 'Unknown'}</span>
                      {' '}{activity.details}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })}

              {recentActivity.length === 0 && (
                <p className="text-sm text-stone-400 pl-12">No activity yet.</p>
              )}
            </div>
            <button className="w-full mt-8 py-3 border border-stone-300 text-stone-600 rounded-xl font-label-md hover:bg-stone-50 transition-colors">
              View Full Activity Log
            </button>
          </div>
        </div>

      </div>
    </>
  );
};
