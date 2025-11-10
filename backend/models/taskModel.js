// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: 'todo' }, // todo, in_progress, review, done
  priority: { type: Number, default: 3 }, // 1 high .. 5 low
  assigneeUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assigneeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dueDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);