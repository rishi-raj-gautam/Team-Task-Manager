export const mockUsers = [
  { id: '1', name: 'Alice Admin', email: 'alice@test.com', role: 'Admin', password: 'password' },
  { id: '2', name: 'Bob Member', email: 'bob@test.com', role: 'Member', password: 'password' },
];

export let mockProjects = [
  { id: 'p1', name: 'Website Redesign', description: 'Redesigning the corporate website.', members: ['1', '2'] },
  { id: 'p2', name: 'Mobile App Launch', description: 'Q3 mobile app launch marketing.', members: ['1'] },
];

export let mockTasks = [
  { id: 't1', projectId: 'p1', title: 'Design System', description: 'Create Figma design system', status: 'To Do', assigneeId: '2', dueDate: '2026-05-10' },
  { id: 't2', projectId: 'p1', title: 'Dashboard UI', description: 'Implement dashboard overview', status: 'In Progress', assigneeId: '1', dueDate: '2026-05-05' },
  { id: 't3', projectId: 'p1', title: 'Authentication', description: 'Setup login/signup flows', status: 'Done', assigneeId: '2', dueDate: '2026-05-01' },
];

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  login: async (email, password) => {
    await delay(500);
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
  
  signup: async (name, email, password) => {
    await delay(500);
    if (mockUsers.some(u => u.email === email)) throw new Error('Email already exists');
    const newUser = { id: String(Date.now()), name, email, role: 'Member', password };
    mockUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  getProjects: async () => {
    await delay(300);
    return [...mockProjects];
  },

  createProject: async (projectData) => {
    await delay(300);
    const newProject = { id: `p${Date.now()}`, ...projectData };
    mockProjects.push(newProject);
    return newProject;
  },

  getTasks: async (projectId) => {
    await delay(300);
    return mockTasks.filter(t => t.projectId === projectId);
  },

  getAllTasks: async () => {
    await delay(300);
    return [...mockTasks];
  },

  updateTaskStatus: async (taskId, newStatus) => {
    await delay(300);
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      mockTasks[taskIndex].status = newStatus;
      return mockTasks[taskIndex];
    }
    throw new Error('Task not found');
  },
  
  createTask: async (taskData) => {
    await delay(300);
    const newTask = { id: `t${Date.now()}`, status: 'To Do', ...taskData };
    mockTasks.push(newTask);
    return newTask;
  }
};
