import React, { useState } from 'react';
import { announcements as initialAnnouncements } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Megaphone, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

export function Announcements() {
  const [announcementsList, setAnnouncementsList] = useState(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postedSuccess, setPostedSuccess] = useState(false);

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newAnnouncement = {
      id: `a${Date.now()}`,
      clubId: 'c1',
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    setAnnouncementsList([newAnnouncement, ...announcementsList]);
    setTitle('');
    setContent('');
    setShowForm(false);
    setPostedSuccess(true);
    setTimeout(() => setPostedSuccess(false), 3000);
  };

  const handleDelete = (id) => {
    setAnnouncementsList(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Club Announcements</h1>
          <p className="text-gray-500">Broadcast important news, contest updates, and notifications</p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4"/> New Announcement</>}
        </Button>
      </div>

      {postedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold text-sm">Announcement published to student feed!</span>
        </div>
      )}

      {showForm && (
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="bg-blue-50/50">
            <h2 className="text-lg font-bold text-gray-900">Draft Announcement</h2>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Title</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="e.g. Hackathon Team Formation & Rules Meeting..." 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content / Message</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                  rows="4" 
                  placeholder="Type your notice here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Discard</Button>
                <Button type="submit">Publish Now</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {announcementsList.map(a => (
          <Card key={a.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{a.title}</h3>
                    <p className="text-xs text-gray-500">Published on {a.date} • Byte Warriors</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
              <p className="text-gray-700 bg-gray-50/80 p-4 rounded-xl border border-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                {a.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
