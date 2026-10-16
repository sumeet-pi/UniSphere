import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { events, clubs, announcements } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  Calendar, 
  Compass, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Megaphone, 
  Users, 
  Sparkles,
  ExternalLink,
  XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const { user, registeredEventIds, unregisterFromEvent, joinedClubIds } = useAuth();
  const navigate = useNavigate();

  // Find events the student is currently registered for
  const registeredEvents = events.filter(e => registeredEventIds.includes(e.id) && e.status === 'Upcoming');
  
  // Discover other events student is NOT registered for
  const discoverEvents = events.filter(e => !registeredEventIds.includes(e.id) && e.status === 'Upcoming').slice(0, 2);

  // Clubs student is following or member of
  const myClubs = clubs.filter(c => joinedClubIds.includes(c.id));
  const suggestedClubs = clubs.filter(c => !joinedClubIds.includes(c.id)).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Student Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.name || 'Vikram Singh'}</h1>
            <p className="text-blue-100 text-sm mt-1">
              {user?.course 
                ? `${user.course}${user.branch && user.branch.trim() !== '' ? ` in ${user.branch}` : ''} • ${user.sem} • Class Roll: ${user.classRollNo} • Univ Roll: ${user.universityRollNo}`
                : 'B.Tech Computer Science & Engineering • 2nd Year • ID: CS24089'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/student/events">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold border-0 shadow">
                Explore Events
              </Button>
            </Link>
            <Link to="/student/explore">
              <Button variant="outline" className="text-white border-white/40 hover:bg-white/10">
                Join Clubs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <Link to="/student/registrations" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>
            <p className="text-sm font-medium text-gray-500">Registered Events</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{registeredEvents.length}</p>
            <p className="text-xs text-gray-400 mt-1">Upcoming on campus</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <Compass className="w-5 h-5" />
              </div>
              <Link to="/student/explore" className="text-xs text-indigo-600 font-semibold hover:underline">
                Explore
              </Link>
            </div>
            <p className="text-sm font-medium text-gray-500">Clubs Joined</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{myClubs.length}</p>
            <p className="text-xs text-gray-400 mt-1">Active communities</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Semester 2026
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">Events Attended</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">1</p>
            <p className="text-xs text-gray-400 mt-1">Past completed participations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Registered Events & Recommended Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Registered Events Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Registered Events</h2>
                <p className="text-xs text-gray-500">Upcoming activities you have a reserved seat for</p>
              </div>
              <Link to="/student/registrations" className="text-xs font-semibold text-blue-600 hover:underline">
                Manage All ({registeredEvents.length})
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {registeredEvents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {registeredEvents.map(event => (
                    <div key={event.id} className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-gray-50/70 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-base">{event.title}</h3>
                            <Badge variant="green" className="text-[10px]">Registered</Badge>
                          </div>
                          <Link 
                            to={`/student/explore/${event.clubId}`}
                            className="text-xs font-semibold text-blue-600 hover:underline block mb-1"
                          >
                            {event.clubName}
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" /> {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" /> {event.time}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" /> {event.venue}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => unregisterFromEvent(event.id)}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                        <Link to={`/student/events/${event.id}`}>
                          <Button size="sm" className="text-xs gap-1">
                            View Event <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold">You haven't registered for any events yet</p>
                  <p className="text-xs text-gray-500 mt-1 mb-4">Discover exciting workshops, hackathons, and seminars on campus.</p>
                  <Link to="/student/events">
                    <Button size="sm">Browse Campus Events</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Events to Discover */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Events You Might Like</h2>
                <p className="text-xs text-gray-500">Popular upcoming sessions on campus</p>
              </div>
              <Link to="/student/events" className="text-xs font-semibold text-blue-600 hover:underline">
                View All Events
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {discoverEvents.map(event => (
                  <div key={event.id} className="p-5 flex flex-col justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <div className="h-32 rounded-xl overflow-hidden mb-3 relative">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-gray-800 backdrop-blur-sm">
                            {event.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">{event.clubName}</p>
                      <h3 className="font-bold text-gray-900 text-sm mb-2">{event.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{event.description}</p>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" /> {event.date} • {event.time}
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" /> {event.venue}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Link to={`/student/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          View Details & Register
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Clubs & Announcements */}
        <div className="space-y-6">
          {/* My Clubs */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Clubs</h2>
                <p className="text-xs text-gray-500">Clubs you belong to</p>
              </div>
              <Link to="/student/explore" className="text-xs text-blue-600 font-semibold hover:underline">
                Explore More
              </Link>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {myClubs.map(club => (
                <div key={club.id} className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={club.logo} alt={club.name} className="w-10 h-10 rounded-xl object-cover bg-gray-50 border border-gray-200 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{club.name}</h4>
                      <p className="text-xs text-gray-500">{club.category}</p>
                    </div>
                  </div>
                  <Link to={`/student/explore/${club.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8 px-2.5">
                      Profile
                    </Button>
                  </Link>
                </div>
              ))}

              {suggestedClubs.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommended to Join</p>
                  <div className="space-y-2">
                    {suggestedClubs.map(club => (
                      <div key={club.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={club.logo} alt="" className="w-7 h-7 rounded-lg object-cover bg-gray-100" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-gray-800 truncate">{club.name}</p>
                            <p className="text-[10px] text-gray-500">{club.memberCount} members</p>
                          </div>
                        </div>
                        <Link to={`/student/explore/${club.id}`}>
                          <span className="text-xs text-blue-600 font-medium hover:underline">Join</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcements Feed */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Campus Notices</h2>
              </div>
              <p className="text-xs text-gray-500">Official updates from club heads</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {announcements.map(notice => (
                <div key={notice.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-900">{notice.title}</p>
                    <span className="text-[10px] text-gray-400 font-mono">{notice.date}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{notice.content}</p>
                  <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1">
                    Byte Warriors
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
