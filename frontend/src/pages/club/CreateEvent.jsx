import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ImagePlus, Info, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addStoredEvent, clubs } from '../../data/mockData';

export function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const club = clubs.find(c => c.id === clubId) || clubs[0];

  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Technical',
    stage: 'open',
    description: '',
    date: '',
    venue: '',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    capacity: '100',
    eligibility: 'Open to all departments',
    rules: 'Teams of 2-4 members, Bring laptops'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    addStoredEvent({
      clubId: club.id,
      clubName: club.name,
      title: formData.title,
      category: formData.category,
      date: formData.date,
      time: `${formData.startTime} - ${formData.endTime}`,
      venue: formData.venue,
      description: formData.description,
      rules: formData.rules.split(',').map(r => r.trim()).filter(Boolean),
      eligibility: formData.eligibility,
      capacity: parseInt(formData.capacity, 10) || 100,
      registeredCount: 0,
      stage: formData.stage,
      eventStage: formData.stage,
      status: formData.stage === 'past' ? 'Past' : (formData.stage === 'closed' ? 'Closed' : 'Upcoming'),
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
    });

    setSuccess(true);
    setTimeout(() => {
      navigate('/club-dashboard/events');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/club-dashboard/events')}
            className="p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Club Event</h1>
            <p className="text-gray-500 text-sm">Publish an event to the campus discovery feed</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/club-dashboard/events')}>Cancel</Button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Event successfully created and published!</p>
            <p className="text-xs text-emerald-700">Redirecting to your events dashboard...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">1. Basic Information</h2>
              <Input 
                label="Event Title" 
                placeholder="e.g. AI & Web3 Hackathon 2026" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required 
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" 
                  rows="4" 
                  placeholder="Outline what participants will do, prize pool, guest speakers, and highlights..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option>Technical</option>
                    <option>Workshop & Hands-on</option>
                    <option>Cultural & Arts</option>
                    <option>Seminar / Tech Talk</option>
                    <option>Competition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Status</label>
                  <select 
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-medium"
                  >
                    <option value="open">🟢 Open for Registration</option>
                    <option value="upcoming">⏳ Announced (Registrations Soon)</option>
                    <option value="closed">🔒 Registration Closed</option>
                  </select>
                </div>
                <Input 
                  label="Maximum Capacity" 
                  type="number" 
                  placeholder="e.g. 100" 
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">2. Schedule & Venue</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Event Date" 
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required 
                />
                <Input 
                  label="Venue / Location" 
                  placeholder="e.g. Auditorium / Main Computer Lab 3" 
                  value={formData.venue}
                  onChange={e => setFormData({ ...formData, venue: e.target.value })}
                  required 
                />
                <Input 
                  label="Start Time" 
                  type="time" 
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  required 
                />
                <Input 
                  label="End Time" 
                  type="time" 
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">3. Requirements & Media</h2>
              <Input 
                label="Eligibility" 
                placeholder="e.g. Open to all branches and years" 
                value={formData.eligibility}
                onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
              />
              <Input 
                label="Rules (Comma separated)" 
                placeholder="e.g. Teams of 2-4, Bring college ID, Laptops required" 
                value={formData.rules}
                onChange={e => setFormData({ ...formData, rules: e.target.value })}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Cover Banner</label>
                <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="space-y-2 text-center">
                    <ImagePlus className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="font-semibold text-blue-600 group-hover:text-blue-700">
                        Upload banner
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-400">PNG, JPG, or WebP up to 10MB (16:9 ratio recommended)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate('/club-dashboard/events')}
          >
            Save as Draft
          </Button>
          <Button type="submit" className="shadow-md">
            Publish Event
          </Button>
        </div>
      </form>
    </div>
  );
}
