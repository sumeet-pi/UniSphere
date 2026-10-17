import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { events, clubs, getStoredEvents } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  AlertCircle,
  Share2,
  Ticket,
  X,
  Trophy,
  Award,
  Lock,
  ExternalLink,
  LayoutDashboard
} from 'lucide-react';

export function EventDetails() {
  const { id } = useParams();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  const { user, isRegistered, registerForEvent, unregisterFromEvent } = useAuth();
  const allEvents = getStoredEvents();
  const event = allEvents.find(e => e.id === (id || 'e1')) || allEvents[0];
  const club = clubs.find(c => c.id === event.clubId) || clubs[0];
  
  // Role detection: distinguish General Student from Club Coordinator
  const isCoordinator = user?.role === 'Club Coordinator' || user?.role === 'teacher' || user?.role === 'club_student';
  const isStudent = user?.role === 'General Student';
  const isLoggedIn = !!user;

  // Determine event stage: 'open' | 'closed' | 'upcoming' | 'past'
  const getEventStage = (evt) => {
    if (evt?.eventStage) return evt.eventStage;
    if (evt?.status === 'Past') return 'past';
    if (evt?.status === 'Closed') return 'closed';
    if (evt?.status === 'Upcoming' && evt?.registrationOpens) return 'upcoming';
    return 'open';
  };
  const eventStage = getEventStage(event);

  const registered = isRegistered ? isRegistered(event.id) : false;

  const [showRegModal, setShowRegModal] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const otherEvents = events.filter(e => e.clubId === event.clubId && e.id !== event.id);

  const handleConfirmRegistration = () => {
    registerForEvent(event.id);
    setShowRegModal(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  const handleCancelRegistration = () => {
    unregisterFromEvent(event.id);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Top Banner */}
      <div className="h-72 w-full relative overflow-hidden bg-gray-900">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute top-6 left-0 right-0">
          <Link to={`${basePath}/events`}>
            <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Events
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        {/* Success Toast */}
        {successToast && (
          <div className="mb-6 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-white" />
              <div>
                <p className="font-bold text-sm sm:text-base">You are officially registered for {event.title}!</p>
                <p className="text-xs text-emerald-100">Your student pass is active. You can review it anytime under My Registrations.</p>
              </div>
            </div>
            <Link to="/student/registrations">
              <Button size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50 border-0 font-bold text-xs">
                View Pass
              </Button>
            </Link>
          </div>
        )}

        {/* Event Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-3">
                <Link 
                  to={`${basePath}/explore/${event.clubId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {event.clubName}
                </Link>
                {eventStage === 'open' && (
                  <Badge variant="green" className="bg-emerald-600 text-white font-bold text-xs shadow-xs">
                    ● Open for Registration
                  </Badge>
                )}
                {eventStage === 'closed' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-600 text-white px-3 py-1 rounded-full shadow-xs">
                    <Lock className="w-3.5 h-3.5" /> Registration Closed
                  </span>
                )}
                {eventStage === 'upcoming' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500 text-white px-3 py-1 rounded-full shadow-xs">
                    <Clock className="w-3.5 h-3.5" /> Upcoming • Opens Soon
                  </span>
                )}
                {eventStage === 'past' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-gray-900 text-gray-200 px-3 py-1 rounded-full shadow-xs border border-gray-700">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Past Event • Concluded
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                {event.title}
              </h1>

              {/* Quick Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 rounded-xl bg-gray-50/80 border border-gray-100 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Date</p>
                    <p className="font-bold text-gray-900">{event.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Time</p>
                    <p className="font-bold text-gray-900">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Venue</p>
                    <p className="font-bold text-gray-900 truncate">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      {eventStage === 'past' ? 'Attendance' : 'Capacity'}
                    </p>
                    <p className="font-bold text-gray-900">
                      {eventStage === 'past' 
                        ? `${event.registeredCount || 150} Attendees` 
                        : `${event.capacity - event.registeredCount} seats left`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card / Right-Side Contextual Box */}
            {isCoordinator ? (
              /* CASE 1: Club Coordinator Perspective (no registration buttons) */
              <div className="w-full lg:w-80 flex-shrink-0 bg-gradient-to-b from-indigo-50/70 via-blue-50/40 to-white p-6 rounded-2xl border border-indigo-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-indigo-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">
                      Coordinator Perspective
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Operational Status</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {eventStage === 'open' && 'Event is actively accepting verified student registrations.'}
                    {eventStage === 'upcoming' && `Announced event. Registrations open on ${event.registrationOpens || 'soon'}.`}
                    {eventStage === 'past' && 'Event has concluded. Podium winners officially awarded.'}
                  </p>
                </div>

                <div className="my-4 p-3 bg-white rounded-xl border border-indigo-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Live Enrollment:</span>
                    <span className="font-bold text-gray-900">{event.registeredCount} / {event.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>{Math.round((event.registeredCount / event.capacity) * 100)}% filled</span>
                    <span>{event.capacity - event.registeredCount} spots remain</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {eventStage === 'past' && (
                    <a href="#event-winners">
                      <Button variant="outline" className="w-full text-xs font-bold text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 gap-1.5 mb-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" /> View Official Winners List
                      </Button>
                    </a>
                  )}
                  <Link to="/club-dashboard">
                    <Button className="w-full text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs">
                      <LayoutDashboard className="w-3.5 h-3.5" /> Manage in Club Dashboard
                    </Button>
                  </Link>
                  <p className="text-[11px] text-center text-gray-400">
                    Student registration controls are hidden in coordinator view.
                  </p>
                </div>
              </div>
            ) : eventStage === 'past' ? (
              /* CASE 2: Past Event (Concluded) */
              <div className="w-full lg:w-80 flex-shrink-0 bg-gradient-to-b from-amber-50/30 via-white to-white p-6 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Event Concluded
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-lg mt-2">Official Winners Declared</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Registrations for this event are closed. Awards and certificates have been conferred.
                  </p>
                </div>

                {event.winners && event.winners[0] && (
                  <div className="my-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                    <p className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider">🥇 1st Place Champion</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{event.winners[0].name}</p>
                    <p className="text-[11px] text-gray-500">{event.winners[0].branch}</p>
                  </div>
                )}

                <div>
                  <a href="#event-winners">
                    <Button className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-100" /> View Winners Podium & Prizes
                    </Button>
                  </a>
                </div>
              </div>
            ) : eventStage === 'upcoming' ? (
              /* CASE 3: Upcoming Event (Not Open Yet) */
              <div className="w-full lg:w-80 flex-shrink-0 bg-gradient-to-b from-amber-50/40 via-white to-white p-6 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Registrations Not Open
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-lg mt-2">Opening Soon</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Official registration window will open for UniSphere students soon.
                  </p>
                </div>

                <div className="my-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Registration Opens:</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
                    {event.registrationOpens || 'Oct 25, 2026 • 10:00 AM'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button 
                    disabled 
                    className="w-full bg-amber-100 text-amber-800 border-amber-200 cursor-not-allowed font-bold text-xs gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Opening Soon
                  </Button>
                  <p className="text-[11px] text-center text-gray-400">
                    Registration will be free for all eligible students.
                  </p>
                </div>
              </div>
            ) : eventStage === 'closed' ? (
              /* CASE 4: Registration Closed */
              <div className="w-full lg:w-80 flex-shrink-0 bg-gradient-to-b from-rose-50/40 via-white to-white p-6 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                    Registration Closed
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-lg mt-2">Admissions Locked</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    The registration window for this event is now officially closed.
                  </p>
                </div>

                <div className="my-4 p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Final Enrollment Count:</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
                    {event.registeredCount} / {event.capacity} seats filled
                  </p>
                </div>

                {isStudent && registered ? (
                  <div className="space-y-2">
                    <Link to="/student/registrations">
                      <Button className="w-full text-xs shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                        View Your Confirmed Pass
                      </Button>
                    </Link>
                    <p className="text-[11px] text-center text-emerald-700 font-semibold">
                      Your admission ticket CS24089 remains active!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      disabled 
                      className="w-full bg-rose-100 text-rose-800 border border-rose-200 cursor-not-allowed font-bold text-xs gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-600" /> Registrations Closed
                    </Button>
                    <p className="text-[11px] text-center text-gray-400">
                      Check back for future event announcements.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* CASE 5: Open Event (Active Registrations) */
              <div className="w-full lg:w-80 flex-shrink-0 bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                {isStudent && registered ? (
                  <div className="text-center py-2 space-y-3">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <Ticket className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Ticket Confirmed!</h3>
                      <p className="text-xs text-gray-500 mt-1">Pass ID: #CP-{event.id.toUpperCase()}-2026</p>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <Link to="/student/registrations">
                        <Button className="w-full text-xs shadow-sm">
                          View in My Registrations
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelRegistration}
                        className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancel Registration
                      </Button>
                    </div>
                  </div>
                ) : isStudent ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Entry Fee</span>
                        <span className="text-2xl font-black text-emerald-600">FREE</span>
                      </div>
                      <p className="text-xs text-gray-500">Exclusive for college students with valid campus ID.</p>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        size="lg" 
                        onClick={() => setShowRegModal(true)}
                        className="w-full font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Register Now
                      </Button>
                      <p className="text-[11px] text-center text-gray-400">
                        Instant confirmation • 1-click registration
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Entry Fee</span>
                        <span className="text-2xl font-black text-emerald-600">FREE</span>
                      </div>
                      <p className="text-xs text-gray-500">Sign in with your student account to register and receive your event pass.</p>
                    </div>

                    <div className="space-y-2">
                      <Link to="/login">
                        <Button 
                          size="lg" 
                          className="w-full font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Log In to Register
                        </Button>
                      </Link>
                      <p className="text-[11px] text-center text-gray-400">
                        College student ID verification required
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Winners Podium Section for Past Events */}
            {eventStage === 'past' && (
              <Card id="event-winners" className="border-amber-200 shadow-md overflow-hidden scroll-mt-24">
                <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                      <Trophy className="w-7 h-7 text-yellow-200" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">Event Champions & Winners List</h2>
                      <p className="text-xs text-amber-100 mt-0.5">
                        Official competition results certified by {event.clubName}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 hidden sm:inline-flex">
                    🏁 Concluded on {event.date}
                  </span>
                </div>

                <CardContent className="p-6 space-y-4 bg-amber-50/20">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {event.winners && event.winners.map((winner, idx) => {
                      const isGold = idx === 0 || winner.rank.includes('1st');
                      const isSilver = idx === 1 || winner.rank.includes('2nd');
                      const isBronze = idx === 2 || winner.rank.includes('3rd');

                      return (
                        <div 
                          key={idx}
                          className={`p-5 rounded-2xl border text-center flex flex-col justify-between transition-all ${
                            isGold 
                              ? 'bg-gradient-to-b from-amber-50 via-yellow-50/50 to-white border-amber-300 shadow-sm sm:-translate-y-1' 
                              : isSilver 
                                ? 'bg-gradient-to-b from-slate-50 to-white border-slate-300' 
                                : 'bg-gradient-to-b from-orange-50/40 to-white border-orange-200'
                          }`}
                        >
                          <div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-xs ${
                              isGold 
                                ? 'bg-amber-500 text-white shadow-amber-200' 
                                : isSilver 
                                  ? 'bg-slate-400 text-white' 
                                  : 'bg-amber-700 text-white'
                            }`}>
                              {isGold ? '🥇' : isSilver ? '🥈' : '🥉'}
                            </div>

                            <span className={`inline-block text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2 ${
                              isGold ? 'bg-amber-200/80 text-amber-900' : isSilver ? 'bg-slate-200 text-slate-800' : 'bg-orange-200/80 text-orange-900'
                            }`}>
                              {winner.rank}
                            </span>

                            <h3 className="font-extrabold text-gray-900 text-base">
                              {winner.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">{winner.branch}</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                              <Award className="w-3.5 h-3.5 text-emerald-600" />
                              {winner.prize}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Event Notice Banner */}
            {eventStage === 'upcoming' && (
              <div className="p-5 bg-gradient-to-r from-amber-50 via-yellow-50 to-white border border-amber-200 rounded-2xl flex items-start gap-3.5 text-amber-950 shadow-2xs">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-900">Upcoming Event — Registrations Opening Soon</h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Registrations for <strong>{event.title}</strong> will officially open on <strong>{event.registrationOpens || 'Oct 25, 2026 • 10:00 AM'}</strong>. You will be able to register in 1-click once the portal opens.
                  </p>
                </div>
              </div>
            )}

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Other Events from this Club */}
            {otherEvents.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">More from {event.clubName}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {otherEvents.map(oe => (
                    <Card key={oe.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{oe.title}</h4>
                        <p className="text-xs text-gray-500 mb-3">{oe.date} • {oe.time}</p>
                        <Link to={`${basePath}/events/${oe.id}`}>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            View Event
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900">Rules & Guidelines</h3>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2.5 text-gray-600 text-sm">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900">Host Club</h3>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 mb-4">
                  <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                  <div>
                    <h4 className="font-bold text-gray-900">{club.name}</h4>
                    <p className="text-xs text-blue-600">{club.category}</p>
                  </div>
                </div>
                <Link to={`${basePath}/explore/${club.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Club Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Confirmation Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <div className="flex items-center gap-2 text-blue-700">
                <Ticket className="w-5 h-5" />
                <h3 className="font-bold text-lg text-gray-900">Confirm Registration</h3>
              </div>
              <button onClick={() => setShowRegModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Event</p>
                <h4 className="font-bold text-gray-900 text-lg mt-0.5">{event.title}</h4>
                <p className="text-xs text-gray-500">{event.date} • {event.time} • {event.venue}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Attendee:</span>
                  <span className="font-bold text-gray-900">{user?.name || 'Vikram Singh'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">College ID:</span>
                  <span className="font-bold text-gray-900">CS24089</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-bold text-gray-900">Computer Science (CSE)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Your admission ticket will be added to your profile immediately.</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowRegModal(false)}>Cancel</Button>
              <Button onClick={handleConfirmRegistration}>Complete Registration</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
