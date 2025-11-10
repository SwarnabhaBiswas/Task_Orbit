import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Bell, MessageSquare, CheckCircle, Play, User, Send, X } from "lucide-react";
import toast from 'react-hot-toast';

function NotificationItem({ notification, onMarkAsRead }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'task_assigned':
        return <User size={16} className="text-blue-500" />;
      case 'task_completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'task_started':
        return <Play size={16} className="text-orange-500" />;
      case 'custom_post':
        return <MessageSquare size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`flex items-start space-x-4 p-4 rounded-xl border transition-colors ${
      notification.isRead ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <p className="text-sm text-slate-900">
            {notification.message}
          </p>
        </div>
        
        {/* Show author info for custom posts */}
        {notification.type === 'custom_post' && notification.user && (
          <p className="text-xs text-slate-600 mb-1">
            <span className="font-medium">Posted by:</span> {notification.user.fullName || notification.user.username}
            {notification.team && (
              <span> • <span className="font-medium">Team:</span> {notification.team.name}</span>
            )}
            {!notification.team && <span> • <span className="font-medium">All teams</span></span>}
          </p>
        )}
        
        {/* Show task info for task-related notifications */}
        {notification.task && (
          <p className="text-xs text-slate-500 mb-1">
            <span className="font-medium">Task:</span> {notification.task.title}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {getTimeAgo(notification.createdAt)}
          </span>
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification._id)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostModal({ isOpen, onClose, onPostCreated }) {
  const [message, setMessage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/api/teams').then(({ data }) => setTeams(data)).catch(() => setTeams([]));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/api/notifications', {
        message,
        team: selectedTeam || null
      });
      
      const teamName = teams.find(t => t._id === selectedTeam)?.name;
      const targetText = teamName ? `to ${teamName} team` : 'to all teams';
      
      setMessage('');
      setSelectedTeam('');
      onClose();
      if (onPostCreated) onPostCreated();
      
      toast.success(`Post shared ${targetText} successfully! 📝`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create post');
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={20} className="text-gray-500" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Create Post</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="What's happening?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Share with team (optional)</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All teams</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition flex items-center justify-center space-x-2"
          >
            <Send size={16} />
            <span>{loading ? 'Posting...' : 'Post'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/api/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handlePostCreated = () => {
    fetchNotifications(); // Refresh notifications
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">Stay updated with your team's activities</p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700"
          >
            <MessageSquare size={18} />
            <span>New Post</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications</h3>
              <p className="text-slate-500">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>

        {/* Post Modal */}
        <PostModal
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </div>
  );
}