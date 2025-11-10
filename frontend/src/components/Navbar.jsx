import { useEffect, useState } from "react";
import { Search, Plus, Mail, User, X } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { api } from "../services/api";

function ProfileModal({ isOpen, onClose, user }) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatar: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.put('/api/user/profile', {
        fullName: profile.fullName,
        email: profile.email
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    }
    
    setLoading(false);
  };
  
  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={20} className="text-gray-500" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile</h2>
        
        {/* Error/Success Messages */}
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
        
        {/* Profile Photo Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Profile photo</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </span>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Upload photo
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: jpg, gif or png.<br />
            Max file size: 500k.
          </p>
        </div>
        
        {/* Contact Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Contact</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full name*</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your name here"
              />
            </div>
          </div>
        </div>
        
        {/* Email Section */}
        <div className="mb-8">
          <label className="block text-sm text-gray-600 mb-1">Email address</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskModal({ isOpen, onClose, onTaskCreated, defaultDate }) {
  const [taskForm, setTaskForm] = useState({
    title: '',
    day: defaultDate ? 'Custom' : 'Today',
    customDate: defaultDate ? new Date(defaultDate).toISOString().split('T')[0] : '',
    notification: 'In 1 hour',
    customNotification: '',
    priority: 'Medium',
    tags: '',
    assigneeUser: '',
    assigneeTeam: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotificationPicker, setShowNotificationPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Fetch users and teams for assignment
      api.get('/api/users').then(({ data }) => setUsers(data)).catch(() => setUsers([]));
      api.get('/api/teams').then(({ data }) => setTeams(data)).catch(() => setTeams([]));
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultDate) {
      setTaskForm(prev => ({
        ...prev,
        day: 'Custom',
        customDate: new Date(defaultDate).toISOString().split('T')[0]
      }));
    }
  }, [defaultDate]);

  const handleSubmit = async () => {
    if (!taskForm.title.trim()) {
      setError('Task title is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/api/tasks', {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        dueText: taskForm.customDate ? 'Custom' : taskForm.day,
        dueDate: taskForm.customDate || null,
        tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
        assigneeUser: taskForm.assigneeUser || null,
        assigneeTeam: taskForm.assigneeTeam || null,
        notification: taskForm.customNotification || taskForm.notification
      });
      
      if (onTaskCreated) onTaskCreated(data);
      toast.success('Task created successfully');
      
      // Reset form
      setTaskForm({
        title: '',
        day: 'Today',
        customDate: '',
        notification: 'In 1 hour',
        customNotification: '',
        priority: 'Medium',
        tags: '',
        assigneeUser: '',
        assigneeTeam: '',
        description: ''
      });
      
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create task');
      toast.error('Failed to create task');
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={20} className="text-gray-500" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Create New Task</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {/* Task Title */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Task title..."
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
            value={taskForm.title}
            onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
          />
        </div>
        
        <div className="space-y-4">
          {/* Day */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-sm">📅</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Day</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className={`px-3 py-1 rounded-lg text-sm font-medium ${
                taskForm.day === 'Today' && !taskForm.customDate ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`} onClick={() => setTaskForm({...taskForm, day: 'Today', customDate: ''})}>Today</button>
              <button className={`px-3 py-1 rounded-lg text-sm font-medium ${
                taskForm.day === 'Tomorrow' && !taskForm.customDate ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`} onClick={() => setTaskForm({...taskForm, day: 'Tomorrow', customDate: ''})}>Tomorrow</button>
              <button className={`px-3 py-1 rounded-lg text-sm font-medium ${
                taskForm.day === 'This week' && !taskForm.customDate ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`} onClick={() => setTaskForm({...taskForm, day: 'This week', customDate: ''})}>This week</button>
              {taskForm.customDate && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  {new Date(taskForm.customDate).toLocaleDateString()}
                </span>
              )}
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
              {showDatePicker && (
                <input
                  type="date"
                  value={taskForm.customDate}
                  onChange={(e) => setTaskForm({...taskForm, customDate: e.target.value, day: 'Custom'})}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              )}
            </div>
          </div>
          
          {/* Notification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-sm">🔔</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Notification</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={taskForm.notification}
                onChange={(e) => setTaskForm({...taskForm, notification: e.target.value})}
                className="text-sm text-gray-600 bg-transparent border-0 focus:ring-0"
              >
                <option value="In 1 hour">In 1 hour</option>
                <option value="In 2 hours">In 2 hours</option>
                <option value="In 1 day">In 1 day</option>
                <option value="Custom">Custom</option>
              </select>
              <button 
                onClick={() => setShowNotificationPicker(!showNotificationPicker)}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          {showNotificationPicker && (
            <div className="ml-11 mt-2">
              <input
                type="text"
                placeholder="Custom notification time"
                value={taskForm.customNotification}
                onChange={(e) => setTaskForm({...taskForm, customNotification: e.target.value})}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm w-48"
              />
            </div>
          )}
          
          {/* Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">⚡</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Priority</span>
            </div>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map((p) => (
                <button 
                  key={p}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    taskForm.priority === p ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`} 
                  onClick={() => setTaskForm({...taskForm, priority: p})}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          {/* Assignment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">👤</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Assign to</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={taskForm.assigneeUser}
                onChange={(e) => setTaskForm({...taskForm, assigneeUser: e.target.value})}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Select user</option>
                {(() => {
                  const selectedTeamObj = teams.find(t => t._id === taskForm.assigneeTeam);
                  const filteredUsers = selectedTeamObj ? 
                    users.filter(user => selectedTeamObj.members.some(member => member._id === user._id)) :
                    users;
                  return filteredUsers.map(user => (
                    <option key={user._id} value={user._id}>{user.fullName || user.username}</option>
                  ));
                })()}
              </select>
              <select
                value={taskForm.assigneeTeam}
                onChange={(e) => setTaskForm({...taskForm, assigneeTeam: e.target.value})}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Select team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">🏷️</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Tags</span>
            </div>
            <input
              type="text"
              placeholder="tag1, tag2"
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm w-32"
              value={taskForm.tags}
              onChange={(e) => setTaskForm({...taskForm, tags: e.target.value})}
            />
          </div>
          
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Description</h3>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Add description..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
            />
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Creating...' : 'Create task'}
        </button>
      </div>
    </div>
  );
}

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const title = location.pathname === "/tasks" ? "My tasks" : "Dashboard";
  
  useEffect(() => {
    const handler = (e) => {
      const date = e.detail?.selectedDate;
      if (date) {
        setSelectedDate(date);
        setShowTaskModal(true);
      }
    };
    window.addEventListener('openTaskModal', handler);
    return () => window.removeEventListener('openTaskModal', handler);
  }, []);
  
  // Close profile modal when task modal opens and vice versa
  const openProfileModal = () => {
    setShowTaskModal(false);
    setShowProfileModal(true);
  };
  
  const openTaskModal = () => {
    setShowProfileModal(false);
    setShowTaskModal(true);
  };

  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2);
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        {/* Center: Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={openTaskModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700"
          >
            <Plus size={18} />
            New task
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-xl">
            <Mail size={20} className="text-gray-600" />
          </button>
          
          <button 
            onClick={openProfileModal}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold hover:scale-105 transition-transform"
          >
            {getUserInitials()}
          </button>
        </div>
      </header>
      
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        user={user} 
      />
      
      <TaskModal 
        isOpen={showTaskModal} 
        onClose={() => {
          setShowTaskModal(false);
          setSelectedDate(null);
        }}
        defaultDate={selectedDate}
        onTaskCreated={(newTask) => {
          // You can handle the new task here, maybe refresh the task list
          console.log('New task created:', newTask);
          // Dispatch event to refresh task lists
          window.dispatchEvent(new CustomEvent('taskCreated', { detail: newTask }));
        }}
      />

      <Toaster position="top-right" />
    </>
  );
}

export default Navbar;
