// seed.js
require('dotenv').config();
const mongoose = require('mongoose');

// require model files directly (there's no models/index export)
const User = require('./models/userModel');
const Team = require('./models/teamModel');
const Project = require('./models/projectModel');
const Task = require('./models/taskModel');
const Comment = require('./models/commentModel');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';

async function seed() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing collections (careful: deletes data)
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({})
    ]);
    console.log('Cleared collections');

    // 1) insert users
    const users = await User.insertMany([
      { email: 'admin@example.com', username: 'admin', fullName: 'Admin User', role: 'admin' },
      { email: 'john@example.com', username: 'john', fullName: 'John Doe' },
      { email: 'jane@example.com', username: 'jane', fullName: 'Jane Smith' }
    ]);
    console.log(`Inserted ${users.length} users`);

    const [admin, john, jane] = users;

    // 2) insert teams
    const teams = await Team.insertMany([
      { name: 'Alpha Team', slug: 'alpha', description: 'Frontend team', createdBy: admin._id, members: [admin._id, john._id] },
      { name: 'Beta Team', slug: 'beta', description: 'Backend team', createdBy: admin._id, members: [jane._id] }
    ]);
    console.log(`Inserted ${teams.length} teams`);

    const [alpha, beta] = teams;

    // 3) insert projects (owned by teams or users)
    const projects = await Project.insertMany([
      { name: 'Website Redesign', slug: 'website-redesign', description: 'Revamp marketing site', ownerTeam: alpha._id },
      { name: 'Auth Service', slug: 'auth-service', description: 'JWT & SSO', ownerTeam: beta._id },
      { name: 'Personal Project', slug: 'personal', description: 'Owned by John', ownerUser: john._id }
    ]);
    console.log(`Inserted ${projects.length} projects`);

    const [website, auth, personal] = projects;

    // 4) insert tasks (link to projects and assignees)
    const tasks = await Task.insertMany([
      { project: website._id, title: 'Design hero section', description: 'Create mockups', assigneeUser: jane._id, reporter: admin._id, priority: 2 },
      { project: website._id, title: 'Implement responsive nav', description: 'Mobile first', assigneeUser: john._id, reporter: admin._id },
      { project: auth._id, title: 'Implement login endpoint', description: 'POST /api/login', assigneeUser: jane._id, reporter: admin._id },
      { project: personal._id, title: 'Write README', description: 'Project documentation', assigneeUser: john._id, reporter: john._id }
    ]);
    console.log(`Inserted ${tasks.length} tasks`);

    const [task1, task2, task3, task4] = tasks;

    // 5) insert comments linked to tasks and authors
    const comments = await Comment.insertMany([
      { task: task1._id, body: 'Initial design uploaded to Figma', author: jane._id },
      { task: task1._id, body: 'Looks good — reduce line height', author: admin._id },
      { task: task2._id, body: 'Fixed CSS bug on mobile', author: john._id },
      { task: task3._id, body: 'Auth tests passing locally', author: jane._id }
    ]);
    console.log(`Inserted ${comments.length} comments`);

    // 6) Extra: show a joined example using populate
    const tasksWithDetails = await Task.find({})
      .populate('project', 'name slug')
      .populate('assigneeUser', 'username email')
      .populate('reporter', 'username')
      .lean();

    console.log('\nSample tasks with details:');
    tasksWithDetails.forEach(t => {
      console.log({
        title: t.title,
        project: t.project?.name,
        assignee: t.assigneeUser?.username || null,
        reporter: t.reporter?.username || null
      });
    });

    console.log('\nSeeding complete — closing connection.');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    // close mongoose connection
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();