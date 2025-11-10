// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'task_assigned', 'task_completed', 'task_started', 'custom_post'
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who performed the action
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who should see this notification (null for team-wide)
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // team context
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // related task if applicable
  isRead: { type: Boolean, default: false },
  isGlobal: { type: Boolean, default: false } // visible to all team members
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);