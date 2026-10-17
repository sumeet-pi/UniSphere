import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getStoredEvents, 
  getStoredClubs, 
  getStoredAnnouncements, 
  getStoredStudentProfile 
} from '../../data/mockData';
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
  ShieldCheck, 
  Check, 
  Search, 
  GraduationCap, 
  ChevronRight, 
  Layers, 
  User,
  Ticket,
  Award,
  Trophy,
  Download,
  Printer,
  AlertTriangle,
  X,
  QrCode,
  Copy,
  Lock,
  FileText,
  Activity,
  TrendingUp,
  HeartPulse
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const { user, registeredEventIds, registerForEvent, unregisterFromEvent, joinedClubIds } = useAuth();
  const navigate = useNavigate();

  // Dynamic student profile from storage
  const [profile, setProfile] = useState(() => {
    const stored = getStoredStudentProfile();
    return {
      ...stored,
      name: user?.name || stored.name || 'Vikram Singh',
      email: user?.email || stored.email || 'vikram.singh@college.edu'
    };
  });

  // Dynamic datasets from stored helpers
  const [allClubs, setAllClubs] = useState(() => getStoredClubs());
  const [allEvents, setAllEvents] = useState(() => getStoredEvents());
  const [allAnnouncements, setAllAnnouncements] = useState(() => getStoredAnnouncements());

  // Real-time synchronization
  useEffect(() => {
    const handleSync = () => {
      setAllClubs(getStoredClubs());
      setAllEvents(getStoredEvents());
      setAllAnnouncements(getStoredAnnouncements());
      setProfile(getStoredStudentProfile());
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Update profile if auth user changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        ...user
      }));
    }
  }, [user]);

  // Dashboard Activity Hub Active Tab: 'passes' | 'trending' | 'podium'
  const [dashboardTab, setDashboardTab] = useState('passes');

  // Search & filter for Explore Clubs section
  const [clubSearch, setClubSearch] = useState('');
  const [selectedClubCategory, setSelectedClubCategory] = useState('All');
  const clubCategories = ['All', 'Computer Science', 'Engineering', 'Arts & Culture', 'Entrepreneurship'];

  // Interactive Modals
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [rsvpModalEvent, setRsvpModalEvent] = useState(null);
  const [winnersModalEvent, setWinnersModalEvent] = useState(null);
  const [cancellingEvent, setCancellingEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedNoticeId, setCopiedNoticeId] = useState(null);

  // Filtered event buckets
  const registeredEvents = allEvents.filter(e => registeredEventIds.includes(e.id) && e.status !== 'Past');
  const pastEvents = allEvents.filter(e => e.status === 'Past');
  const openEvents = allEvents.filter(e => e.stage === 'open' || e.status === 'Open');
  const trendingEvents = allEvents.filter(e => e.status !== 'Past').slice(0, 4);

  // Filtered clubs
  const myClubs = allClubs.filter(c => joinedClubIds.includes(c.id));
  const suggestedClubs = allClubs.filter(c => !joinedClubIds.includes(c.id)).slice(0, 3);

  // Filtered clubs for Explore Clubs section
  const filteredExploreClubs = allClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
                          club.description.toLowerCase().includes(clubSearch.toLowerCase()) ||
                          club.category.toLowerCase().includes(clubSearch.toLowerCase()) ||
                          (club.facultyAdvisor && club.facultyAdvisor.toLowerCase().includes(clubSearch.toLowerCase())) ||
                          (club.department && club.department.toLowerCase().includes(clubSearch.toLowerCase()));
    const matchesCategory = selectedClubCategory === 'All' ? true : club.category === selectedClubCategory;
    return matchesSearch && matchesCategory;
  });

  const scrollToExplore = () => {
    const el = document.getElementById('explore-clubs-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyNotice = (notice) => {
    navigator.clipboard.writeText(`${notice.title}\n\n${notice.content}\n\n— ${notice.author || 'Club Leadership'}`);
    setCopiedNoticeId(notice.id);
    setToastMessage('Announcement text copied to clipboard!');
    setTimeout(() => {
      setCopiedNoticeId(null);
      setToastMessage(null);
    }, 3000);
  };

  const handleConfirmRsvp = () => {
    if (!rsvpModalEvent) return;
    registerForEvent(rsvpModalEvent.id);
    const eventName = rsvpModalEvent.title;
    setRsvpModalEvent(null);
    setToastMessage(`Seat confirmed for "${eventName}"! Entry pass issued.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const confirmCancelRegistration = () => {
    if (!cancellingEvent) return;
    unregisterFromEvent(cancellingEvent.id);
    const eventName = cancellingEvent.title;
    setCancellingEvent(null);
    setToastMessage(`Registration cancelled for "${eventName}". Your seat has been released.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Hero Welcome & Student Identity Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Compass className="w-80 h-80 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Avatar with Quick ID Trigger */}
            <div 
              onClick={() => setShowIdCardModal(true)}
              className="relative cursor-pointer group"
              title="Click to view Virtual Student ID Card"
            >
              <img 
                src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                alt={profile.name} 
                className="w-20 h-20 rounded-2xl object-cover border-3 border-white/80 shadow-lg group-hover:scale-105 group-hover:ring-4 group-hover:ring-blue-300 transition-all"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-semibold uppercase tracking-wider text-blue-100 border border-white/20">
                  <Sparkles className="w-3 h-3 text-yellow-300" /> UniSphere Student Portal
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-[11px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Enrolled & Verified
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {profile.name}
              </h1>

              <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
                {profile.course} in {profile.branch} • {profile.sem} ({profile.year}) • {profile.department}
              </p>

              {/* Credential Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-blue-200">
                <span className="bg-black/25 px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[11px]">
                  Class Roll: <strong className="text-white font-bold">{profile.classRollNo}</strong>
                </span>
                <span className="bg-black/25 px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[11px]">
                  Univ Reg: <strong className="text-white font-bold">{profile.universityRollNo}</strong>
                </span>
                <span className="bg-black/25 px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[11px] flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-red-300" />
                  Blood: <strong className="text-white font-bold">{profile.bloodGroup}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button 
              onClick={() => setShowIdCardModal(true)}
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-blue-700" /> Virtual ID Card
            </button>
            <button 
              onClick={scrollToExplore}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" /> Explore Clubs
            </button>
            <Link to="/student/registrations">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/15 gap-2 font-medium text-xs sm:text-sm h-10 px-3.5">
                <Ticket className="w-4 h-4" /> My Passes
              </Button>
            </Link>
            <Link to="/student/profile">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/15 gap-2 font-medium text-xs sm:text-sm h-10 px-3.5">
                <User className="w-4 h-4" /> Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic 4-KPI Co-Curricular & Academic Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reserved Passes */}
        <button 
          onClick={() => setDashboardTab('passes')} 
          className="text-left group transition-all"
        >
          <Card className={`hover:shadow-md transition-all border-gray-200 h-full ${dashboardTab === 'passes' ? 'ring-2 ring-blue-500 border-blue-500' : 'group-hover:border-blue-300'}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Ticket className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Ready for Entry
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500">Reserved Passes</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{registeredEvents.length}</p>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <span>Confirmed upcoming sessions</span>
                <span className="text-blue-600 font-bold ml-auto">&rarr;</span>
              </p>
            </CardContent>
          </Card>
        </button>

        {/* Clubs Joined */}
        <button onClick={scrollToExplore} className="text-left group transition-all">
          <Card className="hover:shadow-md transition-all border-gray-200 group-hover:border-indigo-300 h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  Zero-Code Access
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500">Clubs Joined</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{myClubs.length}</p>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <span>Active student communities</span>
                <span className="text-indigo-600 font-bold ml-auto">Browse &rarr;</span>
              </p>
            </CardContent>
          </Card>
        </button>

        {/* Certificates Ready */}
        <button 
          onClick={() => {
            if (pastEvents.length > 0) {
              setSelectedCertificate(pastEvents[0]);
            } else {
              setToastMessage('Complete campus events to unlock accredited completion certificates.');
              setTimeout(() => setToastMessage(null), 3000);
            }
          }}
          className="text-left group transition-all"
        >
          <Card className="hover:shadow-md transition-all border-gray-200 group-hover:border-emerald-300 h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  NAAC Criterion 5.3
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500">Certificates Ready</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">1</p>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <span>Verified accredited credentials</span>
                <span className="text-emerald-600 font-bold ml-auto">View &rarr;</span>
              </p>
            </CardContent>
          </Card>
        </button>

        {/* Learning Hours with Progress Meter */}
        <Card className="hover:shadow-md transition-all border-gray-200 h-full">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                40% Logged
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">Co-Curricular Hours</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-2xl font-extrabold text-gray-900">16</p>
              <span className="text-xs text-gray-500 font-semibold">/ 40 Target Hrs</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full" style={{ width: '40%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: 2 Columns (Campus Event & Activity Hub vs Joined Clubs & Bulletins) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column (2 cols): Multi-Tab Campus Activity Hub */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {/* Tab Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Campus Activity Hub</h2>
                <p className="text-xs text-gray-500">Manage your active passes, discover upcoming events, and view champion podiums</p>
              </div>

              {/* Stage Switcher Tabs */}
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs w-full sm:w-auto">
                <button
                  onClick={() => setDashboardTab('passes')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 flex-1 sm:flex-none justify-center ${
                    dashboardTab === 'passes'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>My Passes ({registeredEvents.length})</span>
                </button>

                <button
                  onClick={() => setDashboardTab('trending')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 flex-1 sm:flex-none justify-center ${
                    dashboardTab === 'trending'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Open for RSVP ({openEvents.length})</span>
                </button>

                <button
                  onClick={() => setDashboardTab('podium')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 flex-1 sm:flex-none justify-center ${
                    dashboardTab === 'podium'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Winners Podium</span>
                </button>
              </div>
            </div>

            <CardContent className="p-0">
              {/* TAB 1: MY RESERVED PASSES */}
              {dashboardTab === 'passes' && (
                <div>
                  {registeredEvents.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {registeredEvents.map(event => (
                        <div key={event.id} className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-gray-50/70 transition-colors">
                          <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 shadow-xs relative">
                              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                              <div className="absolute top-1 left-1 bg-black/60 rounded px-1 text-[9px] font-mono text-white">
                                PASS
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{event.title}</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> Confirmed Seat
                                </span>
                              </div>
                              
                              {/* Club link opens public profile */}
                              <Link 
                                to={`/student/explore/${event.clubId}`}
                                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 mb-1"
                              >
                                <span>Organized by {event.clubName}</span>
                                <ExternalLink className="w-3 h-3" />
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
                              onClick={() => setCancellingEvent(event)}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Cancel RSVP
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedTicket(event)}
                              className="text-xs gap-1.5 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>View Hall Ticket</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-800 font-bold">No active passes in your schedule</p>
                      <p className="text-xs text-gray-500 mt-1 mb-4">Discover open hackathons, workshops, and speaker talks on campus.</p>
                      <button 
                        onClick={() => setDashboardTab('trending')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Browse Open Events
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TRENDING & OPEN FOR RSVP */}
              {dashboardTab === 'trending' && (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {trendingEvents.map(event => {
                      const isRegistered = registeredEventIds.includes(event.id);
                      return (
                        <div key={event.id} className="p-4 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between bg-white group">
                          <div>
                            <div className="h-32 rounded-xl overflow-hidden mb-3 relative shadow-xs bg-gray-900">
                              <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95" />
                              <div className="absolute top-2 left-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                                  event.stage === 'open' || event.status === 'Open'
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-amber-500 text-white'
                                }`}>
                                  {event.stage === 'open' || event.status === 'Open' ? 'Open for RSVP' : 'Opening Soon'}
                                </span>
                              </div>
                              <div className="absolute bottom-2 right-2">
                                <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
                                  {event.capacity} seats
                                </span>
                              </div>
                            </div>
                            
                            <Link 
                              to={`/student/explore/${event.clubId}`}
                              className="text-xs font-bold text-blue-600 hover:underline block mb-1"
                            >
                              {event.clubName}
                            </Link>
                            
                            <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-1">{event.title}</h3>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-3">{event.description}</p>
                            
                            <div className="space-y-1 text-xs text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" /> {event.date} • {event.time}
                              </div>
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {event.venue}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                            {isRegistered ? (
                              <Button 
                                size="sm" 
                                onClick={() => setSelectedTicket(event)}
                                className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" /> View Ticket Pass
                              </Button>
                            ) : (event.stage === 'open' || event.status === 'Open') ? (
                              <Button 
                                size="sm" 
                                onClick={() => setRsvpModalEvent(event)}
                                className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                              >
                                Quick RSVP
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                disabled
                                className="w-full text-xs font-semibold gap-1.5 text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
                              >
                                <Lock className="w-3.5 h-3.5" /> Opening Soon
                              </Button>
                            )}

                            <Link to={`/student/events/${event.id}`}>
                              <Button variant="outline" size="sm" className="text-xs px-2.5 h-8 font-semibold">
                                Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center pt-2">
                    <Link to="/student/events" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                      Explore All Campus Events in Catalog &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 3: CHAMPIONS & PAST PODIUM */}
              {dashboardTab === 'podium' && (
                <div className="p-5 space-y-4">
                  {pastEvents.map(event => (
                    <div key={event.id} className="p-4 rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-amber-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-amber-200 shadow-xs relative">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-amber-950/20 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-yellow-300 drop-shadow-md" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{event.title}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              🏆 Concluded & Certified
                            </span>
                          </div>
                          <Link 
                            to={`/student/explore/${event.clubId}`}
                            className="text-xs font-semibold text-blue-600 hover:underline block mb-1"
                          >
                            Organized by {event.clubName}
                          </Link>
                          <p className="text-xs text-gray-500">
                            Concluded on {event.date} • {event.venue} • {event.registeredCount || 115} attendees
                          </p>
                          {event.winners && event.winners.length > 0 && (
                            <p className="text-xs font-bold text-amber-900 mt-1 bg-amber-100/60 px-2 py-0.5 rounded inline-block">
                              🥇 1st Place: {event.winners[0].name} ({event.winners[0].branch})
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => setWinnersModalEvent(event)}
                          className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs"
                        >
                          <Trophy className="w-3.5 h-3.5" /> View Champions Podium
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Co-Curricular Credit & Activity Milestone Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/70 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Award className="w-4 h-4" />
                </span>
                <h4 className="font-bold text-sm text-gray-900">Academic Co-Curricular Credit Tracking</h4>
              </div>
              <p className="text-xs text-gray-600 max-w-xl">
                UniSphere tracks verified attendance and certificates toward graduation criteria (NAAC Criterion 5.3). 
                Keep participating to unlock the Dean's Co-Curricular Honor Roll.
              </p>
            </div>
            <Link to="/student/registrations" className="flex-shrink-0">
              <Button size="sm" variant="outline" className="text-xs font-bold border-blue-300 text-blue-700 bg-white hover:bg-blue-50">
                View Credentials &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column (1 col): Your Clubs, Campus Bulletins & Certificates Snapshot */}
        <div className="space-y-6">
          {/* Your Joined Clubs */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-3 bg-gray-50/70 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">Your Clubs</h2>
                  <Badge variant="blue" className="text-[10px]">{myClubs.length}</Badge>
                </div>
                <p className="text-xs text-gray-500">Communities you have joined</p>
              </div>
              <button onClick={scrollToExplore} className="text-xs text-blue-600 font-bold hover:underline">
                Explore More
              </button>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {myClubs.map(club => (
                <div 
                  key={club.id} 
                  className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={club.logo} 
                      alt={club.name} 
                      className="w-10 h-10 rounded-xl object-cover bg-gray-50 border border-gray-200 flex-shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{club.name}</h4>
                      <p className="text-xs text-gray-500">{club.category}</p>
                    </div>
                  </div>
                  <Link to={`/student/explore/${club.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8 px-2.5 font-semibold text-blue-700 hover:bg-blue-50">
                      Public Profile
                    </Button>
                  </Link>
                </div>
              ))}

              {myClubs.length === 0 && (
                <div className="text-center py-6 px-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 font-medium">You haven't joined any clubs yet.</p>
                  <button 
                    onClick={scrollToExplore}
                    className="text-xs text-blue-600 font-bold hover:underline mt-1 block mx-auto"
                  >
                    Explore Campus Clubs &rarr;
                  </button>
                </div>
              )}

              {suggestedClubs.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Recommended for You</p>
                  <div className="space-y-2">
                    {suggestedClubs.map(club => (
                      <div key={club.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={club.logo} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-gray-800 truncate">{club.name}</p>
                            <p className="text-[10px] text-gray-500">{club.memberCount} members</p>
                          </div>
                        </div>
                        <Link to={`/student/explore/${club.id}`}>
                          <span className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                            Profile &rarr;
                          </span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campus Bulletins & Notices Feed with 1-Click Copy */}
          <Card>
            <CardHeader className="pb-3 bg-gray-50/70 border-b border-gray-100 flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Campus Bulletins</h2>
                </div>
                <p className="text-xs text-gray-500">Official dispatches from faculty & leads</p>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Live Feed
              </span>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {allAnnouncements.slice(0, 3).map(notice => (
                <div key={notice.id} className="p-3 rounded-xl bg-gray-50 border border-gray-150 text-xs space-y-2 hover:bg-gray-100/70 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-bold text-gray-900 line-clamp-1">{notice.title}</p>
                    <button 
                      onClick={() => handleCopyNotice(notice)}
                      className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-white transition-colors"
                      title="Copy announcement text"
                    >
                      {copiedNoticeId === notice.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-600 leading-relaxed line-clamp-2">{notice.content}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {notice.clubName || 'Byte Warriors'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{notice.date}</span>
                    {notice.priority === 'High' && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Accredited Certificates Snapshot */}
          <Card>
            <CardHeader className="pb-3 bg-gray-50/70 border-b border-gray-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Verified Credentials</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                1 Ready
              </span>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">Algorithm Arena 2025</h4>
                    <p className="text-[11px] text-gray-500">Byte Warriors • Seminar Hall A</p>
                  </div>
                  <Badge variant="green" className="text-[9px]">Verified</Badge>
                </div>
                <p className="text-[11px] text-gray-600 font-mono">
                  Credential ID: <span className="font-bold text-gray-800">UNIS-CERT-E2-2025-CS24089</span>
                </p>
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (pastEvents.length > 0) {
                      setSelectedCertificate(pastEvents[0]);
                    }
                  }}
                  className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" /> View Institutional Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* EXPLORE CAMPUS CLUBS SECTION (Primary Focus: Each club card opens public profile) */}
      <div id="explore-clubs-section" className="space-y-4 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Explore Campus Clubs & Societies
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Connect with departmental organizations, coding societies, and cultural circles. 
              Click any club to open its official public profile and view faculty leadership, schedule, and join.
            </p>
          </div>

          <Link to="/student/explore" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0">
            View All in Catalog ({allClubs.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Pills & Live Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none">
            {clubCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedClubCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  selectedClubCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {cat} {cat === 'All' ? `(${allClubs.length})` : ''}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search club, advisor, dept..."
              value={clubSearch}
              onChange={(e) => setClubSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-gray-50/50"
            />
          </div>
        </div>

        {/* Clubs Showcase Grid - Each Club Card Opens its Public Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredExploreClubs.map(club => {
            const isMember = joinedClubIds.includes(club.id);
            const publicProfileUrl = `/student/explore/${club.id}`;

            return (
              <div 
                key={club.id}
                className="flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Banner with clickable link */}
                <Link to={publicProfileUrl} className="h-32 w-full relative overflow-hidden bg-gray-900 block">
                  <img 
                    src={club.banner} 
                    alt={club.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/20" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/95 text-blue-700 shadow-xs backdrop-blur-xs">
                      {club.category}
                    </span>
                  </div>

                  {/* Member Badge */}
                  {isMember && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                        <Check className="w-3 h-3" /> Member
                      </span>
                    </div>
                  )}

                  {/* Club Code */}
                  <div className="absolute bottom-2 right-2.5">
                    <span className="text-[10px] font-mono text-gray-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      {club.clubCode || `UNI-${club.id.toUpperCase()}-2026`}
                    </span>
                  </div>
                </Link>

                {/* Card Body */}
                <div className="relative flex-grow flex flex-col pt-8 p-4">
                  {/* Logo with clickable link */}
                  <Link to={publicProfileUrl} className="absolute -top-8 left-4">
                    <img 
                      src={club.logo} 
                      alt={club.name} 
                      className="w-14 h-14 rounded-xl shadow-md border-2 border-white bg-white object-cover group-hover:ring-2 group-hover:ring-blue-500 transition-all" 
                    />
                  </Link>

                  <div className="mb-2">
                    <Link to={publicProfileUrl}>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 flex items-center justify-between">
                        <span>{club.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                      </h3>
                    </Link>
                    <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                      {club.department || 'Academic Department'}
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                    {club.description}
                  </p>

                  {/* Governance Tag */}
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-600 mb-3 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span className="truncate">
                      Advisor: <strong>{club.facultyAdvisor || club.facultyHead || 'Faculty Advisor'}</strong>
                    </span>
                  </div>

                  {/* Stats Bar */}
                  <div className="flex items-center justify-between text-xs text-gray-500 py-2 border-t border-gray-100 mb-3 font-semibold">
                    <span className="flex items-center gap-1 text-gray-700">
                      <Users className="w-3.5 h-3.5 text-blue-600" /> {club.memberCount} members
                    </span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> {club.upcomingEventsCount || 2} events
                    </span>
                  </div>

                  {/* Action Link: Opens Public Profile */}
                  <div className="mt-auto pt-1">
                    <Link to={publicProfileUrl} className="block w-full">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-full text-xs font-bold gap-1 shadow-xs group-hover:bg-blue-700"
                      >
                        <span>View Public Profile</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: VIRTUAL STUDENT IDENTITY CARD */}
      {showIdCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <QrCode className="w-4 h-4" />
                <span>Virtual Campus Identity Card</span>
              </div>
              <button onClick={() => setShowIdCardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ID Card Front Frame */}
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-blue-700 via-indigo-700 to-blue-800 text-white p-5 shadow-xl relative overflow-hidden space-y-4 text-center">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white text-blue-700 font-extrabold flex items-center justify-center text-xs">U</div>
                  <span className="font-extrabold text-xs tracking-wider">UNISPHERE UNIVERSITY</span>
                </div>
                <span className="text-[10px] font-mono text-blue-200">SESSION 2024-28</span>
              </div>

              <div className="flex flex-col items-center gap-2 pt-1">
                <img 
                  src={profile.avatar} 
                  alt="" 
                  className="w-20 h-20 rounded-2xl object-cover border-3 border-white shadow-md"
                />
                <div>
                  <h3 className="font-extrabold text-lg text-white">{profile.name}</h3>
                  <p className="text-xs text-blue-200 font-medium">{profile.course} in {profile.branch}</p>
                </div>
              </div>

              {/* ID Card Fields Grid */}
              <div className="bg-white/10 rounded-xl p-3 text-left space-y-1 text-xs border border-white/15 backdrop-blur-xs">
                <div className="flex justify-between">
                  <span className="text-blue-200 text-[11px]">Class Roll No:</span>
                  <span className="font-mono font-bold text-white">{profile.classRollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-[11px]">Univ Roll No:</span>
                  <span className="font-mono font-bold text-white">{profile.universityRollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-[11px]">Semester / Year:</span>
                  <span className="text-white font-medium">{profile.sem} ({profile.year})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-[11px]">Department:</span>
                  <span className="text-white font-medium truncate">{profile.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-[11px]">Blood Group:</span>
                  <span className="font-bold text-red-300">{profile.bloodGroup}</span>
                </div>
              </div>

              {/* Barcode Simulator */}
              <div className="bg-white rounded-xl p-2.5 text-gray-800 flex flex-col items-center gap-0.5 font-mono text-[9px]">
                <div className="tracking-widest font-black text-xs">||| | |||| | |||||| || | |||| ||</div>
                <span>UNI-STUDENT-{profile.classRollNo}-2026</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="flex-1 text-xs font-semibold gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print ID Card
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setToastMessage('Virtual student card saved to device.');
                  setShowIdCardModal(false);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Save Digital ID
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DIGITAL HALL TICKET PASS */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-gray-900">Official Campus Hall Ticket</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Card Container */}
            <div className="border-2 border-dashed border-blue-300 rounded-2xl p-5 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 relative space-y-4">
              <div className="flex justify-between items-start gap-4 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100/70 px-2 py-0.5 rounded">
                    {selectedTicket.clubName}
                  </span>
                  <h4 className="text-lg font-black text-gray-900 mt-1">{selectedTicket.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-gray-700 block">
                    PASS-E{selectedTicket.id}-2026
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">● Active Pass</span>
                </div>
              </div>

              {/* Attendee Details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">Attendee Name</span>
                  <span className="font-bold text-gray-800">{profile.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Roll Number</span>
                  <span className="font-bold text-gray-800 font-mono">{profile.classRollNo}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Program / Branch</span>
                  <span className="font-semibold text-gray-800">{profile.course} in {profile.branch}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Gate Reporting</span>
                  <span className="font-bold text-blue-700">{selectedTicket.time.split('-')[0].trim()}</span>
                </div>
              </div>

              {/* Event Logistics */}
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span><strong>Date:</strong> {selectedTicket.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span><strong>Session Hours:</strong> {selectedTicket.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span><strong>Venue Room:</strong> {selectedTicket.venue}</span>
                </div>
              </div>

              {/* Barcode Simulator */}
              <div className="pt-2 text-center border-t border-gray-100">
                <div className="inline-block bg-white p-2.5 rounded-xl border border-gray-200">
                  <div className="font-mono text-xs tracking-widest font-black text-gray-800">
                    |||| || ||||| ||| ||||||| || |||| ||| |||||
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                    UNISPHERE-VERIFIED-GATE-SCANNER-2026
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="flex-1 text-xs font-semibold gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Ticket
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setToastMessage('Hall ticket pass saved to downloads.');
                  setSelectedTicket(null);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Save Pass
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK RSVP MODAL */}
      {rsvpModalEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-gray-900">Confirm Event RSVP</h3>
              </div>
              <button onClick={() => setRsvpModalEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{rsvpModalEvent.clubName}</span>
                <h4 className="font-bold text-sm text-gray-900">{rsvpModalEvent.title}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
                  <span>📅 {rsvpModalEvent.date}</span>
                  <span>📍 {rsvpModalEvent.venue}</span>
                </div>
              </div>

              {/* Student Credentials Summary */}
              <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-700">Student Attendee Credentials:</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-semibold text-gray-800">{profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Class Roll No:</span>
                  <span className="font-mono font-bold text-gray-800">{profile.classRollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Univ Roll No:</span>
                  <span className="font-mono font-bold text-gray-800">{profile.universityRollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Branch & Semester:</span>
                  <span className="font-semibold text-gray-800">{profile.course} {profile.sem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-mono text-gray-800">{profile.email}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 text-[11px] text-emerald-800 border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Seats remaining: {rsvpModalEvent.capacity - (rsvpModalEvent.registeredCount || 0)}. Pass will be issued instantly.</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRsvpModalEvent(null)}
                className="flex-1 text-xs font-semibold"
              >
                Back
              </Button>
              <Button 
                size="sm" 
                onClick={handleConfirmRsvp}
                className="flex-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Confirm My RSVP
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: WINNERS PODIUM MODAL */}
      {winnersModalEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-gray-900">Official Champions Podium</h3>
              </div>
              <button onClick={() => setWinnersModalEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <h4 className="text-base font-extrabold text-gray-900">{winnersModalEvent.title}</h4>
              <p className="text-xs text-gray-500">Organized by {winnersModalEvent.clubName} • Concluded on {winnersModalEvent.date}</p>
            </div>

            {/* Podium list */}
            <div className="space-y-2.5">
              {winnersModalEvent.winners && winnersModalEvent.winners.map((winner, idx) => {
                const medalColors = [
                  'bg-yellow-50 border-yellow-200 text-yellow-900',
                  'bg-gray-50 border-gray-200 text-gray-800',
                  'bg-amber-50 border-amber-200 text-amber-900'
                ];
                const medalIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';

                return (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${medalColors[idx] || 'bg-gray-50 border-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{medalIcon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-gray-900">{winner.name}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white shadow-2xs border border-gray-200">
                            {winner.rank}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{winner.branch}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 block">
                        {winner.prize}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <Button 
                size="sm" 
                onClick={() => setWinnersModalEvent(null)}
                className="w-full text-xs font-bold bg-gray-900 hover:bg-black text-white"
              >
                Close Podium
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ACCREDITED CERTIFICATE OF COMPLETION */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <Award className="w-5 h-5" />
                <h3 className="font-bold text-base text-gray-900">Institutional Certificate of Completion</h3>
              </div>
              <button onClick={() => setSelectedCertificate(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Frame */}
            <div className="border-4 border-double border-amber-300 rounded-2xl p-6 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-center space-y-4 relative">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-extrabold flex items-center justify-center mx-auto text-sm shadow-md">
                  U
                </div>
                <h4 className="text-xs font-bold tracking-widest text-blue-900 uppercase">
                  UNISPHERE UNIVERSITY CAMPUS ACTIVITIES BOARD
                </h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  NAAC Criterion 5.3 Co-Curricular Excellence Accreditation
                </p>
              </div>

              <div className="py-2">
                <p className="text-xs text-gray-500 italic">This is proudly certified to</p>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-1">{profile.name}</h3>
                <p className="text-xs text-gray-600 mt-1 font-mono">
                  Roll No: <strong>{profile.classRollNo}</strong> • {profile.course} in {profile.branch}
                </p>
              </div>

              <p className="text-xs text-gray-700 max-w-lg mx-auto leading-relaxed">
                for active participation, demonstration of technical excellence, and successful completion of 
                the university-level co-curricular competitive event{' '}
                <strong className="text-blue-900 font-extrabold">"{selectedCertificate.title}"</strong> organized by{' '}
                <strong>{selectedCertificate.clubName}</strong> on {selectedCertificate.date}.
              </p>

              {/* Endorsements Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-amber-200/80 text-xs">
                <div>
                  <div className="font-serif italic text-gray-800 text-sm">Dr. Sharma</div>
                  <div className="w-32 border-b border-gray-400 mx-auto my-1" />
                  <span className="text-[10px] text-gray-500 font-medium">Faculty Advisor</span>
                </div>
                <div>
                  <div className="font-serif italic text-gray-800 text-sm">Dr. V. K. Mathur</div>
                  <div className="w-32 border-b border-gray-400 mx-auto my-1" />
                  <span className="text-[10px] text-gray-500 font-medium">Head of Department (CSE)</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] font-mono text-gray-400">
                Credential ID: UNIS-CERT-E{selectedCertificate.id}-2026-{profile.classRollNo}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="flex-1 text-xs font-semibold gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Certificate
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setToastMessage('Accredited certificate PDF downloaded successfully.');
                  setSelectedCertificate(null);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CANCELLATION CONFIRMATION */}
      {cancellingEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-gray-900">Cancel Event Registration?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to cancel your seat pass for <strong>"{cancellingEvent.title}"</strong>? 
                Your seat will be immediately released back to other campus students.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCancellingEvent(null)}
                className="flex-1 text-xs font-semibold"
              >
                Keep My Seat
              </Button>
              <Button 
                size="sm" 
                onClick={confirmCancelRegistration}
                className="flex-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
              >
                Yes, Release Seat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
