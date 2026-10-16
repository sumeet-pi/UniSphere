import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { events, clubs } from '../../data/mockData';
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
  X
} from 'lucide-react';

export function EventDetails() {
  const { id } = useParams();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  const { user, isRegistered, registerForEvent, unregisterFromEvent } = useAuth();
  const event = events.find(e => e.id === (id || 'e1')) || events[0];
  const club = clubs.find(c => c.id === event.clubId) || clubs[0];
  
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
                <Badge variant={event.status === 'Upcoming' ? 'green' : 'gray'}>
                  {event.status}
                </Badge>
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
                    <p className="text-xs text-gray-500 font-medium">Capacity</p>
                    <p className="font-bold text-gray-900">
                      {event.capacity - event.registeredCount} seats left
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card / Registration Box */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
              {registered ? (
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
              ) : (
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
                      className="w-full font-bold shadow-md"
                    >
                      Register Now
                    </Button>
                    <p className="text-[11px] text-center text-gray-400">
                      Instant confirmation • 1-click registration
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
