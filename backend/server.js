const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

// Models
const User = require('./models/userModel');
const Team = require('./models/teamModel');
const Project = require('./models/projectModel');
const Task = require('./models/taskModel');
const Notification = require('./models/notificationModel');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Health
app.get('/', (req, res) => {
  res.send('Backend connected to MongoDB!');
});

// Auth helpers
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(); // allow anonymous if not required
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email }
  } catch (_) {
    // ignore invalid token; downstream routes can require it
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Authentication required' });
  next();
}

// Helper function to create notifications
async function createNotification(type, message, user, options = {}) {
  try {
    await Notification.create({
      type,
      message,
      user,
      ...options
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}
app.use(authMiddleware);

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password, fullName } = req.body;
    if (!email || !username || !password) return res.status(400).json({ message: 'email, username, password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, fullName, passwordHash });
    const token = signToken({ id: user._id, email: user.email });
    res.json({ token, user: { id: user._id, email: user.email, username: user.username, fullName: user.fullName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({ id: user._id, email: user.email });
    res.json({ token, user: { id: user._id, email: user.email, username: user.username, fullName: user.fullName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Data routes (require auth for write; reads allowed)
app.get('/api/projects', async (_req, res) => {
  const items = await Project.find({}).lean();
  res.json(items);
});

app.get('/api/tasks', async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  const items = await Task.find(where)
    .populate('project', 'name slug')
    .populate('assigneeUser', 'username email')
    .populate('assigneeTeam', 'name')
    .lean();
  res.json(items);
});

app.post('/api/tasks', requireAuth, async (req, res) => {
  try {
    const { title, description, priority, dueText, dueDate, tags, assigneeUser, assigneeTeam, notification } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    
    // Find a default project or create one
    let project = await Project.findOne({ ownerUser: req.user.id });
    if (!project) {
      project = await Project.create({
        name: 'My Tasks',
        slug: 'my-tasks',
        description: 'Personal tasks',
        ownerUser: req.user.id
      });
    }
    
    const task = await Task.create({
      project: project._id,
      title,
      description,
      priority: priority || 'Medium',
      dueText: dueText || 'Today',
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      assigneeUser: assigneeUser || null,
      assigneeTeam: assigneeTeam || null,
      reporter: req.user.id,
      status: 'Not started',
      notification: notification || null
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name slug')
      .populate('assigneeUser', 'username email fullName')
      .populate('assigneeTeam', 'name')
      .populate('reporter', 'username email fullName')
      .lean();
    
    // Create notification if task is assigned
    if (assigneeUser && assigneeUser !== req.user.id) {
      const user = await User.findById(req.user.id);
      await createNotification(
        'task_assigned',
        `${user.username} assigned you a task: ${title}`,
        req.user.id,
        { targetUser: assigneeUser, task: task._id, team: assigneeTeam }
      );
    }
    
    res.json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// Update task status
app.put('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { status, isRunning } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (status) task.status = status;
    if (typeof isRunning === 'boolean') task.isRunning = isRunning;
    
    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name slug')
      .populate('assigneeUser', 'username email fullName')
      .populate('assigneeTeam', 'name')
      .populate('reporter', 'username email fullName')
      .lean();
    
    // Create notification for status changes
    if (status) {
      const user = await User.findById(req.user.id);
      let message = '';
      if (status === 'Done') message = `${user.username} completed task: ${task.title}`;
      else if (status === 'In progress') message = `${user.username} started working on: ${task.title}`;
      
      if (message) {
        await createNotification(
          status === 'Done' ? 'task_completed' : 'task_started',
          message,
          req.user.id,
          { task: task._id, team: task.assigneeTeam, isGlobal: true }
        );
      }
    }
    
    res.json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Check if user is the reporter or assignee
    if (task.reporter.toString() !== req.user.id && 
        (task.assigneeUser && task.assigneeUser.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    // Delete related notifications
    await Notification.deleteMany({ task: req.params.id });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

// Get teams for current user
app.get('/api/teams', requireAuth, async (req, res) => {
  try {
    console.log('Fetching teams for user:', req.user.id);
    const teams = await Team.find({ members: req.user.id })
      .populate('members', 'username email fullName')
      .populate('createdBy', 'username email fullName')
      .lean();
    console.log('Found teams:', teams.length);
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
});

// Create team
app.post('/api/teams', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Team name is required' });
    
    const team = await Team.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      createdBy: req.user.id,
      members: [req.user.id]
    });
    
    const populatedTeam = await Team.findById(team._id)
      .populate('members', 'username email fullName')
      .populate('createdBy', 'username email fullName')
      .lean();
    
    res.json(populatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create team' });
  }
});

// Add member to team
app.post('/api/teams/:id/members', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const team = await Team.findById(req.params.id);
    
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team admin can add members' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (team.members.includes(user._id)) {
      return res.status(400).json({ message: 'User already in team' });
    }
    
    team.members.push(user._id);
    await team.save();
    
    const populatedTeam = await Team.findById(team._id)
      .populate('members', 'username email fullName')
      .populate('createdBy', 'username email fullName')
      .lean();
    
    res.json(populatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add member' });
  }
});

// Remove member from team
app.delete('/api/teams/:id/members/:userId', requireAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.createdBy.toString() !== req.user.id && req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Only team admin can remove members or users can remove themselves' });
    }
    
    team.members = team.members.filter(m => m.toString() !== req.params.userId);
    await team.save();
    
    const populatedTeam = await Team.findById(team._id)
      .populate('members', 'username email fullName')
      .populate('createdBy', 'username email fullName')
      .lean();
    
    res.json(populatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
});

// Get tasks for a specific team
app.get('/api/teams/:id/tasks', requireAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team || !team.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const tasks = await Task.find({ assigneeTeam: req.params.id })
      .populate('project', 'name slug')
      .populate('assigneeUser', 'username email fullName')
      .populate('assigneeTeam', 'name')
      .populate('reporter', 'username email fullName')
      .lean();
    
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch team tasks' });
  }
});

// Get notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const userTeams = await Team.find({ members: req.user.id }).select('_id');
    const teamIds = userTeams.map(t => t._id);
    
    const notifications = await Notification.find({
      $or: [
        { targetUser: req.user.id },
        { user: req.user.id }, // Include notifications created by the user (their own posts)
        { isGlobal: true, team: { $in: teamIds } },
        { isGlobal: true, team: null } // Global posts not tied to a specific team
      ]
    })
    .populate('user', 'username email fullName')
    .populate('task', 'title')
    .populate('team', 'name')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
    
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Create custom notification/post
app.post('/api/notifications', requireAuth, async (req, res) => {
  try {
    const { message, team } = req.body;
    console.log('Creating notification:', { message, team, userId: req.user.id });
    
    if (!message) return res.status(400).json({ message: 'Message is required' });
    
    // Get user info for better notification message
    const user = await User.findById(req.user.id);
    const displayMessage = message; // Keep the original message as-is
    
    await createNotification(
      'custom_post',
      displayMessage,
      req.user.id,
      { team: team || null, isGlobal: true }
    );
    
    console.log('Notification created successfully');
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// User profile routes
app.get('/api/user/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').lean();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const user = await User.findById(req.user.id);
    
    if (fullName) user.fullName = fullName;
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    
    await user.save();
    res.json({ success: true, user: { id: user._id, email: user.email, username: user.username, fullName: user.fullName } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

app.put('/api/user/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

app.delete('/api/user/account', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    
    // Remove user from all teams
    await Team.updateMany({ members: req.user.id }, { $pull: { members: req.user.id } });
    
    // Delete user's tasks and notifications
    await Task.deleteMany({ reporter: req.user.id });
    await Notification.deleteMany({ user: req.user.id });
    
    // Delete user
    await User.findByIdAndDelete(req.user.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// Get all users (for assignment dropdowns)
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('username email fullName').lean();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
