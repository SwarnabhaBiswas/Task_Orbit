import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Lock, Trash2, UserMinus, Users, Settings as SettingsIcon, AlertTriangle, Eye, EyeOff, Plus, X } from "lucide-react";

function PasswordChangeSection() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/api/user/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change password');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Lock size={24} className="text-slate-700" />
        <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

function TeamManagementSection() {
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchTeams = async () => {
    try {
      const { data } = await api.get('/api/teams');
      setTeams(data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setLoading(true);
    try {
      await api.post('/api/teams', {
        name: newTeamName,
        description: newTeamDescription
      });
      
      setNewTeamName('');
      setNewTeamDescription('');
      setShowCreateModal(false);
      fetchTeams();
    } catch (error) {
      console.error('Failed to create team:', error);
    }
    setLoading(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim() || !selectedTeam) return;

    setLoading(true);
    try {
      await api.post(`/api/teams/${selectedTeam._id}/members`, {
        email: memberEmail
      });
      
      setMemberEmail('');
      setShowAddMemberModal(false);
      fetchTeams();
    } catch (error) {
      console.error('Failed to add member:', error);
      alert(error?.response?.data?.message || 'Failed to add member');
    }
    setLoading(false);
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.delete(`/api/teams/${teamId}/members/${userId}`);
      fetchTeams();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert(error?.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    try {
      await api.delete(`/api/teams/${teamId}/members/${user.id}`);
      fetchTeams();
    } catch (error) {
      console.error('Failed to leave team:', error);
      alert(error?.response?.data?.message || 'Failed to leave team');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users size={24} className="text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-900">Team Management</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          <span>Create Team</span>
        </button>
      </div>

      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team._id} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{team.name}</h3>
              <div className="flex items-center space-x-2">
                {team.createdBy._id === user.id && (
                  <button
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowAddMemberModal(true);
                    }}
                    className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Add Member
                  </button>
                )}
                {team.createdBy._id !== user.id && (
                  <button
                    onClick={() => handleLeaveTeam(team._id)}
                    className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Leave Team
                  </button>
                )}
              </div>
            </div>
            
            {team.description && (
              <p className="text-sm text-slate-600 mb-3">{team.description}</p>
            )}
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Members ({team.members.length})</p>
              <div className="flex flex-wrap gap-2">
                {team.members.map((member) => (
                  <div key={member._id} className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-1">
                    <span className="text-sm text-slate-700">
                      {member.fullName || member.username}
                      {team.createdBy._id === member._id && ' (Admin)'}
                    </span>
                    {team.createdBy._id === user.id && member._id !== user.id && (
                      <button
                        onClick={() => handleRemoveMember(team._id, member._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Team Name</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description (optional)</label>
                <textarea
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Member to {selectedTeam?.name}</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Member Email</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user's email"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DangerZone() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!confirm('This action cannot be undone. Are you absolutely sure?')) return;

    setLoading(true);
    try {
      await api.delete('/api/user/account', {
        data: { password: deletePassword }
      });
      
      alert('Account deleted successfully');
      logout();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to delete account');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <AlertTriangle size={24} className="text-red-500" />
        <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
        <p className="text-sm text-red-700 mb-4">
          Once you delete your account, there is no going back. This will permanently delete your account and remove your data from all teams.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Trash2 size={16} />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Confirm Account Deletion</h3>
            <p className="text-sm text-slate-600 mb-4">
              This action cannot be undone. Please enter your password to confirm.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <SettingsIcon size={32} className="text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">Manage your account and team preferences</p>
          </div>
        </div>

        <div className="space-y-8">
          <PasswordChangeSection />
          <TeamManagementSection />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}