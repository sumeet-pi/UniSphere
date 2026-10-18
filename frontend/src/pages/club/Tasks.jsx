import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getStoredTasks, 
  addStoredTask, 
  updateStoredTask, 
  deleteStoredTask, 
  clubs 
} from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X, 
  Calendar, 
  User, 
  AlertCircle, 
  Search, 
  Filter, 
  LayoutList, 
  Kanban, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  Flag, 
  Sparkles,
  ShieldCheck,
  Check,
  ChevronRight,
  RefreshCw,
  FolderKanban
} from 'lucide-react';

export function Tasks() {
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const club = clubs.find(c => c.id === clubId) || clubs[0];

  const [tasks, setTasks] = useState(() => getStoredTasks(club.id));
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const coordinatorAssignee = user?.name ? `${user.name} (${user.clubRole || 'Club Coordinator'})` : 'Dr. Vijay Samyal (Club Coordinator)';

  // Form state for creating a new task
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'Logistics',
    priority: 'High',
    assignee: coordinatorAssignee,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'pending'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const reloadTasks = () => {
    setTasks(getStoredTasks(club.id));
  };

  // Toggle task status between completed and pending
  const toggleTask = (id) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const newStatus = target.status === 'completed' ? 'pending' : 'completed';
    updateStoredTask(id, { status: newStatus });
    reloadTasks();
    showToast(newStatus === 'completed' ? '✓ Task marked as completed!' : 'Task re-opened to pending.');
  };

  // Set explicit status (e.g. pending, in_progress, completed)
  const setTaskStatus = (id, newStatus) => {
    updateStoredTask(id, { status: newStatus });
    reloadTasks();
    showToast(`Task moved to ${newStatus === 'in_progress' ? 'In Progress' : newStatus === 'completed' ? 'Completed' : 'To-Do'}.`);
  };

  // Delete task
  const deleteTask = (id, title) => {
    if (window.confirm(`Are you sure you want to delete task: "${title}"?`)) {
      deleteStoredTask(id);
      reloadTasks();
      showToast('Task removed from checklist.');
    }
  };

  // Create task
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    addStoredTask({
      clubId: club.id,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      category: taskForm.category,
      priority: taskForm.priority,
      assignee: taskForm.assignee,
      dueDate: taskForm.dueDate,
      status: taskForm.status
    });

    reloadTasks();
    setTaskForm({
      title: '',
      description: '',
      category: 'Logistics',
      priority: 'High',
      assignee: coordinatorAssignee,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'pending'
    });
    setShowAddModal(false);
    showToast('✓ New coordinator task created!');
  };

  // Edit task submission
  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    updateStoredTask(editingTask.id, {
      title: editingTask.title.trim(),
      description: editingTask.description?.trim() || '',
      category: editingTask.category,
      priority: editingTask.priority,
      assignee: editingTask.assignee,
      dueDate: editingTask.dueDate,
      status: editingTask.status
    });

    reloadTasks();
    setEditingTask(null);
    showToast('✓ Task updated successfully!');
  };

  // Bulk actions
  const handleMarkAllCompleted = () => {
    if (window.confirm('Mark all active coordinator tasks as completed?')) {
      tasks.forEach(t => updateStoredTask(t.id, { status: 'completed' }));
      reloadTasks();
      showToast('All tasks marked completed!');
    }
  };

  const handleClearCompleted = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    if (!completedTasks.length) {
      showToast('No completed tasks to clear.');
      return;
    }
    if (window.confirm(`Delete all ${completedTasks.length} completed tasks?`)) {
      completedTasks.forEach(t => deleteStoredTask(t.id));
      reloadTasks();
      showToast(`Cleared ${completedTasks.length} completed tasks.`);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      (t.title || '').toLowerCase().includes(q) || 
      (t.description || '').toLowerCase().includes(q) ||
      (t.assignee || '').toLowerCase().includes(q);

    const matchesStatus = 
      filterStatus === 'All' ? true : 
      filterStatus === 'Pending' ? t.status === 'pending' : 
      filterStatus === 'In Progress' ? t.status === 'in_progress' : 
      t.status === 'completed';

    const matchesPriority = 
      filterPriority === 'All' ? true : 
      t.priority === filterPriority;

    const matchesCategory = 
      filterCategory === 'All' ? true : 
      t.category === filterCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Calculate statistics
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const progressPercent = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const categoriesList = ['Logistics', 'Finance', 'Publicity', 'Technical', 'Permissions', 'General'];

  // Priority color helper
  const getPriorityBadge = (priority) => {
    if (priority === 'High') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> High Priority
        </span>
      );
    }
    if (priority === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Low
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-950 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 border border-gray-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <CheckSquare className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {club.name} • Operational Taskboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Coordinator Checklist & Tasks
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Shared operational workflow for Faculty Advisors and Student Leads. Manage event logistics, institutional budget clearances, technical arenas, and security gatepasses in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="bg-white/15 p-1 rounded-xl flex items-center gap-1 backdrop-blur-md border border-white/20">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" /> List
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" /> Board
              </button>
            </div>

            <Button 
              onClick={() => setShowAddModal(true)} 
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md gap-2 border-0"
            >
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Progress & Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Progress Card (Spans 2 cols on desktop) */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border-indigo-100 hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Completion Health</span>
                <span className="text-xl font-black text-indigo-900">{progressPercent}%</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {completedTasks.length} of {tasks.length} responsibilities fulfilled
              </p>
            </div>
            <div className="w-full bg-indigo-200/60 h-3 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* To-Do */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">To-Do Queue</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{pendingTasks.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Tasks awaiting action</p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">In Progress</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{inProgressTasks.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Under active execution</p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Fulfilled
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Completed</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{completedTasks.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Successfully concluded</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <Card>
        <CardHeader className="bg-gray-50/70 p-4 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search tasks, assignees, or keywords..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white shadow-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Pills */}
            <div className="flex items-center bg-gray-200/70 p-1 rounded-xl text-xs font-semibold">
              {['All', 'Pending', 'In Progress', 'Completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterStatus === st 
                      ? 'bg-white text-blue-700 shadow-xs font-bold' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {st} {st === 'All' ? `(${tasks.length})` : st === 'Pending' ? `(${pendingTasks.length})` : st === 'In Progress' ? `(${inProgressTasks.length})` : `(${completedTasks.length})`}
                </button>
              ))}
            </div>

            {/* Priority Selector */}
            <select 
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-white shadow-xs"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🟢 Low Priority</option>
            </select>

            {/* Category Selector */}
            <select 
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-white shadow-xs"
            >
              <option value="All">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Bulk Actions Dropdown / Buttons */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllCompleted}
                title="Mark all active tasks as complete"
                className="text-xs text-indigo-700 hover:bg-indigo-50"
              >
                Mark All Done
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearCompleted}
                title="Clear completed tasks"
                className="text-xs text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                Clear Done
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <Card 
              key={task.id} 
              className={`hover:shadow-md transition-all border ${
                task.status === 'completed' 
                  ? 'bg-gray-50/70 border-gray-200/80 opacity-80' 
                  : task.priority === 'High' 
                    ? 'border-red-200/80 bg-white shadow-xs' 
                    : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Checkbox and Main Information */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <input 
                    type="checkbox" 
                    checked={task.status === 'completed'} 
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-bold text-base ${
                        task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      {getPriorityBadge(task.priority)}
                      <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                        {task.category || 'General'}
                      </span>
                    </div>

                    {task.description && (
                      <p className={`text-xs leading-relaxed ${
                        task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                    )}

                    {/* Meta row: Assignee, Due Date */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-gray-700">{task.assignee || coordinatorAssignee}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Due: <strong>{task.dueDate || '2026-10-25'}</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher & Action Controls */}
                <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Status Dropdown */}
                  <select 
                    value={task.status}
                    onChange={e => setTaskStatus(task.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  >
                    <option value="pending">⏳ To-Do</option>
                    <option value="in_progress">⚙️ In Progress</option>
                    <option value="completed">✓ Completed</option>
                  </select>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditingTask(task)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="Edit task details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteTask(task.id, task.title)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 text-lg mb-1">No tasks match your filter!</h3>
              <p className="text-gray-500 text-sm">Everything is organized and up to date.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterPriority('All'); setFilterCategory('All'); }}
                className="mt-4 text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: To-Do / Pending */}
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/70 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="font-bold text-gray-900 text-sm">To-Do Queue</h3>
              </div>
              <span className="text-xs font-bold bg-white text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                {pendingTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
              {pendingTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {task.category || 'General'}
                    </span>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                  )}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate max-w-[120px]" title={task.assignee}>{task.assignee}</span>
                    <button 
                      onClick={() => setTaskStatus(task.id, 'in_progress')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
                    >
                      Start <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {pendingTasks.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs">
                  No tasks waiting in To-Do.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200/70 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-blue-200/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <h3 className="font-bold text-gray-900 text-sm">In Progress</h3>
              </div>
              <span className="text-xs font-bold bg-white text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
              {inProgressTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {task.category || 'General'}
                    </span>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                  )}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <button 
                      onClick={() => setTaskStatus(task.id, 'pending')}
                      className="text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <button 
                      onClick={() => setTaskStatus(task.id, 'completed')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
                    >
                      Done <Check className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {inProgressTasks.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs">
                  No tasks currently active.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/70 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 className="font-bold text-gray-900 text-sm">Completed</h3>
              </div>
              <span className="text-xs font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                {completedTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
              {completedTasks.map(task => (
                <div key={task.id} className="bg-white/80 p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      ✓ Fulfilled
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id, task.title)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-gray-500 line-through text-sm">{task.title}</h4>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate max-w-[120px]">{task.assignee}</span>
                    <button 
                      onClick={() => setTaskStatus(task.id, 'pending')}
                      className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-open
                    </button>
                  </div>
                </div>
              ))}

              {completedTasks.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs">
                  No completed tasks yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-5 h-5" />
                <h3 className="font-bold text-lg">Add Coordinator Task</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <Input 
                label="Task Title / Responsibility" 
                placeholder="e.g. Verify dual wireless microphones & sound console in Main Aud 3"
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                required 
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Detailed Notes / Instructions
                </label>
                <textarea 
                  rows="3"
                  placeholder="Outline vendor contacts, invoice amounts, required approval stamps, or testing protocols..."
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select 
                    value={taskForm.category}
                    onChange={e => setTaskForm({ ...taskForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-medium"
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select 
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-medium"
                  >
                    <option value="High">🔴 High Priority (Urgent)</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Assigned Lead
                  </label>
                  <select 
                    value={taskForm.assignee}
                    onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value={coordinatorAssignee}>{coordinatorAssignee}</option>
                    <option>Dr. Kulvir Singh (Faculty Advisor)</option>
                    <option>Manav Sharma (Student Coordinator)</option>
                    <option>Aarav Patel (Technical Lead)</option>
                    <option>Neha Gupta (Event Manager)</option>
                    <option>General Coordinator Team</option>
                  </select>
                </div>

                <Input 
                  label="Target Due Date" 
                  type="date"
                  value={taskForm.dueDate}
                  onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2.5">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Create Responsibility
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5" />
                <h3 className="font-bold text-lg">Edit Coordinator Task</h3>
              </div>
              <button 
                onClick={() => setEditingTask(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="p-6 space-y-4">
              <Input 
                label="Task Title / Responsibility" 
                value={editingTask.title}
                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                required 
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Detailed Notes / Instructions
                </label>
                <textarea 
                  rows="3"
                  value={editingTask.description || ''}
                  onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select 
                    value={editingTask.category || 'General'}
                    onChange={e => setEditingTask({ ...editingTask, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium"
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select 
                    value={editingTask.priority || 'Medium'}
                    onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium"
                  >
                    <option value="High">🔴 High Priority (Urgent)</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Assigned Lead
                  </label>
                  <select 
                    value={editingTask.assignee || 'General Coordinator Team'}
                    onChange={e => setEditingTask({ ...editingTask, assignee: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value={coordinatorAssignee}>{coordinatorAssignee}</option>
                    <option>Dr. Kulvir Singh (Faculty Advisor)</option>
                    <option>Manav Sharma (Student Coordinator)</option>
                    <option>Aarav Patel (Technical Lead)</option>
                    <option>Neha Gupta (Event Manager)</option>
                    <option>General Coordinator Team</option>
                  </select>
                </div>

                <Input 
                  label="Target Due Date" 
                  type="date"
                  value={editingTask.dueDate || ''}
                  onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Execution Status
                </label>
                <select 
                  value={editingTask.status || 'pending'}
                  onChange={e => setEditingTask({ ...editingTask, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-semibold"
                >
                  <option value="pending">⏳ To-Do (Pending)</option>
                  <option value="in_progress">⚙️ In Progress</option>
                  <option value="completed">✓ Fulfilled (Completed)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2.5">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
