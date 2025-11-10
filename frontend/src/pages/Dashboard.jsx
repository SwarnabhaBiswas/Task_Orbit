import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
import { api } from "../services/api";
import { ChevronLeft, ChevronRight, Play, Pause, MoreHorizontal, ChevronDown, Check, X, Trash2, Plus } from "lucide-react";

function CalendarCard({ onDateClick }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  
  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1; // Monday = 0
    const numDays = new Date(year, month + 1, 0).getDate();
    const arr = Array(startDay).fill(null).concat([...Array(numDays)].map((_, i) => i + 1));
    return arr;
  }, [month, year]);
  
  // Generate calendar with events
  const hasEvent = (day) => {
    // Mock events for demo
    return [3, 7, 15, 22, 28].includes(day);
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-1">
          <button 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMonth(m => (m === 0 ? (setYear(y=>y-1), 11) : m-1))}
          >
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <button 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMonth(m => (m === 11 ? (setYear(y=>y+1), 0) : m+1))}
          >
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
          <div key={d} className="text-slate-400 font-medium text-center py-3">{d}</div>
        ))}
        {days.map((d, i) => {
          const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
          const hasEventToday = d && hasEvent(d);
          return (
            <div key={i} className="relative">
              <div 
                className={`h-10 flex items-center justify-center text-sm font-medium cursor-pointer transition-all ${
                  isToday 
                    ? 'bg-blue-500 text-white rounded-lg shadow-md' 
                    : d ? 'text-slate-700 hover:bg-slate-100 rounded-lg' : ''
                }`}
                onClick={() => d && onDateClick && onDateClick(new Date(year, month, d))}
              >
                {d || ''}
              </div>
              {hasEventToday && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

function Timer({ initialTime, isRunning, onToggle }) {
  const [time, setTime] = useState(initialTime || 0);
  const [running, setRunning] = useState(isRunning || false);
  
  useEffect(() => {
    let interval = null;
    if (running) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!running && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running, time]);
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };
  
  const handleToggle = () => {
    setRunning(!running);
    if (onToggle) onToggle(!running);
  };
  
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-mono text-slate-700 min-w-[80px]">{formatTime(time)}</span>
      <button 
        onClick={handleToggle}
        className={`p-2 rounded-full transition-all ${
          running ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {running ? <Pause size={14} /> : <Play size={14} />}
      </button>
    </div>
  );
}

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [trackingTasks, setTrackingTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  
  useEffect(() => {
    // Fetch teams
    api.get('/api/teams')
      .then(({ data }) => {
        setTeams(data);
        // Don't auto-select a team, let user choose or show all tasks by default
      })
      .catch((error) => {
        console.error('Failed to fetch teams:', error);
        setTeams([]);
      });
  }, []);
  
  const fetchTasks = async () => {
    try {
      let data;
      if (selectedTeam) {
        const response = await api.get(`/api/teams/${selectedTeam._id}/tasks`);
        data = response.data;
      } else {
        const response = await api.get('/api/tasks');
        data = response.data;
      }
      
      // Ensure data is always an array
      const tasksArray = Array.isArray(data) ? data : [];
      
      // Only update tasks if we have data or if this is an intentional clear
      if (tasksArray.length > 0 || selectedTeam !== null) {
        setTasks(tasksArray);
      }
      
      // Update tracking tasks from running tasks
      const runningTasks = tasksArray
        .filter(task => task && task.isRunning)
        .map(task => ({
          id: task._id,
          name: task.title,
          time: (task.timeTracked || 0) * 60, // convert minutes to seconds
          isRunning: task.isRunning,
          taskData: task
        }));
      
      setTrackingTasks(runningTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
      setTrackingTasks([]);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Fetch when team selection changes (but not on initial mount)
  useEffect(() => {
    if (selectedTeam !== null) { // Only refetch when team is explicitly selected
      fetchTasks();
    }
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
  
  // Timer toggle event listener - removed dependency on tasks to prevent loops
  useEffect(() => {
    const handler = (e) => {
      const { taskId, isRunning, task } = e.detail;
      // Update tasks state
      setTasks(prev => 
        prev.map(t => 
          t._id === taskId ? { ...t, isRunning } : t
        )
      );
      
      if (isRunning) {
        // Add to tracking tasks
        if (task) {
          setTrackingTasks(prev => {
            const updatedTasks = prev.map(t => ({ ...t, isRunning: false }));
            const existing = updatedTasks.find(t => t.id === taskId);
            
            if (existing) {
              return updatedTasks.map(t => 
                t.id === taskId ? { ...t, isRunning: true } : t
              );
            } else {
              return [...updatedTasks, {
                id: taskId,
                name: task.title,
                time: (task.timeTracked || 0) * 60,
                isRunning: true,
                taskData: task
              }];
            }
          });
        }
      } else {
        // Stop timer
        setTrackingTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, isRunning: false } : t
        ));
      }
    };
    
    window.addEventListener('taskTimerToggled', handler);
    return () => window.removeEventListener('taskTimerToggled', handler);
  }, []); // Removed tasks dependency to prevent loops

  const todaysTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = tasks.filter(task => {
      if (!task) return false;
      
      // Check if task is due today based on dueText field
      if (task.dueText === 'Today') {
        return true;
      }
      
      // Also check actual dueDate if it exists and matches today
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const isToday = dueDate.getTime() === today.getTime();
        if (isToday) {
          return true;
        }
      }
      
      return false;
    });

    // Sort by priority: High > Medium > Low
    return filtered.sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }, [tasks]);
  
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(task => 
        task._id === taskId ? data : task
      ));
      
      // Remove completed tasks from timer
      if (newStatus === 'Done') {
        setTrackingTasks(prev => prev.filter(t => t.id !== taskId));
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
      
      // Update tasks state with the updated task data
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, isRunning: data.isRunning || isRunning } : task
      ));
      
      if (isRunning) {
        // Start timer - find the current task
        const currentTask = tasks.find(t => t._id === taskId);
        if (!currentTask) {
          console.error('Task not found for timer:', taskId);
          return;
        }
        
        setTrackingTasks(prev => {
          // Stop all other timers
          const updatedTasks = prev.map(t => ({ ...t, isRunning: false }));
          
          const existing = updatedTasks.find(t => t.id === taskId);
          if (existing) {
            return updatedTasks.map(t => 
              t.id === taskId ? { ...t, isRunning: true } : t
            );
          } else {
            // Add new task to tracking
            const newTrackingTask = {
              id: taskId,
              name: currentTask.title,
              time: (currentTask.timeTracked || 0) * 60, // convert minutes to seconds
              isRunning: true,
              taskData: currentTask
            };
            return [...updatedTasks, newTrackingTask];
          }
        });
        
        // Dispatch event for cross-component sync
        window.dispatchEvent(new CustomEvent('taskTimerToggled', { 
          detail: { taskId, isRunning: true, task: currentTask } 
        }));
        
        toast.success('Timer started!');
      } else {
        // Stop timer but keep in tracking list
        setTrackingTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, isRunning: false } : t
        ));
        
        // Dispatch event for cross-component sync
        window.dispatchEvent(new CustomEvent('taskTimerToggled', { 
          detail: { taskId, isRunning: false } 
        }));
        
        toast.success('Timer stopped');
      }
    } catch (error) {
      console.error('Failed to toggle timer:', error);
      toast.error('Failed to toggle timer');
    }
  };
  
  const removeFromTimer = (taskId) => {
    setTrackingTasks(prev => prev.filter(t => t.id !== taskId));
  };
  
  const handleCalendarDateClick = (date) => {
    setSelectedDate(date);
    // We'll trigger the navbar task modal by dispatching a custom event
    window.dispatchEvent(new CustomEvent('openTaskModal', { detail: { selectedDate: date } }));
  };
  
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      setTrackingTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Team Selection Header */}
      <div className="mb-6">
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
          
          {showTeamDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-10">
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
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left Column - Calendar and Timer */}
        <div className="col-span-4 space-y-6">
          {/* Calendar */}
          <CalendarCard onDateClick={handleCalendarDateClick} />
          
          {/* Timer Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">My tracking</h3>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreHorizontal size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {trackingTasks.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No active timers</p>
              ) : (
                trackingTasks.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${
                        item.isRunning ? 'bg-blue-500' : 'bg-slate-300'
                      }`}></div>
                      <span className="text-sm font-medium text-slate-900 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Timer 
                        initialTime={item.time} 
                        isRunning={item.isRunning}
                        onToggle={(running) => handleTimerToggle(item.id, running)}
                      />
                      <button 
                        onClick={() => removeFromTimer(item.id)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        <X size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tasks */}
        <div className="col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Today's Tasks ({todaysTasks.length.toString().padStart(2, '0')})
            </h3>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreHorizontal size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ scrollBehavior: 'smooth' }}>
            {todaysTasks.map((task, index) => (
  <motion.div
    key={task._id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.1 }}
    className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl border border-slate-100 transition-all duration-200 hover:shadow-sm"
  >
    <div className="flex items-center space-x-4 flex-1">
      <input 
        type="checkbox" 
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        checked={task.status === 'Done'}
        onChange={(e) => handleTaskStatusChange(task._id, e.target.checked ? 'Done' : 'Not started')}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          task.status === 'Done' ? 'text-slate-500 line-through' : 'text-slate-900'
        }`}>{task.title}</p>
        {task.description && (
          <p className="text-xs text-slate-500 truncate">{task.description}</p>
        )}
      </div>
      <div className={`text-xs font-medium px-2 py-1 rounded ${
        task.priority === 'High' ? 'bg-red-100 text-red-700' :
        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
        'bg-green-100 text-green-700'
      }`}>
        {task.priority}
      </div>
      <div className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-50 rounded">
        {task.dueText}
      </div>
      
      <div className="relative">
        <select
          value={task.status}
          onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
          className="text-xs px-3 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all"
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
      
      <div className="flex items-center space-x-2">
        <UserAvatar user={task.assigneeUser} size="w-7 h-7" />
        <button
          onClick={() => handleTimerToggle(task._id, !task.isRunning)}
          className={`p-1 rounded transition-all duration-200 ${
            task.isRunning ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {task.isRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={() => handleDeleteTask(task._id)}
          className="p-1 rounded transition-all duration-200 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </motion.div>
))}

{todaysTasks.length === 0 && (
  <div className="flex items-center justify-center h-32">
    <p className="text-slate-500">
      No tasks due today. Great job staying on top of things! 🎉
    </p>
  </div>
)}

          </div>
        </div>
      </div>
      
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
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default Dashboard;
