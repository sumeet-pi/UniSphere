import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { clubs } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Users, Calendar, User } from 'lucide-react';
import { Badge } from '../../components/Badge';

export function MyClub() {
  const { user } = useAuth();
  const club = clubs.find(c => c.id === user.clubId);

  if (!club) return <div>No club found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="h-48 w-full relative rounded-2xl overflow-hidden mb-16">
        <img src={club.banner} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute -bottom-12 left-8">
          <img src={club.logo} alt={club.name} className="w-24 h-24 rounded-xl shadow-md border-4 border-white bg-white" />
        </div>
      </div>

      <div className="flex justify-between items-start pt-4 pl-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
          <Badge variant="blue" className="mt-2">{club.category}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-900">About {club.name}</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {club.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Members</p>
                  <p className="font-bold text-gray-900">{club.memberCount}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                  <p className="font-bold text-gray-900">{club.upcomingEventsCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Faculty Head</p>
                  <p className="font-bold text-gray-900">{club.facultyHead}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
