import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clubs } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ExternalLink, CheckCircle2, ShieldCheck, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ManageClub() {
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const club = clubs.find(c => c.id === clubId) || clubs[0];

  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: club.name,
    category: club.category,
    facultyHead: club.facultyHead,
    description: club.description,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Club Profile</h1>
          <p className="text-gray-500">Update public information and settings for {club.name}</p>
        </div>
        <Link to={`/explore/${club.id}`} target="_blank">
          <Button variant="outline" className="gap-2">
            View Public Profile <ExternalLink className="w-4 h-4"/>
          </Button>
        </Link>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold text-sm">Club profile updated successfully!</span>
        </div>
      )}

      {/* Banner Preview */}
      <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        <img src={club.banner} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-6 flex items-center gap-4">
          <img src={club.logo} alt={club.name} className="w-16 h-16 rounded-xl border-2 border-white shadow-md bg-white object-cover" />
          <div className="text-white">
            <h2 className="text-xl font-bold drop-shadow">{club.name}</h2>
            <p className="text-xs text-blue-200">{club.category} • {club.memberCount} active members</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Club Name" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <Input 
              label="Department / Category" 
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
            <Input 
              label="Faculty Head / Advisor" 
              value={formData.facultyHead}
              onChange={e => setFormData({ ...formData, facultyHead: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Invite Code</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value="BW-CSE-2026" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-mono font-bold text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About / Description</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" 
              rows="4" 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-900">Brand Assets & Imagery</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Club Emblem / Logo</label>
            <div className="flex items-center gap-6">
              <img src={club.logo} alt="Logo" className="w-20 h-20 rounded-xl border border-gray-200 bg-white shadow-sm" />
              <Button variant="outline" size="sm">Change Logo</Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Banner Image</label>
            <div className="h-40 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden relative group">
              <img src={club.banner} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="outline" className="text-white border-white hover:bg-white/20">Change Cover Banner</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Discard Changes</Button>
        <Button onClick={handleSave} className="shadow-md">Save Profile</Button>
      </div>
    </div>
  );
}
