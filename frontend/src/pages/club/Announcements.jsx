import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getStoredAnnouncements, 
  addStoredAnnouncement, 
  updateStoredAnnouncement, 
  deleteStoredAnnouncement, 
  clubs 
} from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Search, 
  Calendar, 
  User, 
  Users, 
  AlertCircle, 
  Tag, 
  X, 
  Radio, 
  Sparkles,
  Share2,
  Copy,
  ArrowRight,
  Filter,
  Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Announcements() {
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const club = clubs.find(c => c.id === clubId) || clubs[0];

  const [announcementsList, setAnnouncementsList] = useState(() => getStoredAnnouncements(club.id));
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Form state for creating a new announcement
  const [formData, setFormData] = useState({
    title: '',
    category: 'Event Alert',
    priority: 'Normal',
    audience: 'All Campus Students',
    author: user?.name ? `${user.name} (${user?.clubRole || 'Club Coordinator'})` : 'Dr. Vijay Samyal (Club Coordinator)',
    content: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const reloadAnnouncements = () => {
    setAnnouncementsList(getStoredAnnouncements(club.id));
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    addStoredAnnouncement({
      clubId: club.id,
      title: formData.title.trim(),
      category: formData.category,
      priority: formData.priority,
      audience: formData.audience,
      author: formData.author,
      content: formData.content.trim(),
      date: new Date().toISOString().split('T')[0]
    });

    reloadAnnouncements();
    setFormData({
      title: '',
      category: 'Event Alert',
      priority: 'Normal',
      audience: 'All Campus Students',
      author: user?.name ? `${user.name} (${user?.clubRole || 'Club Coordinator'})` : 'Dr. Vijay Samyal (Club Coordinator)',
      content: ''
    });

    setShowForm(false);
    showToast('✓ Announcement broadcasted live across the campus feed!');
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingAnnouncement || !editingAnnouncement.title.trim() || !editingAnnouncement.content.trim()) return;

    updateStoredAnnouncement(editingAnnouncement.id, {
      title: editingAnnouncement.title.trim(),
      category: editingAnnouncement.category,
      priority: editingAnnouncement.priority,
      audience: editingAnnouncement.audience,
      author: editingAnnouncement.author,
      content: editingAnnouncement.content.trim()
    });

    reloadAnnouncements();
    setEditingAnnouncement(null);
    showToast('✓ Announcement updated successfully!');
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete announcement: "${title}"?`)) {
      deleteStoredAnnouncement(id);
      reloadAnnouncements();
      showToast('Announcement removed from feed.');
    }
  };

  const handleCopyText = (announcement) => {
    navigator.clipboard?.writeText(`${announcement.title}\n\n${announcement.content}\n\nPublished by ${club.name} on UniSphere`);
    showToast('Copied announcement text to clipboard!');
  };

  // Filter announcements
  const filteredList = announcementsList.filter(a => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      (a.title || '').toLowerCase().includes(q) || 
      (a.content || '').toLowerCase().includes(q) ||
      (a.author || '').toLowerCase().includes(q);

    const matchesCategory = 
      categoryFilter === 'All' ? true : 
      a.category === categoryFilter;

    const matchesPriority = 
      priorityFilter === 'All' ? true : 
      a.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const categories = ['Event Alert', 'Recruitment', 'Workshop', 'General Notice'];

  const getCategoryBadge = (category) => {
    if (category === 'Event Alert') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <Flame className="w-3 h-3 text-blue-600" /> Event Alert
        </span>
      );
    }
    if (category === 'Recruitment') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          <Users className="w-3 h-3 text-purple-600" /> Leadership Call
        </span>
      );
    }
    if (category === 'Workshop') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <Sparkles className="w-3 h-3 text-amber-600" /> Workshop & Tech
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
        <Tag className="w-3 h-3 text-gray-500" /> Notice
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
          <Megaphone className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {club.name} • Public Campus Dispatch
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Club Announcements & Notices
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Broadcast critical contest problem statements, recruitment drives, workshop schedules, and meeting guidelines directly to the campus student body and club members.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md gap-2 border-0"
            >
              <Plus className="w-4 h-4" /> New Announcement
            </Button>
            <Link to={`/explore/${club.id}`} target="_blank">
              <Button variant="outline" className="text-white border-white/40 hover:bg-white/10 gap-2">
                Public Feed <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Roster & Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Megaphone className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Broadcasts
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Bulletins</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{announcementsList.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Published notices</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                Urgent
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">High Priority Alerts</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {announcementsList.filter(a => a.priority === 'High').length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Flagged for immediate attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                Members
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Member Broadcasts</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {announcementsList.filter(a => a.audience === 'Club Members Only').length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Targeted exclusively to members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live Reach
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Campus Channel</p>
            <p className="text-2xl font-black text-gray-900 mt-1">100%</p>
            <p className="text-xs text-gray-400 mt-0.5">Delivered to UniSphere intranet</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardHeader className="bg-gray-50/70 p-4 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search announcements, tags, or authors..." 
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

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center bg-gray-200/70 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setCategoryFilter('All')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  categoryFilter === 'All' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({announcementsList.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    categoryFilter === cat ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Priority Selector */}
            <select 
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-white shadow-xs"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High Priority Only</option>
              <option value="Normal">⚪ Standard Priority</option>
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredList.map(a => (
          <Card key={a.id} className="hover:shadow-md transition-all border border-gray-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    a.priority === 'High' 
                      ? 'bg-red-100 text-red-600' 
                      : a.category === 'Recruitment' 
                        ? 'bg-purple-100 text-purple-600' 
                        : a.category === 'Workshop' 
                          ? 'bg-amber-100 text-amber-600' 
                          : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Megaphone className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-gray-900 text-lg">
                        {a.title}
                      </h3>
                      {getCategoryBadge(a.category)}
                      {a.priority === 'High' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Urgent Notice
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" /> Published on {a.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-400" /> By {a.author || (user?.name ? `${user.name} (${user.clubRole || 'Club Coordinator'})` : 'Dr. Vijay Samyal (Club Coordinator)')}
                      </span>
                      <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Audience: {a.audience || 'All Campus Students'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Top Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-start">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopyText(a)}
                    title="Copy announcement content"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditingAnnouncement(a)}
                    title="Edit announcement"
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(a.id, a.title)}
                    title="Delete announcement"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Message Content Container */}
              <div className="bg-gray-50/90 rounded-2xl p-4.5 border border-gray-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-normal">
                {a.content}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredList.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg mb-1">No announcements match your search!</h3>
            <p className="text-gray-500 text-sm">Post a new bulletin or reset your active filters.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setPriorityFilter('All'); }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* DRAFT ANNOUNCEMENT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-5 h-5" />
                <h3 className="font-bold text-lg">Broadcast Club Announcement</h3>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="p-6 space-y-4">
              <Input 
                label="Headline / Title" 
                placeholder="e.g. Hackathon Team Formation & Rules Meeting..." 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required 
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-white"
                  >
                    <option value="Event Alert">🔥 Event Alert</option>
                    <option value="Recruitment">👥 Leadership Call</option>
                    <option value="Workshop">⚡ Workshop & Tech</option>
                    <option value="General Notice">📌 General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-white"
                  >
                    <option value="Normal">Standard Priority</option>
                    <option value="High">🔴 High (Urgent Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Audience
                  </label>
                  <select 
                    value={formData.audience}
                    onChange={e => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-white"
                  >
                    <option value="All Campus Students">All Students</option>
                    <option value="Club Members Only">Members Only</option>
                    <option value="Event Registrants">Event Attendees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Author Signature / Role
                </label>
                <select 
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value={user?.name ? `${user.name} (${user.clubRole || 'Club Coordinator'})` : 'Dr. Vijay Samyal (Club Coordinator)'}>
                    {user?.name ? `${user.name} (${user.clubRole || 'Club Coordinator'})` : 'Dr. Vijay Samyal (Club Coordinator)'}
                  </option>
                  <option>Dr. Kulvir Singh (Faculty Advisor)</option>
                  <option>Manav Sharma (Student Coordinator)</option>
                  <option>Aarav Patel (Technical Lead)</option>
                  <option>Neha Gupta (Event Manager)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notice Body / Details
                </label>
                <textarea 
                  rows="5"
                  placeholder="Outline venue details, timetable deadlines, registration guidelines, or mentorship office hours..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md gap-1.5"
                >
                  <Megaphone className="w-4 h-4" /> Broadcast Live
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ANNOUNCEMENT MODAL */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-700 to-purple-800 text-white">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5" />
                <h3 className="font-bold text-lg">Edit Announcement</h3>
              </div>
              <button 
                onClick={() => setEditingAnnouncement(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <Input 
                label="Headline / Title" 
                value={editingAnnouncement.title}
                onChange={e => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                required 
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select 
                    value={editingAnnouncement.category}
                    onChange={e => setEditingAnnouncement({ ...editingAnnouncement, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold bg-white"
                  >
                    <option value="Event Alert">🔥 Event Alert</option>
                    <option value="Recruitment">👥 Leadership Call</option>
                    <option value="Workshop">⚡ Workshop & Tech</option>
                    <option value="General Notice">📌 General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select 
                    value={editingAnnouncement.priority}
                    onChange={e => setEditingAnnouncement({ ...editingAnnouncement, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold bg-white"
                  >
                    <option value="Normal">Standard Priority</option>
                    <option value="High">🔴 High (Urgent Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Audience
                  </label>
                  <select 
                    value={editingAnnouncement.audience}
                    onChange={e => setEditingAnnouncement({ ...editingAnnouncement, audience: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold bg-white"
                  >
                    <option value="All Campus Students">All Students</option>
                    <option value="Club Members Only">Members Only</option>
                    <option value="Event Registrants">Event Attendees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notice Body / Details
                </label>
                <textarea 
                  rows="5"
                  value={editingAnnouncement.content}
                  onChange={e => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setEditingAnnouncement(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
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
