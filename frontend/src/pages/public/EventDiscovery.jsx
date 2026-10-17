import React, { useState, useEffect } from 'react';
import { 
  getStoredEvents, 
  getStoredClubs, 
  searchCampusStudents, 
  isStudentClubMember, 
  isUserClubMember 
} from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Trophy,
  Award,
  Sparkles,
  Ticket,
  X,
  ExternalLink,
  Shield,
  ShieldCheck, 
  Check,
  Users,
  UserCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function EventDiscovery() {
  const { user, isRegistered, registerForEvent, unregisterFromEvent, joinedClubIds = [] } = useAuth();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  const isCoordinator = user?.role === 'Club Coordinator' || user?.role === 'teacher' || user?.role === 'club_student';
  const isLoggedIn = !!user;

  // Stored events & clubs
  const [allEvents, setAllEvents] = useState(() => getStoredEvents());
  const [allClubs] = useState(() => getStoredClubs());

  // Storage listener for live reactivity
  useEffect(() => {
    const handleStorageChange = () => {
      setAllEvents(getStoredEvents());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all'); // 'all' | 'open' | 'upcoming' | 'past'
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [rsvpModalEvent, setRsvpModalEvent] = useState(null);
  const [winnersModalEvent, setWinnersModalEvent] = useState(null);
  const [ticketModalEvent, setTicketModalEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Team Registration state & Student search
  const [rsvpType, setRsvpType] = useState('individual'); // 'individual' | 'team'
  const [teamName, setTeamName] = useState('');
  const [teammateSearch, setTeammateSearch] = useState('');
  const [showTeammateDropdown, setShowTeammateDropdown] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  const categories = ['All', 'Technical', 'Workshop', 'Hackathon', 'Cultural', 'Competitions'];

  // Helper to determine stage
  const getEventStage = (evt) => {
    if (evt.stage) return evt.stage;
    if (evt.status === 'Past') return 'past';
    if (evt.status === 'Closed') return 'closed';
    if (evt.status === 'Upcoming' && evt.registrationOpens) return 'upcoming';
    return 'open';
  };

  // Filter logic
  const filteredEvents = allEvents.filter(event => {
    const stage = getEventStage(event);

    // Stage filter
    if (selectedStage === 'open' && stage !== 'open') return false;
    if (selectedStage === 'upcoming' && stage !== 'upcoming') return false;
    if (selectedStage === 'past' && stage !== 'past') return false;

    // Search filter
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory = selectedCategory === 'All' ? true : 
      event.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      event.description.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (event.category && event.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  // Stage counts for pills
  const openCount = allEvents.filter(e => getEventStage(e) === 'open').length;
  const upcomingCount = allEvents.filter(e => getEventStage(e) === 'upcoming').length;
  const pastCount = allEvents.filter(e => getEventStage(e) === 'past').length;

  const handleOpenRsvpModal = (event) => {
    setRsvpModalEvent(event);
    setRsvpType('individual');
    setTeamName('');
    setTeammateSearch('');
    setTeamMembers([]);
    setShowTeammateDropdown(false);
  };

  const handleAddTeammate = (student) => {
    if (teamMembers.length >= 3) {
      alert('Maximum team size is 4 members (1 Team Lead + 3 Teammates).');
      return;
    }
    const myId = user?.classRollNo || user?.collegeId || 'CS24089';
    if (student.collegeId === myId || student.classRollNo === myId) {
      alert('You are already the Team Lead!');
      return;
    }
    if (teamMembers.some(m => m.collegeId === student.collegeId)) {
      return;
    }
    setTeamMembers(prev => [...prev, student]);
    setTeammateSearch('');
    setShowTeammateDropdown(false);
  };

  const handleRemoveTeammate = (collegeId) => {
    setTeamMembers(prev => prev.filter(m => m.collegeId !== collegeId));
  };

  // Handle Quick RSVP
  const handleConfirmRsvp = () => {
    if (!rsvpModalEvent) return;
    if (rsvpType === 'team' && !teamName.trim()) {
      alert('Please enter a team name before confirming.');
      return;
    }
    registerForEvent(rsvpModalEvent.id);
    const eventName = rsvpModalEvent.title;
    const msg = rsvpType === 'team'
      ? `Team "${teamName.trim()}" (${teamMembers.length + 1} members) confirmed for "${eventName}"!`
      : `Seat confirmed for "${eventName}"! Entry pass issued.`;
    setRsvpModalEvent(null);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Calendar className="w-80 h-80 text-white" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> UniSphere Official Activities
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Campus Events & Activities
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Explore hackathons, technical workshops, cultural fests, and guest masterclasses organized across student clubs. 
            Filter by stage to register for active events, preview upcoming announcements, or view winners from concluded competitions.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-blue-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Free Verified Student Entry
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-300" /> Official NAAC Certified Turnout
            </span>
          </div>
        </div>
      </div>

      {/* Stage Tabs Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-gray-200">
        <div className="flex p-1 bg-gray-100 rounded-2xl gap-1 overflow-x-auto w-full md:w-auto scrollbar-none">
          <button
            onClick={() => setSelectedStage('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              selectedStage === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Events ({allEvents.length})
          </button>
          
          <button
            onClick={() => setSelectedStage('open')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedStage === 'open'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedStage === 'open' ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`}></span>
            Open for RSVP ({openCount})
          </button>

          <button
            onClick={() => setSelectedStage('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedStage === 'upcoming'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Opening Soon ({upcomingCount})
          </button>

          <button
            onClick={() => setSelectedStage('past')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedStage === 'past'
                ? 'bg-gray-800 text-white shadow-xs'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Past & Winners ({pastCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search event, club, or venue..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs sm:text-sm bg-white"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => {
          const registered = isRegistered ? isRegistered(event.id) : false;
          const stage = getEventStage(event);
          const club = allClubs.find(c => c.id === event.clubId);

          return (
            <div 
              key={event.id} 
              className="flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Event Image Banner */}
              <div className="h-48 w-full relative overflow-hidden bg-gray-900 block">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${stage === 'past' ? 'grayscale-25 opacity-85' : 'opacity-95'}`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/20" />
                
                {/* Stage Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  {stage === 'open' && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Open for RSVP
                    </span>
                  )}
                  {stage === 'closed' && (
                    <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
                      Registration Closed
                    </span>
                  )}
                  {stage === 'upcoming' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-600 text-white shadow-sm">
                      <Lock className="w-3 h-3" /> Opening Soon
                    </span>
                  )}
                  {stage === 'past' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-200 border border-gray-700 shadow-sm">
                      <Trophy className="w-3 h-3 text-amber-400" /> Completed
                    </span>
                  )}

                  {/* Registered indicator */}
                  {registered && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                      <CheckCircle2 className="w-3 h-3" /> Registered
                    </span>
                  )}
                </div>

                {/* Capacity Fill Meter on banner */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                  <span className="font-semibold">{event.registeredCount || 0} / {event.capacity || 100} seats filled</span>
                  <span className="font-mono text-gray-300">
                    {Math.round(((event.registeredCount || 0) / (event.capacity || 100)) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Event Body */}
              <div className="flex-grow flex flex-col p-5">
                {/* Organizing Club Header Link */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Link 
                    to={`${basePath}/explore/${event.clubId}`}
                    className="text-xs font-bold text-blue-600 tracking-wider uppercase hover:underline truncate flex items-center gap-1"
                  >
                    <span>{event.clubName}</span>
                    <ExternalLink className="w-3 h-3 text-blue-500" />
                  </Link>

                  <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {event.category || 'Technical'}
                  </span>
                </div>

                {/* Event Title */}
                <Link to={`${basePath}/events/${event.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                </Link>

                <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {event.description}
                </p>

                {/* Past Winners Highlight if Concluded */}
                {stage === 'past' && event.winners && event.winners.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div className="truncate">
                      <span>1st Place: <strong>{event.winners[0]?.student}</strong></span>
                      <span className="text-[11px] text-amber-700 block truncate font-medium">{event.winners[0]?.project}</span>
                    </div>
                  </div>
                )}
                
                {/* Logistics Strip */}
                <div className="space-y-1.5 text-xs text-gray-600 mb-4 flex-grow bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                {/* Role-Aware & Stage-Aware Contextual Action Buttons */}
                <div className="mt-auto pt-2 border-t border-gray-100">
                  {isCoordinator ? (
                    /* Coordinator Perspective: administrative status, no student registration button */
                    <div className="flex items-center gap-2">
                      <Link to={`/club-dashboard/events`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-1">
                          Manage in Console &rarr;
                        </Button>
                      </Link>
                      <Link to={`${basePath}/events/${event.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                          Preview
                        </Button>
                      </Link>
                    </div>
                  ) : stage === 'open' ? (
                    /* Open Event: Register or View Pass */
                    <div className="flex items-center gap-2">
                      {registered ? (
                        <Button 
                          onClick={() => setTicketModalEvent(event)} 
                          size="sm" 
                          className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-xs"
                        >
                          <Ticket className="w-3.5 h-3.5" /> View Ticket
                        </Button>
                      ) : isUserClubMember(event.clubId, joinedClubIds, user) ? (
                        <div className="relative group flex-1">
                          <Button 
                            disabled 
                            size="sm" 
                            className="w-full text-xs bg-amber-50 text-amber-900 border border-amber-200 cursor-not-allowed font-semibold gap-1.5"
                          >
                            <Shield className="w-3.5 h-3.5 text-amber-600" /> Club Member (Cannot RSVP)
                          </Button>
                          <div className="hidden group-hover:block absolute bottom-full mb-1 left-0 right-0 z-30 p-2.5 bg-gray-900 text-white text-[11px] rounded-xl shadow-xl text-center">
                            You are an official member of {event.clubName}. Club members coordinate events and cannot register as participants.
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleOpenRsvpModal(event)} 
                          size="sm" 
                          className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Quick RSVP
                        </Button>
                      )}
                      <Link to={`${basePath}/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Details
                        </Button>
                      </Link>
                    </div>
                  ) : stage === 'upcoming' ? (
                    /* Upcoming Event: Opening Soon */
                    <div className="flex items-center gap-2">
                      <Button 
                        disabled 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs text-purple-700 border-purple-200 bg-purple-50/50 cursor-not-allowed gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" /> Opening Soon
                      </Button>
                      <Link to={`${basePath}/events/${event.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-purple-700 font-semibold">
                          Schedule
                        </Button>
                      </Link>
                    </div>
                  ) : stage === 'past' ? (
                    /* Past Event: View Winners Podium */
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => setWinnersModalEvent(event)} 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs border-amber-300 text-amber-800 hover:bg-amber-50 font-bold gap-1.5 shadow-xs"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600" /> Winners List
                      </Button>
                      <Link to={`${basePath}/events/${event.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-600">
                          Recap &rarr;
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    /* Registration Closed */
                    <div className="flex items-center gap-2">
                      <Button disabled size="sm" variant="outline" className="flex-1 text-xs text-gray-400 bg-gray-50 cursor-not-allowed">
                        Closed
                      </Button>
                      <Link to={`${basePath}/events/${event.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                          Details
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-xs">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg">No campus events match your criteria</h3>
            <p className="text-gray-500 text-sm mt-1">Try switching to "All Events" or searching with a different keyword.</p>
            <Button 
              onClick={() => { setSelectedStage('all'); setSelectedCategory('All'); setSearchTerm(''); }} 
              variant="outline" 
              size="sm" 
              className="mt-4 text-xs"
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>

      {/* QUICK RSVP MODAL */}
      {rsvpModalEvent && (() => {
        const isClubMemberOfThisEvent = isUserClubMember(rsvpModalEvent.clubId, joinedClubIds, user);

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">Event RSVP & Registration</h3>
                    <p className="text-xs text-gray-500">Free admission for registered students</p>
                  </div>
                </div>
                <button onClick={() => setRsvpModalEvent(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Brief Header */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">{rsvpModalEvent.title}</h4>
                <p className="text-xs text-blue-700 font-semibold">{rsvpModalEvent.clubName}</p>
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-xs text-gray-600 border-t border-blue-100">
                  <span>Date: <strong>{rsvpModalEvent.date}</strong></span>
                  <span>Time: <strong>{rsvpModalEvent.time}</strong></span>
                  <span className="col-span-2">Venue: <strong>{rsvpModalEvent.venue}</strong></span>
                </div>
              </div>

              {/* CLUB MEMBERSHIP RESTRICTION CHECK */}
              {isClubMemberOfThisEvent ? (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-amber-950">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <span>Organizing Club Member Restriction</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    You are registered as an official member of <strong>{rsvpModalEvent.clubName}</strong>.
                    Per college policy, club members cannot register as participants for events organized by their own club.
                  </p>
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setRsvpModalEvent(null)} 
                      className="w-full text-xs font-semibold"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Registration Mode Switcher: Individual vs Team */}
                  <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRsvpType('individual')}
                      className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        rsvpType === 'individual' 
                          ? 'bg-white text-blue-700 shadow-xs font-bold' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Individual Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpType('team')}
                      className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        rsvpType === 'team' 
                          ? 'bg-white text-blue-700 shadow-xs font-bold' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> Team Registration
                    </button>
                  </div>

                  {rsvpType === 'individual' ? (
                    /* Attendee Info Pre-fill for Individual RSVP */
                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-gray-700 uppercase tracking-wider">Attendee Student Pass</p>
                      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Student Name</span>
                          <span className="font-semibold">{user?.name || 'Vikram Singh'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">College ID</span>
                          <span className="font-semibold font-mono">{user?.classRollNo || 'CS24089'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Academic Program</span>
                          <span className="font-semibold">{user?.course || 'B.Tech CSE'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">College Email</span>
                          <span className="font-semibold truncate block">{user?.email || 'vikram.singh@college.edu'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Team Registration with Live Student Search beneath the input */
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Team Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Byte Busters, DevHacks Squad..."
                          value={teamName}
                          onChange={e => setTeamName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required
                        />
                      </div>

                      {/* Live Student Search with Dropdown beneath the input */}
                      <div className="relative">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Add Teammates (Search Campus Directory)
                        </label>
                        <div className="relative">
                          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Type student name or roll number (e.g. Ayush, CS24012)..."
                            value={teammateSearch}
                            onChange={e => {
                              setTeammateSearch(e.target.value);
                              setShowTeammateDropdown(true);
                            }}
                            onFocus={() => {
                              if (teammateSearch.trim().length > 0) setShowTeammateDropdown(true);
                            }}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>

                        {/* Dropdown rendered beneath the input */}
                        {showTeammateDropdown && teammateSearch.trim().length > 0 && (() => {
                          const matches = searchCampusStudents(teammateSearch);
                          if (matches.length === 0) return null;
                          return (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-2xl border border-blue-200 overflow-hidden max-h-52 overflow-y-auto divide-y divide-gray-100">
                              <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-[11px] font-bold text-blue-900">
                                <span>Campus Directory ({matches.length})</span>
                                <button type="button" onClick={() => setShowTeammateDropdown(false)} className="text-gray-400 hover:text-gray-600">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {matches.map(student => {
                                const myRoll = user?.classRollNo || user?.collegeId || 'CS24089';
                                const isMe = student.collegeId === myRoll || student.classRollNo === myRoll;
                                const isAlreadyAdded = teamMembers.some(m => m.collegeId === student.collegeId);
                                const isTeammateClubMember = isStudentClubMember(rsvpModalEvent.clubId, student.collegeId);

                                return (
                                  <div key={student.id} className="p-2.5 hover:bg-gray-50 flex items-center justify-between gap-2.5 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <img src={student.avatar} alt={student.name} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                                      <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{student.name}</p>
                                        <p className="text-[10px] text-gray-500 font-mono truncate">{student.collegeId} • {student.department}</p>
                                      </div>
                                    </div>

                                    {isTeammateClubMember ? (
                                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 flex-shrink-0" title="Member of this club: cannot participate">
                                        <Shield className="w-3 h-3 text-amber-600" /> Club Member
                                      </span>
                                    ) : isMe ? (
                                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">
                                        You (Lead)
                                      </span>
                                    ) : isAlreadyAdded ? (
                                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                                        ✓ Added
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleAddTeammate(student)}
                                        className="text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 px-2.5 py-1 rounded-lg flex-shrink-0 transition-colors"
                                      >
                                        + Add Teammate
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Team Roster Summary */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                          Team Roster ({1 + teamMembers.length}/4 Members)
                        </p>
                        <div className="space-y-1.5">
                          {/* Team Lead */}
                          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                                {(user?.name || 'V').charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                                  {user?.name || 'Vikram Singh'}
                                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-1.5 py-0.2 rounded">Team Lead</span>
                                </p>
                                <p className="text-[10px] text-gray-500 font-mono">{user?.classRollNo || 'CS24089'} • {user?.course || 'B.Tech CSE'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Added Teammates */}
                          {teamMembers.map(tm => (
                            <div key={tm.id || tm.collegeId} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <img src={tm.avatar} alt={tm.name} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                                <div>
                                  <p className="font-bold text-gray-900">{tm.name}</p>
                                  <p className="text-[10px] text-gray-500 font-mono">{tm.collegeId} • {tm.department} ({tm.year})</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTeammate(tm.collegeId)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-lg"
                                title="Remove Teammate"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                    <Button variant="outline" size="sm" onClick={() => setRsvpModalEvent(null)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConfirmRsvp} 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 shadow-sm"
                    >
                      {rsvpType === 'team' ? `Confirm Team RSVP (${teamMembers.length + 1})` : 'Confirm Individual RSVP'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* WINNERS PODIUM MODAL */}
      {winnersModalEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">Event Champions & Podium</h3>
                  <p className="text-xs text-gray-500">Official verified results for {winnersModalEvent.title}</p>
                </div>
              </div>
              <button onClick={() => setWinnersModalEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {winnersModalEvent.winners && winnersModalEvent.winners.length > 0 ? (
                winnersModalEvent.winners.map((champ, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                      idx === 0 
                        ? 'bg-amber-50/80 border-amber-200' 
                        : idx === 1 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-orange-50/50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm">{champ.student}</p>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                            {champ.rank}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">Project: <strong>{champ.project}</strong></p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-300">
                        {champ.prize}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-bold text-gray-800">Results are being certified.</p>
                  <p className="text-xs text-gray-400 mt-1">Faculty advisors will release the official marksheet soon.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">Total attendees: {winnersModalEvent.registeredCount}</span>
              <Link to={`${basePath}/events/${winnersModalEvent.id}`}>
                <Button size="sm" className="text-xs font-semibold gap-1">
                  Full Event Recap & Podium &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TICKET PASS MODAL */}
      {ticketModalEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="flex justify-end">
              <button onClick={() => setTicketModalEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Ticket className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Verified Admission Ticket
              </span>
              <h3 className="font-extrabold text-gray-900 text-lg mt-2">{ticketModalEvent.title}</h3>
              <p className="text-xs text-blue-600 font-semibold">{ticketModalEvent.clubName}</p>
            </div>

            {/* Ticket Card Stub */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Attendee:</span>
                <span className="font-bold text-gray-900">{user?.name || 'Vikram Singh'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">College Roll No:</span>
                <span className="font-mono font-bold text-gray-900">{user?.classRollNo || 'CS24089'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Date & Time:</span>
                <span className="font-semibold text-gray-900">{ticketModalEvent.date} • {ticketModalEvent.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Venue:</span>
                <span className="font-semibold text-gray-900">{ticketModalEvent.venue}</span>
              </div>
            </div>

            {/* Barcode Simulator */}
            <div className="p-3 bg-gray-100 rounded-xl flex flex-col items-center gap-1 font-mono text-[10px] text-gray-500">
              <div className="tracking-widest font-black text-gray-800 text-xs">||| | |||| | |||||| || | |||| ||</div>
              <span>PASS-{ticketModalEvent.id.toUpperCase()}-2026-CONFIRMED</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTicketModalEvent(null)}
                className="w-full text-xs font-semibold"
              >
                Close Pass
              </Button>
              <Link to={`${basePath}/events/${ticketModalEvent.id}`} className="w-full">
                <Button size="sm" className="w-full text-xs font-semibold">
                  Event Page &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
