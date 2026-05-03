const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Activity = require('./models/Activity');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing data.');

    // Create users
    const alice = await User.create({
      name: 'Alice Admin',
      email: 'alice@test.com',
      password: 'password',
      role: 'Admin',
    });

    const bob = await User.create({
      name: 'Bob Member',
      email: 'bob@test.com',
      password: 'password',
      role: 'Member',
    });

    console.log('Users created: Alice (Admin), Bob (Member)');

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Redesigning the corporate website with modern UI/UX patterns and accessibility standards.',
      owner: alice._id,
      members: [
        { user: alice._id, role: 'leader' },
        { user: bob._id, role: 'contributor' },
      ],
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
    });

    const project2 = await Project.create({
      name: 'Mobile App Launch',
      description: 'Q3 mobile app launch marketing campaign and development sprint.',
      owner: alice._id,
      members: [
        { user: alice._id, role: 'leader' },
      ],
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-08-31'),
    });

    console.log('Projects created: Website Redesign, Mobile App Launch');

    // Create tasks
    const today = new Date();
    
    // Task 1: Design System
    const task1Start = new Date(today);
    task1Start.setDate(today.getDate() - 2);
    const task1Due = new Date(today);
    task1Due.setDate(today.getDate() + 3);

    // Task 2: Dashboard UI
    const task2Start = new Date(today);
    task2Start.setDate(today.getDate() + 4);
    const task2Due = new Date(today);
    task2Due.setDate(today.getDate() + 10);

    // Task 3: Authentication
    const task3Start = new Date(today);
    task3Start.setDate(today.getDate() - 10);
    const task3Due = new Date(today);
    task3Due.setDate(today.getDate() - 2);

    // Task 4: Market Research
    const task4Start = new Date(today);
    task4Start.setDate(today.getDate());
    const task4Due = new Date(today);
    task4Due.setDate(today.getDate() + 5);

    const tasks = await Task.insertMany([
      {
        project: project1._id,
        title: 'Design System',
        description: 'Create comprehensive Figma design system with components, tokens, and patterns.',
        status: 'In Progress',
        priority: 'High',
        assignee: bob._id,
        startDate: task1Start,
        dueDate: task1Due,
      },
      {
        project: project1._id,
        title: 'Dashboard UI',
        description: 'Implement the dashboard overview page with real-time metrics and activity feed.',
        status: 'To Do',
        priority: 'Medium',
        assignee: alice._id,
        startDate: task2Start,
        dueDate: task2Due,
        dependencies: [], // Will link later if needed
      },
      {
        project: project1._id,
        title: 'Authentication',
        description: 'Setup login/signup flows with JWT, password hashing, and role-based access.',
        status: 'Done',
        priority: 'High',
        assignee: bob._id,
        startDate: task3Start,
        dueDate: task3Due,
      },
      {
        project: project2._id,
        title: 'Market Research',
        description: 'Conduct competitive analysis and user research for mobile launch strategy.',
        status: 'In Progress',
        priority: 'Medium',
        assignee: alice._id,
        startDate: task4Start,
        dueDate: task4Due,
      },
    ]);
    
    // Add dependency: Dashboard UI depends on Design System
    await Task.findByIdAndUpdate(tasks[1]._id, {
      $push: { dependencies: tasks[0]._id }
    });

    console.log(`Tasks created: ${tasks.length} tasks`);

    // Create some activity entries
    await Activity.insertMany([
      {
        user: alice._id,
        project: project1._id,
        action: 'created_project',
        details: 'Created project "Website Redesign"',
      },
      {
        user: alice._id,
        project: project2._id,
        action: 'created_project',
        details: 'Created project "Mobile App Launch"',
      },
      {
        user: alice._id,
        project: project1._id,
        task: tasks[0]._id,
        action: 'created_task',
        details: 'Created task "Design System"',
      },
    ]);

    console.log('Activity log seeded.');
    console.log('\n✅ Database seeded successfully!');
    console.log('──────────────────────────────');
    console.log('Test Accounts:');
    console.log('  Admin: alice@test.com / password');
    console.log('  Member: bob@test.com / password');
    console.log('──────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
