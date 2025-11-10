// models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, index: true, unique: true, sparse: true },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // simple list of user ids
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);