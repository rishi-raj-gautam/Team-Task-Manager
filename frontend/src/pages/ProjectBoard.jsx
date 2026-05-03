import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { TaskDetailPanel } from '../components/TaskDetailPanel';
import { ProjectSettingsModal } from '../components/ProjectSettingsModal';

const COLUMNS = [
  { id: 'To Do', title: 'TO DO', color: 'border-[#E1716F]', badgeBg: 'bg-surface-container text-stone-600', badgeText: 'High Priority', badgeColor: 'bg-primary/5 text-primary' },
  { id: 'In Progress', title: 'IN PROGRESS', color: 'border-primary-container', badgeBg: 'bg-[#E1716F]/10 text-primary', badgeText: 'Design', badgeColor: 'bg-primary-container/20 text-on-primary-container' },
  { id: 'Done', title: 'DONE', color: 'border-tertiary-container', badgeBg: 'bg-tertiary-container/20 text-on-tertiary-container', badgeText: 'Completed', badgeColor: 'bg-tertiary-container/10 text-on-tertiary-container' }
];

export const ProjectBoard = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskColumn, setNewTaskColumn] = useState('To Do');
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [p, allTasks, usersData] = await Promise.all([
        api.getProject(projectId),
        api.getProjectTasks(projectId),
        user.role === 'Admin' ? api.getUsers() : Promise.resolve([])
      ]);
      
      const taskMap = { 'To Do': [], 'In Progress': [], 'Done': [] };
      allTasks.forEach(task => {
        if (taskMap[task.status]) {
          taskMap[task.status].push(task);
        } else {
          taskMap['To Do'].push(task);
        }
      });

      setProject(p);
      setTasks(taskMap);
      if (usersData.length > 0) setAllUsers(usersData);
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;
    const sourceTasks = Array.from(tasks[sourceCol]);
    const destTasks = sourceCol === destCol ? sourceTasks : Array.from(tasks[destCol]);

    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceCol === destCol) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setTasks({ ...tasks, [sourceCol]: sourceTasks });
    } else {
      movedTask.status = destCol;
      destTasks.splice(destination.index, 0, movedTask);
      setTasks({ ...tasks, [sourceCol]: sourceTasks, [destCol]: destTasks });
      try {
        await api.updateTaskStatus(movedTask._id, destCol);
      } catch (err) {
        console.error('Failed to update task status:', err);
        // Revert on error
        loadData();
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await api.createTask(projectId, {
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || undefined,
        status: newTaskColumn,
        assignee: newTaskAssignee || user.id || user._id,
      });

      setIsModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('Medium');
      setNewTaskAssignee('');
      setNewTaskDueDate('');
      setNewTaskDueDate('');
      loadData();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create task. Please check your inputs.');
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!project) {
    return <div className="flex h-full items-center justify-center text-stone-400">Project not found</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Project Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-[42rem]">
          <nav className="flex items-center gap-2 text-stone-400 text-xs font-label-md mb-2">
            <Link to="/projects" className="hover:underline">PROJECTS</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold uppercase">{project.name}</span>
          </nav>
          <h1 className="font-h1 text-on-surface mb-3">{project.name}</h1>
          <p className="font-body-lg text-on-surface-variant max-w-[36rem]">
            {project.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="flex -space-x-3">
            {project.members?.slice(0, 3).map((member, idx) => {
              const u = member.user;
              return (
                <div key={u?._id || idx} className="w-10 h-10 rounded-full border-2 border-surface bg-stone-200 flex items-center justify-center font-bold text-stone-600 text-sm z-10" style={{ zIndex: 10 - idx }}>
                  {u?.name ? u.name.charAt(0) : '?'}
                </div>
              );
            })}
            {project.members?.length > 3 && (
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center text-on-primary-container font-label-md text-xs z-0">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {user.role === 'Admin' && (
              <button onClick={() => setIsSettingsOpen(true)} className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-sm">settings</span>
                Settings
              </button>
            )}
            {user.role === 'Admin' && (
              <button onClick={() => { setNewTaskColumn('To Do'); setIsModalOpen(true); }} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col xl:flex-row gap-8 xl:gap-gutter h-full min-h-[600px] items-start overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-4 h-full w-full xl:min-w-[320px] xl:w-80">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-label-md text-stone-500">{col.title}</h3>
                  <span className={`${col.badgeBg} px-2 py-0.5 rounded-full text-[10px] font-bold`}>
                    {tasks[col.id]?.length || 0}
                  </span>
                </div>
                <button className="text-stone-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">more_horiz</span>
                </button>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-4 min-h-[150px] p-2 -mx-2 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-stone-100/50' : ''}`}
                  >
                    {tasks[col.id]?.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-surface border-l-4 ${col.color} p-5 rounded-xl shadow-[0_12px_24px_-10px_rgba(159,63,63,0.08)] hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing group ${col.id === 'Done' ? 'opacity-70 bg-stone-50' : ''} ${snapshot.isDragging ? 'shadow-xl scale-[1.02] rotate-1 z-50' : ''}`}
                            onClick={() => setSelectedTask(task)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className={`${col.badgeColor} px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase`}>
                                {task.priority || col.badgeText}
                              </span>
                              {col.id !== 'Done' && <span className="material-symbols-outlined text-stone-300 group-hover:text-stone-400">open_in_new</span>}
                            </div>
                            <h4 className={`font-h3 text-base mb-2 ${col.id === 'Done' ? 'line-through text-stone-400' : ''}`}>{task.title}</h4>
                            <div className="flex items-center justify-between mt-6">
                              <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border border-surface bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                                  {task.assignee?.name?.charAt(0) || 'U'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-stone-400">
                                {col.id === 'Done' ? (
                                  <span className="text-[10px] font-bold text-stone-400">Completed</span>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-sm">chat_bubble</span>
                                    <span className="text-[10px] font-bold">{task.comments?.length || 0}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {user.role === 'Admin' && (
                      <button 
                        onClick={() => { setNewTaskColumn(col.id); setIsModalOpen(true); }}
                        className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 font-label-md text-xs hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2 mt-2"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Task
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-stone-900/50 backdrop-blur-sm !mt-0">
          <div className="bg-surface-container-lowest w-full max-w-[32rem] rounded-[24px] shadow-2xl shadow-primary/10 overflow-hidden border border-outline-variant/20 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 md:px-8 md:py-6 border-b border-surface-container-high flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-h2 text-h2 text-on-surface tracking-tight">Create New Task</h2>
                <p className="text-sm text-on-surface-variant font-manrope">Add a new task to your project.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="flex flex-col min-h-0">
              <div className="px-6 py-6 md:px-8 md:py-8 space-y-6 overflow-y-auto">
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none transition-colors text-on-surface font-body-md"
                    placeholder="e.g. Update design system"
                  />
                </div>
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Description</label>
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl h-24 resize-none focus:ring-2 focus:ring-primary outline-none transition-colors text-on-surface font-body-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Priority</label>
                    <select 
                      value={newTaskPriority}
                      onChange={e => setNewTaskPriority(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-on-surface font-body-md"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Due Date</label>
                    <input 
                      type="date"
                      value={newTaskDueDate}
                      onChange={e => setNewTaskDueDate(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-on-surface font-body-md"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Assignee</label>
                  <select 
                    value={newTaskAssignee}
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none text-on-surface font-body-md"
                  >
                    <option value="">Select Assignee</option>
                    {project.members.map(m => (
                      <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 md:px-8 md:py-6 border-t border-surface-container-high bg-surface-container-lowest shrink-0 flex justify-end gap-4 rounded-b-[24px]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-label-md hover:opacity-90 disabled:opacity-50 transition-opacity">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel 
          task={selectedTask} 
          projectMembers={project.members}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={() => {
            setSelectedTask(null);
            loadData();
          }}
        />
      )}

      {/* Project Settings Modal */}
      {isSettingsOpen && user.role === 'Admin' && (
        <ProjectSettingsModal 
          project={project}
          users={allUsers}
          onClose={() => setIsSettingsOpen(false)}
          onProjectUpdated={() => {
            loadData();
          }}
          onProjectDeleted={() => {
            window.location.href = '/projects';
          }}
        />
      )}
    </div>
  );
};
