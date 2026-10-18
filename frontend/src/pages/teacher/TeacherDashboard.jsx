import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { events, clubs, eventRegistrations } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Users, Calendar as CalendarIcon, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TeacherDashboard() {
  const { user } = useAuth();
  const club = clubs.find(c => c.id === user.managedClubId);
  const recentRegistrations = eventRegistrations.slice(0, 4);
  const clubEvents = events.filter(e => e.clubId === club?.id);

  if (!club) return <div>No club found for this teacher.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Managing {club.name}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/teacher/events/create">
            <Button className="gap-2"><Plus className="w-4 h-4"/> Create Event</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> +12%</span>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{club.memberCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <CalendarIcon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Active Events</p>
            <p className="text-2xl font-bold text-gray-900">{clubEvents.filter(e => e.status === 'Upcoming').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Registrations</p>
            <p className="text-2xl font-bold text-gray-900">342</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Recent Registrations</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Event</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRegistrations.map((reg) => (
                      <tr key={reg.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {reg.studentName}
                          <div className="text-xs text-gray-500 font-normal">{reg.collegeId}</div>
                        </td>
                        <td className="px-6 py-4">{events.find(e => e.id === reg.eventId)?.title}</td>
                        <td className="px-6 py-4">{reg.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${reg.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-900">Core Team</h2>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {club.coreTeam.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">Manage Team</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
