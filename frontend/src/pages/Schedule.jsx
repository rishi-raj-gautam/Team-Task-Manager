import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  differenceInDays, addDays, subDays, isBefore, startOfDay
} from 'date-fns';

export const Schedule = () => {
  const { user } = useAuth();
  const [view, setView] = useState('Calendar'); // 'Calendar' | 'Timeline'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedMember, setSelectedMember] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allTasks, allProjects] = await Promise.all([
        api.getAllTasks(),
        api.getProjects()
      ]);
      setTasks(allTasks);
      setProjects(allProjects);
    } catch (error) {
      console.error('Failed to load schedule data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task._id);
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // We only update startDate and dueDate if dragging on calendar.
    // For simplicity, we just shift both relative to the drop date for startDate.
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const currentStart = task.startDate ? new Date(task.startDate) : new Date(task.dueDate || new Date());
    const currentDue = task.dueDate ? new Date(task.dueDate) : new Date();
    
    // Shift task by difference in days
    const diff = differenceInDays(date, startOfDay(currentStart));
    const newStart = addDays(currentStart, diff);
    const newDue = addDays(currentDue, diff);

    // Optimistic update
    const updatedTasks = tasks.map(t => {
      if (t._id === taskId) {
        return { ...t, startDate: newStart.toISOString(), dueDate: newDue.toISOString() };
      }
      return t;
    });
    setTasks(updatedTasks);

    try {
      await api.updateTask(taskId, {
        startDate: newStart.toISOString(),
        dueDate: newDue.toISOString()
      });
    } catch (error) {
      console.error('Failed to update task dates:', error);
      loadData(); // revert
    }
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  // Calendar Helpers
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Filtered Tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedProject !== 'All' && task.project?._id !== selectedProject && task.project !== selectedProject) return false;
    if (selectedMember !== 'All' && task.assignee?._id !== selectedMember) return false;
    return true;
  });

  // Calculate Workload
  const workload = {};
  filteredTasks.forEach(t => {
    const assigneeName = t.assignee?.name || 'Unassigned';
    if (!workload[assigneeName]) workload[assigneeName] = 0;
    workload[assigneeName]++;
  });

  // Upcoming Deadlines (next 7 days)
  const today = startOfDay(new Date());
  const nextWeek = addDays(today, 7);
  const upcomingTasks = filteredTasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due >= today && due <= nextWeek && t.status !== 'Done';
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto space-y-gutter">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h2 className="font-h1 text-on-surface">Schedule</h2>
            <p className="font-body-md text-on-surface-variant">Manage timelines and team availability.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Toggle Switch */}
            <div className="flex bg-surface-container-high p-1 rounded-xl">
              <button 
                onClick={() => setView('Calendar')}
                className={`px-6 py-1.5 rounded-lg font-label-md flex items-center gap-2 transition-all ${view === 'Calendar' ? 'bg-white tonal-elevation text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                Calendar
              </button>
              <button 
                onClick={() => setView('Timeline')}
                className={`px-6 py-1.5 rounded-lg font-label-md flex items-center gap-2 transition-all ${view === 'Timeline' ? 'bg-white tonal-elevation text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-sm">timeline</span>
                Timeline
              </button>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select 
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg font-label-md text-xs py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="All">All Projects</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <select 
                value={selectedMember}
                onChange={e => setSelectedMember(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg font-label-md text-xs py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="All">All Members</option>
                {Array.from(new Set(tasks.filter(t => t.assignee).map(t => JSON.stringify({id: t.assignee._id, name: t.assignee.name})))).map(m => {
                  const member = JSON.parse(m);
                  return <option key={member.id} value={member.id}>{member.name}</option>
                })}
              </select>
            </div>
          </div>
        </section>

        {view === 'Calendar' && (
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* Calendar View */}
            <div className="flex-1 bg-white rounded-xl tonal-elevation overflow-hidden border border-surface-container-highest flex flex-col">
              {/* Calendar Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container shrink-0">
                <div className="flex items-center gap-4">
                  <h3 className="font-h3 text-on-surface">{format(currentDate, 'MMMM yyyy')}</h3>
                  <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-surface-container-low rounded-lg transition-colors">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-surface-container-low rounded-lg transition-colors">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
                <button onClick={goToday} className="font-label-md text-primary hover:underline">Today</button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 border-b border-surface-container shrink-0">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                  <div key={day} className="py-3 text-center font-status text-on-surface-variant border-r border-surface-container last:border-r-0">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 flex-1 min-h-[500px]">
                {calendarDays.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, today);
                  
                  // Get tasks starting or ending on this day
                  const dayTasks = filteredTasks.filter(t => {
                    const tStart = t.startDate ? new Date(t.startDate) : (t.dueDate ? new Date(t.dueDate) : null);
                    if (!tStart) return false;
                    return isSameDay(tStart, day);
                  });

                  return (
                    <div 
                      key={day.toISOString()} 
                      onDragOver={allowDrop}
                      onDrop={(e) => handleDrop(e, day)}
                      className={`p-2 border-r border-b border-surface-container flex flex-col gap-1 overflow-hidden
                        ${!isCurrentMonth ? 'bg-surface-container-lowest opacity-50' : ''}
                        ${isToday ? 'bg-orange-50/50 ring-1 ring-inset ring-primary-container/50' : ''}
                        last:border-r-0 min-h-[100px]
                      `}
                    >
                      <span className={`font-label-md ${isToday ? 'text-primary font-bold' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      
                      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                        {dayTasks.map(task => {
                          const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), today) && task.status !== 'Done';
                          const isDone = task.status === 'Done';
                          
                          let bgClass = 'bg-surface-container text-stone-700 border-stone-300';
                          if (isOverdue) bgClass = 'bg-[#ffdad8] text-on-primary-fixed-variant border-error';
                          else if (isDone) bgClass = 'bg-green-100 text-green-800 border-green-500 opacity-70';
                          else if (task.priority === 'High') bgClass = 'bg-[#ffb7b7] text-[#7b4546] border-[#E1716F]';
                          else if (task.priority === 'Medium') bgClass = 'bg-yellow-50 text-yellow-800 border-yellow-500';

                          const canDrag = user.role === 'Admin';
                          return (
                            <div 
                              key={task._id} 
                              draggable={canDrag}
                              onDragStart={(e) => canDrag && handleDragStart(e, task)}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-sm border-l-2 truncate ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${bgClass}`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar / Widget Section */}
            <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
              {/* Workload Distribution */}
              <div className="p-6 bg-white rounded-xl tonal-elevation border border-surface-container-highest">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-h3 text-base">Workload</h4>
                  <span className="material-symbols-outlined text-stone-400 text-lg">bar_chart</span>
                </div>
                <div className="space-y-4">
                  {Object.entries(workload).map(([name, count], i) => {
                    const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary-container', 'bg-[#E1716F]'];
                    const color = colors[i % colors.length];
                    // max logic for percentage
                    const maxCount = Math.max(...Object.values(workload), 1);
                    const percentage = (count / maxCount) * 100;
                    
                    return (
                      <div key={name} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-label-md uppercase tracking-wider text-on-surface-variant">
                          <span>{name}</span>
                          <span>{count} Task{count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(workload).length === 0 && (
                    <p className="text-sm text-stone-500">No tasks assigned.</p>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="p-6 bg-[#FFFBF7] rounded-xl tonal-elevation border border-primary-container/20 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-h3 text-base">Upcoming Deadlines</h4>
                  <span className="material-symbols-outlined text-primary text-lg">event_upcoming</span>
                </div>
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 5).map(task => {
                    const due = new Date(task.dueDate);
                    const isToday = isSameDay(due, today);
                    const isOverdue = isBefore(due, today);
                    
                    return (
                      <div key={task._id} className="flex gap-4 p-3 bg-white rounded-lg border border-surface-container hover:border-primary transition-all cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isOverdue || isToday ? 'bg-error-container text-error' : 'bg-orange-50 text-primary'}`}>
                          <span className="material-symbols-outlined text-xl">
                            {isOverdue ? 'priority_high' : (isToday ? 'bolt' : 'event')}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-label-md text-sm truncate">{task.title}</p>
                          <p className={`text-[11px] font-bold uppercase mt-0.5 ${isOverdue ? 'text-error' : 'text-on-surface-variant'}`}>
                            {isOverdue ? 'Overdue' : (isToday ? 'Today' : format(due, 'MMM d, yyyy'))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {upcomingTasks.length === 0 && (
                    <p className="text-sm text-stone-500">No upcoming deadlines within 7 days.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'Timeline' && (
          <section className="bg-white rounded-xl tonal-elevation border border-surface-container-highest overflow-hidden flex-1 flex flex-col">
            <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center border-b border-surface-container">
              <h4 className="font-label-md text-on-surface-variant uppercase tracking-widest">Project Timeline</h4>
              <div className="flex flex-wrap items-center gap-2">
                {projects.map((p, i) => {
                  const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary-container', 'bg-orange-400'];
                  return (
                    <div key={p._id} className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-surface-container text-xs">
                      <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></span> {p.name}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 overflow-x-auto flex-1">
              <div className="min-w-[800px] relative h-full flex flex-col">
                {/* Find min start and max end to establish timeline bounds */}
                {(() => {
                  const validTasks = filteredTasks.filter(t => t.startDate && t.dueDate);
                  if (validTasks.length === 0) return <p className="text-stone-500">No tasks with start and due dates to display on timeline.</p>;

                  const earliestStart = new Date(Math.min(...validTasks.map(t => new Date(t.startDate))));
                  const latestEnd = new Date(Math.max(...validTasks.map(t => new Date(t.dueDate))));
                  const timelineStart = subDays(earliestStart, 2);
                  const timelineEnd = addDays(latestEnd, 2);
                  const totalDays = differenceInDays(timelineEnd, timelineStart);

                  // Helper to get percentage left
                  const getLeftOffset = (date) => (differenceInDays(new Date(date), timelineStart) / totalDays) * 100;
                  const getWidth = (start, end) => (differenceInDays(new Date(end), new Date(start)) / totalDays) * 100;

                  return (
                    <>
                      {/* Today Marker */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-primary/40 z-10 pointer-events-none" style={{ left: `${getLeftOffset(today)}%` }}>
                        <div className="absolute top-0 -translate-x-1/2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-sm">TODAY</div>
                      </div>

                      <div className="space-y-8 pb-4 flex-1">
                        {/* Group by Project */}
                        {projects.filter(p => selectedProject === 'All' || selectedProject === p._id).map((project, i) => {
                          const projectTasks = validTasks.filter(t => t.project?._id === project._id || t.project === project._id);
                          if (projectTasks.length === 0) return null;
                          
                          const colors = ['border-primary bg-primary-container/20 text-primary', 'border-secondary bg-secondary-container/30 text-on-secondary-container', 'border-tertiary bg-tertiary-container/30 text-tertiary'];
                          const colorClass = colors[i % colors.length];

                          return (
                            <div key={project._id} className="space-y-4">
                              <div className="flex items-center gap-4">
                                <span className="w-48 font-label-md text-xs text-on-surface truncate">{project.name}</span>
                                <div className="flex-1 h-px bg-surface-container"></div>
                              </div>
                              <div className="relative h-12 bg-surface-container-lowest rounded-lg border border-surface-container">
                                {projectTasks.map(task => {
                                  const left = getLeftOffset(task.startDate);
                                  const width = Math.max(getWidth(task.startDate, task.dueDate), 2); // min 2% width
                                  return (
                                    <div 
                                      key={task._id}
                                      className={`absolute h-8 top-2 border-l-4 flex items-center px-4 rounded-r-sm overflow-hidden ${colorClass}`}
                                      style={{ left: `${left}%`, width: `${width}%` }}
                                      title={task.title}
                                    >
                                      <span className="text-xs font-bold truncate">{task.title}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Time Scale */}
                      <div className="flex justify-between mt-auto px-4 font-status text-[10px] text-stone-400 border-t pt-4">
                        {[0, 0.2, 0.4, 0.6, 0.8, 1].map(pct => {
                          const scaleDate = addDays(timelineStart, Math.round(totalDays * pct));
                          return <span key={pct}>{format(scaleDate, 'dd MMM')}</span>;
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
