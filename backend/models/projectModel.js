// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, index: true },
  description: String,
  // owner: either a team OR a user (both nullable; app ensures only one)
  ownerTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  ownerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, default: 'active' }, // active, archived, completed
  visibility: { type: String, default: 'team' } // public/private/team
}, { timestamps: true });

// Optional helper: ensure at least one owner when creating via app (we won't add DB-level check)
module.exports = mongoose.model('Project', projectSchema);