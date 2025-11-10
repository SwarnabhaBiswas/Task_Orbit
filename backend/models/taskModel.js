// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: 'Not started' }, // Not started, In progress, Review, Done
  priority: { type: String, default: 'Medium' }, // Low, Medium, High
  assigneeUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assigneeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dueDate: Date,
  dueText: String, // "Today", "Tomorrow", "This week", "Friday", etc.
  tags: [String],
  notification: String, // "In 1 hour", etc.
  timeTracked: { type: Number, default: 0 }, // in minutes
  isRunning: { type: Boolean, default: false } // for timer functionality
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
