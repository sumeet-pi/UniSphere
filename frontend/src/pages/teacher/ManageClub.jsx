import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { clubs } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ImagePlus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ManageClub() {
  const { user } = useAuth();
  const club = clubs.find(c => c.id === user.managedClubId);

  if (!club) return <div>No club found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Club Profile</h1>
          <p className="text-gray-500">Update information for {club.name}</p>
        </div>
        <Link to={`/explore/${club.id}`} target="_blank">
          <Button variant="outline" className="gap-2">View Public Profile <ExternalLink className="w-4 h-4"/></Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Club Name" defaultValue={club.name} />
            <Input label="Category" defaultValue={club.category} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              rows="4" 
              defaultValue={club.description}
            ></textarea>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-900">Media</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Club Logo</label>
            <div className="flex items-center gap-6">
              <img src={club.logo} alt="Logo" className="w-24 h-24 rounded-xl border border-gray-200" />
              <Button variant="outline">Change Logo</Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Banner</label>
            <div className="h-48 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden relative group">
              <img src={club.banner} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="outline" className="text-white border-white hover:bg-white/20">Change Banner</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Discard Changes</Button>
        <Button>Save Profile</Button>
      </div>
    </div>
  );
}
