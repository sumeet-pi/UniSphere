import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { clubs, events, announcements } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  ArrowLeft, 
  Check, 
  Share2, 
  Megaphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export function ClubProfile() {
  const { id } = useParams();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  const { isClubJoined, toggleJoinClub, isRegistered } = useAuth();

  const club = clubs.find(c => c.id === (id || 'c1')) || clubs[0];
  const clubEvents = events.filter(e => e.clubId === club.id);
  const clubAnnouncements = announcements.filter(a => a.clubId === club.id);

  const isMember = isClubJoined ? isClubJoined(club.id) : false;
  const [activeTab, setActiveTab] = useState('events');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('BW-CSE-2026');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Banner */}
      <div className="h-72 w-full relative overflow-hidden bg-gray-900">
        <img src={club.banner} alt={club.name} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute top-6 left-0 right-0">
          <Link to={`${basePath}/explore`}>
            <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Clubs
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 mb-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
          <div className="relative">
            <img 
              src={club.logo} 
              alt={club.name} 
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shadow-lg border-4 border-white bg-white object-cover" 
            />
          </div>
          
          <div className="flex-grow pt-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-extrabold text-gray-900">{club.name}</h1>
                  <Badge variant="blue">{club.category}</Badge>
                </div>
                <p className="text-gray-500 text-sm mt-1">Official Student Organization • CSE Department</p>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="lg"
                  variant={isMember ? 'outline' : 'primary'}
                  onClick={() => toggleJoinClub(club.id)}
                  className={`font-semibold shadow-sm ${
                    isMember ? 'text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100' : ''
                  }`}
                >
                  {isMember ? <><Check className="w-4 h-4 mr-1.5" /> Member Joined</> : 'Join Club'}
                </Button>
                <Button variant="outline" size="lg" onClick={handleCopyCode} title="Share club code">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 mt-4 text-base max-w-3xl leading-relaxed">
              {club.description}
            </p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-medium">Total Members</p>
                <p className="font-bold text-gray-900 text-lg flex items-center gap-1.5 mt-0.5">
                  <Users className="w-4 h-4 text-blue-600"/> {club.memberCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Upcoming Events</p>
                <p className="font-bold text-gray-900 text-lg flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-blue-600"/> {clubEvents.filter(e => e.status === 'Upcoming').length}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 font-medium">Faculty Advisor</p>
                <p className="font-bold text-gray-900 text-lg flex items-center gap-1.5 mt-0.5">
                  <User className="w-4 h-4 text-blue-600"/> {club.facultyHead || 'Dr. Sharma'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'events' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Events & Activities ({clubEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'about' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            About & Mission
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'team' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Leadership Team
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'notices' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Notices & Announcements
          </button>
        </div>

        {/* Tab 1: Events */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Events Organized by {club.name}</h2>
                <p className="text-xs text-gray-500">Register and participate to earn certificates</p>
              </div>
              <Link to={`${basePath}/events`}>
                <Button variant="outline" size="sm">Browse All College Events</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clubEvents.map(event => {
                const registered = isRegistered ? isRegistered(event.id) : false;

                return (
                  <Card key={event.id} className="flex flex-col hover:shadow-lg transition-all overflow-hidden border-gray-200">
                    <div className="h-44 w-full relative">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <Badge variant={event.status === 'Upcoming' ? 'green' : 'gray'}>
                          {event.status}
                        </Badge>
                        {registered && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow">
                            <CheckCircle2 className="w-3 h-3" /> Registered
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                        
                        <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" /> {event.date} • {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" /> {event.venue}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                          <Button className="w-full text-xs shadow-sm">
                            {registered ? 'View Pass & Details' : 'View Details & Register'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: About */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900">About {club.name}</h3>
                </CardHeader>
                <CardContent className="pt-0 space-y-4 text-gray-700 leading-relaxed text-sm">
                  <p>
                    {club.description}
                  </p>
                  <p>
                    The club serves as an incubator for creative thinking and real-world implementation. Through weekly coding workshops, annual hackathons, and guest seminars from industry experts, members gain practical engineering experience.
                  </p>
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 mt-4">
                    <h4 className="font-bold text-blue-900 mb-1">Membership Eligibility</h4>
                    <p className="text-xs text-blue-800">
                      Open to all undergraduate and postgraduate students of the college with an active student ID card.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-base font-bold text-gray-900">Department Overview</h3>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-gray-600 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-800">Affiliation</p>
                    <p>Department of {club.category}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Campus Base</p>
                    <p>CSE Academic Block, 3rd Floor</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Club Invite Code</p>
                    <p className="font-mono font-bold text-blue-600 bg-blue-50 p-1.5 rounded inline-block mt-1">
                      BW-CSE-2026
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Team */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Faculty Head */}
              <Card className="text-center p-6 bg-indigo-50/50 border-indigo-100">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                  {club.facultyHead ? club.facultyHead.charAt(0) : 'D'}
                </div>
                <h4 className="font-bold text-gray-900 text-base">{club.facultyHead || 'Dr. Sharma'}</h4>
                <p className="text-xs text-indigo-700 font-semibold mt-0.5">Faculty Club Advisor</p>
                <p className="text-[11px] text-gray-500 mt-2">Department Faculty</p>
              </Card>

              {/* Core Team Members */}
              {club.coreTeam && club.coreTeam.map(member => (
                <Card key={member.id} className="text-center p-6 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                    {member.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">{member.name}</h4>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">{member.role}</p>
                  <p className="text-[11px] text-gray-400 mt-2">{member.department} • {member.year}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Notices */}
        {activeTab === 'notices' && (
          <div className="space-y-4 max-w-4xl">
            {clubAnnouncements.length > 0 ? (
              clubAnnouncements.map(notice => (
                <Card key={notice.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{notice.title}</h4>
                        <p className="text-xs text-gray-400">{notice.date}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mt-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {notice.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-700 font-semibold">No recent announcements</p>
                <p className="text-xs text-gray-500 mt-1">Check back later for updates from this club.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
