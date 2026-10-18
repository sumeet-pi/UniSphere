import React, { useState, useEffect } from 'react';
import { getStoredEvents } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  Ticket, 
  Award, 
  Trophy, 
  Download, 
  Printer, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Search,
  Check,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function MyRegistrations() {
  const { user, registeredEventIds, unregisterFromEvent } = useAuth();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  // Stored state
  const [allEvents, setAllEvents] = useState(() => getStoredEvents());
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & notifications
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [cancellingEvent, setCancellingEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync state if localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setAllEvents(getStoredEvents());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter events
  const registeredEvents = allEvents.filter(e => registeredEventIds.includes(e.id) && e.status !== 'Past');
  const pastEvents = allEvents.filter(e => e.status === 'Past');

  // Filtered lists based on search
  const filteredUpcoming = registeredEvents.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPast = pastEvents.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Cancellation with Modal
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Ticket className="w-80 h-80 text-white" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Verified Admissions & Passes
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            My Event Registrations & Passes
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Manage your reserved campus seats, download verified digital hall tickets, and access accredited participation certificates for completed institutional events.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-blue-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> QR-Verified Admission Passes
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <Award className="w-3.5 h-3.5 text-amber-300" /> NAAC Criterion 5 Certified Records
            </span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-all border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Ticket className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reserved Passes</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{registeredEvents.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Upcoming on campus</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Events Attended</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{pastEvents.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Completed sessions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Accredited
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Certificates Ready</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{pastEvents.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Available for instant download</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                Co-Curricular
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Learning Hours</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">18 Hrs</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Logged toward student credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-200">
        <div className="flex p-1 bg-gray-100 rounded-2xl gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-blue-600" />
            Active Passes ({registeredEvents.length})
          </button>
          
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'past'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            Past Events & Certificates ({pastEvents.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-72 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by event, club, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            />
          </div>
          <Link to={`${basePath}/events`}>
            <Button size="sm" variant="outline" className="text-xs font-semibold whitespace-nowrap gap-1">
              Explore Events <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* TAB 1: ACTIVE PASSES (UPCOMING) */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {filteredUpcoming.length > 0 ? (
            filteredUpcoming.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-3xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Event Thumbnail Banner */}
                  <div className="w-full lg:w-64 h-52 lg:h-auto flex-shrink-0 relative bg-gray-900">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/30" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                        <Check className="w-3 h-3" /> Confirmed Seat
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[10px] font-mono text-gray-300">PASS-{event.id.toUpperCase()}-2026</p>
                    </div>
                  </div>

                  {/* Pass Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <div>
                          <Link 
                            to={`${basePath}/explore/${event.clubId}`}
                            className="text-xs font-extrabold text-blue-600 uppercase tracking-wider hover:underline flex items-center gap-1"
                          >
                            <span>Organized by {event.clubName}</span>
                            <ExternalLink className="w-3 h-3 text-blue-500" />
                          </Link>
                          <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">{event.title}</h3>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                          <Ticket className="w-3.5 h-3.5" /> Admission Pass Ready
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 mt-2">
                        {event.description}
                      </p>

                      {/* Logistics Strip */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs text-gray-700 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Session Date</span>
                            <span className="font-bold">{event.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Reporting Time</span>
                            <span className="font-bold">{event.time}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 truncate">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <span className="text-[10px] text-gray-400 block font-medium">Campus Venue</span>
                            <span className="font-bold truncate block">{event.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Present digital pass or college ID at the entry gate</span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCancellingEvent(event)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Cancel Pass
                        </Button>

                        <Button 
                          onClick={() => setSelectedTicket(event)}
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                        >
                          <Ticket className="w-3.5 h-3.5" /> View Digital Ticket
                        </Button>

                        <Link to={`${basePath}/events/${event.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 text-lg">No active event registrations</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 mb-5 max-w-md mx-auto">
                You haven't reserved seats for any upcoming events. Explore active hackathons, coding workshops, and seminars across campus clubs.
              </p>
              <Link to={`${basePath}/events`}>
                <Button className="font-bold text-xs shadow-md">Browse Campus Events</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAST EVENTS & CERTIFICATES */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {filteredPast.length > 0 ? (
            filteredPast.map((event) => (
              <div 
                key={event.id}
                className="bg-white rounded-3xl border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 h-36 sm:h-auto flex-shrink-0 relative bg-gray-900">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-75 grayscale-30" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-200 border border-gray-700">
                        Concluded
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-1">
                        <div>
                          <Link 
                            to={`${basePath}/explore/${event.clubId}`}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            {event.clubName}
                          </Link>
                          <h3 className="text-lg font-bold text-gray-900 mt-0.5">{event.title}</h3>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Participation Verified
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-1">
                        Held on <strong>{event.date}</strong> at {event.venue} • Total Turnout: {event.registeredCount} Students
                      </p>

                      {/* Winners Preview if applicable */}
                      {event.winners && event.winners.length > 0 && (
                        <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                          <Trophy className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>1st Place Winner: <strong>{event.winners[0]?.student}</strong> ({event.winners[0]?.project || 'Champion'})</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
                      <span className="text-[11px] text-gray-400">Institutional NAAC Criterion 5 Accredited</span>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => setSelectedCertificate(event)}
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50 font-bold gap-1.5 shadow-xs"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-600" /> Download Certificate
                        </Button>

                        <Link to={`${basePath}/events/${event.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-gray-600">
                            Podium & Details &rarr;
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 text-lg">No past event records</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Concluded events you attend will appear here with participation certificates.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: DIGITAL TICKET PASS */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <Ticket className="w-4 h-4" />
                <span>UniSphere Digital Hall Pass</span>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Card Body */}
            <div className="border border-dashed border-gray-300 rounded-2xl p-5 bg-gradient-to-b from-blue-50/50 via-white to-gray-50/50 space-y-4 text-center">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-emerald-200">
                Confirmed Admission Pass
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-gray-900">{selectedTicket.title}</h3>
                <p className="text-xs text-blue-700 font-bold mt-0.5">{selectedTicket.clubName}</p>
              </div>

              {/* Grid details */}
              <div className="text-left bg-white p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400">Student Name</span>
                  <span className="font-bold text-gray-900">{user?.name || 'Student'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400">College Roll No</span>
                  <span className="font-mono font-bold text-gray-900">{user?.classRollNo || 'CS24089'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400">Program / Branch</span>
                  <span className="font-semibold text-gray-800">{user?.course || 'B.Tech CSE'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-400">Date & Reporting</span>
                  <span className="font-bold text-gray-900">{selectedTicket.date} • {selectedTicket.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Venue / Room</span>
                  <span className="font-bold text-gray-900 truncate ml-2">{selectedTicket.venue}</span>
                </div>
              </div>

              {/* Barcode Simulator */}
              <div className="p-3 bg-gray-100 rounded-xl flex flex-col items-center gap-1 font-mono text-[10px] text-gray-500">
                <div className="tracking-widest font-black text-gray-800 text-sm">||| | |||| | |||||| || | |||| ||</div>
                <span>PASS-{selectedTicket.id.toUpperCase()}-SECURE-VERIFIED</span>
              </div>

              <p className="text-[11px] text-gray-400 leading-tight">
                Mandatory: Bring your valid student identity card for barcode scanning at the door.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
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
                  setToastMessage('Digital pass downloaded to your device.');
                  setSelectedTicket(null);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Save Pass
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CERTIFICATE OF PARTICIPATION */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl space-y-6 relative border-8 border-amber-100/60">
            <button 
              onClick={() => setSelectedCertificate(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Canvas */}
            <div className="text-center space-y-4 border-2 border-amber-200 p-6 sm:p-8 rounded-2xl bg-radial from-amber-50/20 via-white to-amber-50/40 relative">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  Institutional Certificate of Completion
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 pt-2 tracking-wide">
                  UniSphere Campus Council
                </h2>
                <p className="text-xs text-gray-500">Department of Computer Science & Student Affairs</p>
              </div>

              <div className="py-2 space-y-1">
                <p className="text-xs text-gray-400 italic">This is proudly awarded to</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 inline-block px-8">
                  {user?.name || 'Student'}
                </h3>
                <p className="text-xs text-gray-600 font-mono mt-1">
                  Roll No: {user?.classRollNo || 'CS24089'} • {user?.course || 'B.Tech CSE'}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 max-w-lg mx-auto leading-relaxed">
                for successful and active participation in <strong>"{selectedCertificate.title}"</strong>, organized by <strong>{selectedCertificate.clubName}</strong> on <strong>{selectedCertificate.date}</strong>.
              </p>

              {/* Signatures & Accreditation ID */}
              <div className="grid grid-cols-2 pt-6 border-t border-gray-200 text-xs">
                <div>
                  <div className="font-serif font-bold text-gray-800 text-sm">Dr. Sharma</div>
                  <div className="text-[10px] text-gray-400">Faculty Advisor, {selectedCertificate.clubName}</div>
                </div>
                <div>
                  <div className="font-serif font-bold text-gray-800 text-sm">Dr. V. K. Mathur</div>
                  <div className="text-[10px] text-gray-400">Head of Department / Dean</div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-gray-400 font-mono">
                Credential ID: CERT-UNI-{selectedCertificate.id.toUpperCase()}-2026-IQAC-VERIFIED
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="text-xs font-semibold gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Certificate
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setToastMessage('Accredited certificate PDF downloaded.');
                  setSelectedCertificate(null);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL REGISTRATION CONFIRMATION */}
      {cancellingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Cancel Event Registration?</h3>
                <p className="text-xs text-gray-500">Release reserved campus seat</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Are you sure you want to cancel your pass for <strong>"{cancellingEvent.title}"</strong>? 
              This will forfeit your reserved seat and return it to open capacity for other students.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCancellingEvent(null)}
                className="text-xs font-semibold"
              >
                Keep My Seat
              </Button>
              <Button 
                size="sm" 
                onClick={confirmCancelRegistration}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 shadow-xs"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
