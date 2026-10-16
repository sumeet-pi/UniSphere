import React, { useState } from 'react';
import { announcements, clubs } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Megaphone, Plus, Trash2, Edit2 } from 'lucide-react';

export function Announcements() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500">Publish news and updates to students</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4"/> New Announcement</>}
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="bg-blue-50/50">
            <h2 className="text-lg font-bold text-gray-900">Create Announcement</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Announcement title..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Write your announcement here..."></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={() => setShowForm(false)}>Publish Now</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.map(a => (
          <Card key={a.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{a.title}</h3>
                    <p className="text-sm text-gray-500">Published on {a.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Edit2 className="w-4 h-4"/></button>
                  <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                {a.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
