import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { events, clubs, members, eventRegistrations, studentTasks as initialTasks } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  Users, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Plus, 
  CheckSquare, 
  Megaphone, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ClubDashboard() {
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const club = clubs.find(c => c.id === clubId) || clubs[0];
  const [tasks, setTasks] = useState(initialTasks);

  const clubEvents = events.filter(e => e.clubId === club.id);
  const upcomingEvents = clubEvents.filter(e => e.status === 'Upcoming');
  const recentRegistrations = eventRegistrations.slice(0, 4);

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } 
        : t
    ));
  };

  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {user?.clubName || club.name} • Official Club Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Club Coordinator'}
            </h1>
            <p className="text-blue-100 max-w-xl text-sm sm:text-base">
              {user?.department 
                ? `Department of ${user.department} • HOD: ${user.hod || 'Dr. Singhal'} • Faculty Lead: ${user.name}`
                : 'Unified portal for Faculty Heads & Student Coordinators. Manage events, track registrations, and organize tasks in one place.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/club-dashboard/events/create">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md gap-2 border-0">
                <Plus className="w-4 h-4" /> Create Event
              </Button>
            </Link>
            <Link to="/club-dashboard/announcements">
              <Button variant="outline" className="text-white border-white/40 hover:bg-white/10 gap-2">
                <Megaphone className="w-4 h-4" /> Post Notice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +12%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Members</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{club.memberCount}</p>
            <p className="text-xs text-gray-400 mt-1">Active departmental students</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                Scheduled
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">Active Events</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingEvents.length}</p>
            <p className="text-xs text-gray-400 mt-1">{clubEvents.length} total events organized</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Registrations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">342</p>
            <p className="text-xs text-gray-400 mt-1">Across all club activities</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pendingTasksCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {pendingTasksCount} Pending
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">Coordinator Tasks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.filter(t => t.status === 'completed').length} / {tasks.length}</p>
            <p className="text-xs text-gray-400 mt-1">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Upcoming Events & Recent Registrations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Upcoming Club Events</h2>
                <p className="text-xs text-gray-500">Events organized by {club.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/club-dashboard/events" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </Link>
                <Link to="/club-dashboard/events/create">
                  <Button size="sm" className="gap-1.5 ml-2">
                    <Plus className="w-3.5 h-3.5" /> New Event
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {upcomingEvents.slice(0, 3).map(event => (
                  <div key={event.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50/75 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-base">{event.title}</h3>
                          <Badge variant="green" className="text-[11px]">{event.status}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" /> {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" /> {event.time}
                          </span>
                          <span>Venue: <strong>{event.venue}</strong></span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="w-36 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full" 
                              style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {event.registeredCount} / {event.capacity} seats filled
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                      <Link to="/club-dashboard/events">
                        <Button variant="outline" size="sm" className="text-xs">
                          Manage
                        </Button>
                      </Link>
                      <Link to={`/events/${event.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-900 gap-1">
                          Preview <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Registrations Table */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recent Student Registrations</h2>
                <p className="text-xs text-gray-500">Live attendees registering for your club events</p>
              </div>
              <Link to="/club-dashboard/events">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View Details
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Student</th>
                      <th className="px-6 py-3 font-semibold">Event</th>
                      <th className="px-6 py-3 font-semibold">Date Registered</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentRegistrations.map((reg) => (
                      <tr key={reg.id} className="bg-white hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {reg.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{reg.studentName}</p>
                              <p className="text-xs text-gray-500">{reg.collegeId} • {reg.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {events.find(e => e.id === reg.eventId)?.title || 'Hackathon 2026'}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{reg.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            reg.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
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

        {/* Right Column (1 col): Coordinator Responsibilities & Core Team */}
        <div className="space-y-6">
          {/* Tasks & Responsibilities (Merged from Club Student) */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Coordinator Checklist</h2>
                <p className="text-xs text-gray-500">Shared tasks for teachers & student leads</p>
              </div>
              <Link to="/club-dashboard/tasks" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-2.5 mt-2">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer group"
                  >
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'} 
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 font-medium group-hover:text-blue-700'}`}>
                        {task.title}
                      </p>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 inline-block ${
                        task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/club-dashboard/tasks">
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs gap-1">
                  Manage Checklist <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Core Leadership Team */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Club Leadership</h2>
                <p className="text-xs text-gray-500">Faculty Head & Student Leads</p>
              </div>
              <Link to="/club-dashboard/members" className="text-xs text-blue-600 font-semibold hover:underline">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {/* Faculty Head */}
              <div className="flex items-center justify-between p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {club.facultyHead ? club.facultyHead.charAt(0) : 'D'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{club.facultyHead || 'Dr. Sharma'}</p>
                    <p className="text-xs text-indigo-600 font-semibold">Faculty Club Head</p>
                  </div>
                </div>
                <Badge variant="blue" className="text-[10px]">Head</Badge>
              </div>

              {/* Student Coordinators */}
              <div className="space-y-2 mt-2">
                {club.coreTeam.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{member.year}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Invite Code: <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">BW-CSE-2026</span>
                </div>
                <Link to="/club-dashboard/members">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                    + Add Member
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Card */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                {club.name} Profile
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Department of {club.category}. Publicly visible to all students across the college campus.
              </p>
              <div className="flex gap-2 pt-1">
                <Link to={`/explore/${club.id}`} target="_blank" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-white border-white/30 hover:bg-white/10 text-xs gap-1.5">
                    View Public Page <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link to="/club-dashboard/club" className="flex-1">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    Edit Club
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
