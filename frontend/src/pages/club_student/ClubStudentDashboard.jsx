import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { events, clubs, studentTasks } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Calendar, CheckSquare, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ClubStudentDashboard() {
  const { user } = useAuth();
  const club = clubs.find(c => c.id === user.clubId);
  const clubEvents = events.filter(e => e.clubId === club?.id && e.status === 'Upcoming').slice(0, 2);

  if (!club) return <div>No club found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-500">{club.name} • <span className="font-semibold text-blue-600">{user.clubRole}</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Megaphone className="w-4 h-4"/> New Announcement</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Your Responsibilities</h2>
              <Link to="/club-student/tasks" className="text-sm text-blue-600 font-medium">View All</Link>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mt-4">
                {studentTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'} 
                      readOnly
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900 font-medium'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Club Events</h2>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 mt-4">
                {clubEvents.map(event => (
                  <div key={event.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-xl">
                    <div className="w-full sm:w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <img src={event.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4"/> {event.date} • {event.time}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit Details</Button>
                        <Button size="sm">Manage Registrations</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
