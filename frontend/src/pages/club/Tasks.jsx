import React, { useState } from 'react';
import { studentTasks as initialTasks } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { CheckSquare, Plus, Trash2, CheckCircle2, Clock, X } from 'lucide-react';

export function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Dr. Sharma & Aarav');

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } 
        : t
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `t${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'pending',
      assignee: newTaskAssignee
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return t.status === 'pending';
    if (filter === 'Completed') return t.status === 'completed';
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coordinator Checklist & Tasks</h1>
          <p className="text-gray-500">Shared task management between Faculty Advisors & Student Coordinators</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4"/> Add Task
        </Button>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
            <div>
              <p className="font-bold text-gray-900 text-lg">Task Completion Progress</p>
              <p className="text-xs text-gray-600">{completedCount} of {tasks.length} responsibilities fulfilled</p>
            </div>
            <span className="text-2xl font-black text-blue-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-blue-200/60 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {['All', 'Pending', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab ? 'bg-blue-600 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <Card key={task.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <input 
                  type="checkbox" 
                  checked={task.status === 'completed'} 
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className={`font-semibold text-base truncate ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Assigned to: {task.assignee || 'Club Coordinator'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant={task.status === 'completed' ? 'green' : 'yellow'}>
                  {task.status === 'completed' ? 'Done' : 'In Progress'}
                </Badge>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg mb-1">No tasks in this category!</h3>
            <p className="text-gray-500 text-sm">Everything is running smoothly.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Add Coordinator Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <Input 
                label="Task Description" 
                placeholder="e.g. Confirm audio/visual equipment with auditorium" 
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                required 
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select 
                  value={newTaskAssignee}
                  onChange={e => setNewTaskAssignee(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Dr. Sharma (Faculty Head)</option>
                  <option>Aarav Kumar (Student Coordinator)</option>
                  <option>Priya Singh (Technical Lead)</option>
                  <option>Rahul Verma (Event Manager)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
