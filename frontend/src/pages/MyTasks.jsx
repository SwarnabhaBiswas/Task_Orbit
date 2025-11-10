import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
import { api } from "../services/api";
import { MoreHorizontal, Calendar, Clock, User, Play, Pause, Trash2, ChevronDown } from "lucide-react";

function StatusBadge({ status }) {
  const styles = {
    'In progress': 'bg-blue-100 text-blue-700 border border-blue-200',
    'Not started': 'bg-slate-100 text-slate-700 border border-slate-200',
    'Done': 'bg-green-100 text-green-700 border border-green-200',
    'Review': 'bg-purple-100 text-purple-700 border border-purple-200'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    'High': 'bg-red-100 text-red-700 border border-red-200',
    'Medium': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'Low': 'bg-green-100 text-green-700 border border-green-200'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[priority] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
      {priority}
    </span>
  );
}

function UserAvatar({ user, size = "w-8 h-8" }) {
  if (!user) return <div className={`${size} bg-slate-200 rounded-full`}></div>;
  const initials = user.username ? user.username.substring(0, 2).toUpperCase() : 'U';
  return (
    <div className={`${size} bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold`}>
      {initials}
    </div>
  );
}

function TaskRow({ task, onStatusChange, onTimerToggle, onDelete }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.15 }}
      className={`flex items-center py-4 px-6 border-b border-slate-100 hover:bg-slate-50 transition-all ${task.status === 'Done' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center space-x-4 flex-1">
        <input 
          type="checkbox" 
          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          checked={task.status === 'Done'}
          onChange={(e) => onStatusChange(task._id, e.target.checked ? 'Done' : 'Not started')}
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-500 truncate mt-1">{task.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4 ml-4">
        <div className="text-xs text-blue-600 font-medium px-3 py-1 bg-blue-50 rounded-full min-w-[80px] text-center">
          {task.dueText}
        </div>
        
        {/* Status Dropdown */}
        <div className="min-w-[100px]">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="text-xs px-3 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 w-full"
            style={{
              backgroundColor: task.status === 'Done' ? '#dcfce7' : 
                             task.status === 'In progress' ? '#dbeafe' :
                             task.status === 'Review' ? '#f3e8ff' : '#f1f5f9',
              color: task.status === 'Done' ? '#166534' : 
                     task.status === 'In progress' ? '#1e40af' :
                     task.status === 'Review' ? '#7c3aed' : '#475569'
            }}
          >
            <option value="Not started">Not started</option>
            <option value="In progress">In progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>
        </div>
        
        <div className="min-w-[80px] text-center">
          <PriorityBadge priority={task.priority} />
        </div>
        
        <div className="text-xs font-medium text-slate-600 min-w-[100px] text-center">
          {task.assigneeTeam?.name || 'Personal'}
        </div>
        
        <div className="flex items-center space-x-2">
          <UserAvatar user={task.assigneeUser} />
          <button
            onClick={() => onTimerToggle(task._id, !task.isRunning)}
            className={`p-1 rounded transition-all duration-200 ${
              task.isRunning ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={task.isRunning ? 'Stop timer' : 'Start timer'}
          >
            {task.isRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1 rounded transition-all duration-200 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      let tasksData;
      if (selectedTeam) {
        const { data } = await api.get(`/api/teams/${selectedTeam._id}/tasks`);
        tasksData = data;
      } else {
        const { data } = await api.get('/api/tasks');
        tasksData = data;
      }
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    }
  };

  useEffect(() => {
    // Fetch teams
    api.get('/api/teams')
      .then(({ data }) => setTeams(data))
      .catch(() => setTeams([]));
  }, []);

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, [selectedTeam]);
  
  useEffect(() => {
    const handler = (e) => {
      const newTask = e.detail;
      if (newTask) {
        setTasks(prev => [newTask, ...prev]);
      }
    };
    window.addEventListener('taskCreated', handler);
    return () => window.removeEventListener('taskCreated', handler);
  }, []);

  const groupedByDate = useMemo(() => {
    const groups = {
      'Today': [],
      'Tomorrow': [],
      'This week': [],
      'Later': []
    };
    
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    
    tasks.forEach(task => {
      const dueText = task.dueText || 'Today';
      if (groups[dueText]) {
        groups[dueText].push(task);
      } else {
        groups['Later'].push(task);
      }
    });
    
    // Sort each group by priority
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 0;
        const priorityB = priorityOrder[b.priority] || 0;
        return priorityB - priorityA;
      });
    });
    
    return groups;
  }, [tasks]);
  
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(task => 
        task._id === taskId ? data : task
      ));
      
      if (newStatus === 'Done') {
        toast.success('Task completed! 🎉');
      } else {
        toast.success(`Task status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
    }
  };
  
  const handleTimerToggle = async (taskId, isRunning) => {
    try {
      const { data } = await api.put(`/api/tasks/${taskId}`, { isRunning });
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, isRunning: data.isRunning || isRunning } : task
      ));
      
      // Dispatch event to update Dashboard timer section
      window.dispatchEvent(new CustomEvent('taskTimerToggled', { 
        detail: { taskId, isRunning: data.isRunning || isRunning, task: data } 
      }));
      
      toast.success(isRunning ? 'Timer started!' : 'Timer stopped');
    } catch (error) {
      console.error('Failed to toggle timer:', error);
      toast.error('Failed to toggle timer');
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-slate-50 min-h-screen"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Team Selection Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="relative inline-block">
          <button
            onClick={() => setShowTeamDropdown(!showTeamDropdown)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-700">
              {selectedTeam ? selectedTeam.name : 'All Teams'}
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          
          <AnimatePresence>
            {showTeamDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-10"
              >
                <div className="p-1">
                  <button
                    onClick={() => {
                      setSelectedTeam(null);
                      setShowTeamDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    All Teams
                  </button>
                  {teams.map((team) => (
                    <button
                      key={team._id}
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowTeamDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {team.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            {selectedTeam ? `${selectedTeam.name} Tasks` : 'All Tasks'} ({tasks.length.toString().padStart(2, '0')})
          </h1>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreHorizontal size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Table Header */}
        <div className="flex items-center py-4 px-6 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
          <div className="flex-1">Task Name</div>
          <div className="flex items-center space-x-4 ml-4">
            <div className="min-w-[80px] text-center">Due Date</div>
            <div className="min-w-[100px] text-center">Status</div>
            <div className="min-w-[80px] text-center">Priority</div>
            <div className="min-w-[100px] text-center">Team</div>
            <div className="min-w-[100px] text-center">Actions</div>
          </div>
        </div>

        {/* Task Groups */}
        <div className="max-h-[70vh] overflow-y-auto">
          <AnimatePresence>
            {Object.entries(groupedByDate).map(([dateGroup, groupTasks]) => (
              groupTasks.length > 0 && (
                <motion.div 
                  key={dateGroup}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Section Header */}
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 sticky top-0 z-10">
                    <h3 className="text-sm font-semibold text-slate-700">{dateGroup} ({groupTasks.length})</h3>
                  </div>
                  
                  {/* Tasks */}
                  <div>
                    <AnimatePresence>
                      {groupTasks.map((task) => (
                        <TaskRow 
                          key={task._id} 
                          task={task} 
                          onStatusChange={handleTaskStatusChange}
                          onTimerToggle={handleTimerToggle}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>

        {tasks.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
            <p className="text-slate-500">
              {selectedTeam ? `No tasks found for ${selectedTeam.name}.` : 'Create your first task to get started.'}
            </p>
          </motion.div>
        )}
      </motion.div>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '12px 16px',
          },
        }}
      />
    </motion.div>
  );
}

export default MyTasks;