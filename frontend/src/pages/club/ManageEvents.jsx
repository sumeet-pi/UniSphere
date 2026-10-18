import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventRegistrations, getStoredEvents, updateStoredEvent } from '../../data/mockData';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  Plus, 
  Edit2, 
  Users, 
  Calendar, 
  MapPin, 
  X, 
  CheckCircle, 
  CheckCircle2,
  Clock, 
  Lock, 
  Unlock, 
  Trophy, 
  Award, 
  Rocket, 
  RotateCcw, 
  ExternalLink, 
  Filter, 
  Search, 
  Save, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ManageEvents() {
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';

  const [eventList, setEventList] = useState(getStoredEvents);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'open' | 'closed' | 'upcoming' | 'past'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedEventForRegs, setSelectedEventForRegs] = useState(null);
  const [selectedEventForWinners, setSelectedEventForWinners] = useState(null);

  // Winners podium form state
  const [winnerForm, setWinnerForm] = useState({
    w1Name: '', w1Branch: '', w1Prize: '',
    w2Name: '', w2Branch: '', w2Prize: '',
    w3Name: '', w3Branch: '', w3Prize: ''
  });

  const getEventStage = (evt) => {
    if (evt?.eventStage) return evt.eventStage;
    if (evt?.status === 'Past') return 'past';
    if (evt?.status === 'Closed') return 'closed';
    if (evt?.status === 'Upcoming' && evt?.registrationOpens) return 'upcoming';
    return 'open';
  };

  const clubEvents = eventList.filter(e => e.clubId === clubId);
  const openEvents = clubEvents.filter(e => getEventStage(e) === 'open');
  const closedEvents = clubEvents.filter(e => getEventStage(e) === 'closed');
  const upcomingEvents = clubEvents.filter(e => getEventStage(e) === 'upcoming');
  const pastEvents = clubEvents.filter(e => getEventStage(e) === 'past');

  const filteredEvents = clubEvents.filter(e => {
    const stage = getEventStage(e);
    const matchesTab = activeTab === 'all' ? true : stage === activeTab;
    const matchesSearch = searchQuery.trim() === '' ? true : 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Transition event lifecycle stage
  const transitionEventStage = (eventId, newStage) => {
    let newStatus = 'Open';
    if (newStage === 'closed') newStatus = 'Closed';
    else if (newStage === 'past') newStatus = 'Past';
    else if (newStage === 'upcoming') newStatus = 'Upcoming';
    else if (newStage === 'open') newStatus = 'Open';

    const targetEvent = eventList.find(e => e.id === eventId);
    const updates = {
      eventStage: newStage,
      status: newStatus
    };

    // If moving to past/completed and no winners declared, populate default placeholders
    if (newStage === 'past' && (!targetEvent?.winners || targetEvent.winners.length === 0)) {
      updates.winners = [
        { rank: '1st Place', name: 'Winner TBD', branch: 'Department Student', prize: '₹15,000 Trophy & Gold Certificate' },
        { rank: '2nd Place', name: 'Runner Up TBD', branch: 'Department Student', prize: '₹10,000 Trophy & Silver Certificate' },
        { rank: '3rd Place', name: 'Second Runner Up TBD', branch: 'Department Student', prize: '₹5,000 Trophy & Bronze Certificate' }
      ];
    }

    const updated = updateStoredEvent(eventId, updates);
    setEventList(updated);

    let msg = '';
    if (newStage === 'closed') {
      msg = `Registrations closed for "${targetEvent?.title}".`;
    } else if (newStage === 'past') {
      msg = `Event "${targetEvent?.title}" marked as Completed and moved to Past section!`;
    } else if (newStage === 'open') {
      msg = `Registrations opened for "${targetEvent?.title}" on campus feed!`;
    } else if (newStage === 'upcoming') {
      msg = `Event "${targetEvent?.title}" marked as Upcoming (Not Open Yet).`;
    }

    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleOpenWinnersModal = (event) => {
    setSelectedEventForWinners(event);
    const w = event.winners || [];
    setWinnerForm({
      w1Name: w[0]?.name || '',
      w1Branch: w[0]?.branch || '',
      w1Prize: w[0]?.prize || '₹15,000 Trophy & Gold Certificate',
      w2Name: w[1]?.name || '',
      w2Branch: w[1]?.branch || '',
      w2Prize: w[1]?.prize || '₹10,000 Trophy & Silver Certificate',
      w3Name: w[2]?.name || '',
      w3Branch: w[2]?.branch || '',
      w3Prize: w[2]?.prize || '₹5,000 Trophy & Bronze Certificate'
    });
  };

  const handleSaveWinners = (e) => {
    e.preventDefault();
    if (!selectedEventForWinners) return;
    const newWinners = [
      { rank: '1st Place', name: winnerForm.w1Name || 'Champion Declared', branch: winnerForm.w1Branch || 'Department Student', prize: winnerForm.w1Prize },
      { rank: '2nd Place', name: winnerForm.w2Name || 'Runner Up', branch: winnerForm.w2Branch || 'Department Student', prize: winnerForm.w2Prize },
      { rank: '3rd Place', name: winnerForm.w3Name || 'Second Runner Up', branch: winnerForm.w3Branch || 'Department Student', prize: winnerForm.w3Prize }
    ];

    const updated = updateStoredEvent(selectedEventForWinners.id, { winners: newWinners });
    setEventList(updated);
    setSelectedEventForWinners(null);
    setToastMessage(`Official winners updated and published for "${selectedEventForWinners.title}"!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-3 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <span>Manage Club Events</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {clubEvents.length} Total
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Control event stages, transition open registrations to closed, mark completed events, and publish winners
          </p>
        </div>
        <Link to="/club-dashboard/events/create">
          <Button className="gap-2 shadow-sm font-bold bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" /> Create New Event
          </Button>
        </Link>
      </div>

      {/* Search & Stage Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Stage Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>All Events</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {clubEvents.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('open')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'open' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/60 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Open</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'open' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                {openEvents.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('closed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'closed' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'bg-rose-50/60 text-rose-800 hover:bg-rose-100/60 border border-rose-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Registration Closed</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'closed' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'}`}>
                {closedEvents.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upcoming' 
                  ? 'bg-amber-500 text-white shadow-xs' 
                  : 'bg-amber-50/60 text-amber-800 hover:bg-amber-100/60 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Upcoming (Not Open)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'upcoming' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {upcomingEvents.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('past')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'past' 
                  ? 'bg-gray-900 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Completed (Past)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'past' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}>
                {pastEvents.length}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64 flex-shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search event title or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Event Cards List */}
      <div className="space-y-5">
        {filteredEvents.map(event => {
          const stage = getEventStage(event);

          return (
            <Card key={event.id} className="hover:shadow-md transition-all overflow-hidden border-gray-200 group">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Event Thumbnail & Badge */}
                  <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0 relative overflow-hidden bg-gray-900">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {stage === 'open' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          Open for Registration
                        </span>
                      )}
                      {stage === 'closed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-600 text-white shadow-sm">
                          <Lock className="w-3 h-3" />
                          Registration Closed
                        </span>
                      )}
                      {stage === 'upcoming' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500 text-white shadow-sm">
                          <Clock className="w-3 h-3" />
                          Upcoming • Not Open
                        </span>
                      )}
                      {stage === 'past' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gray-950 text-gray-100 shadow-sm border border-gray-700">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          Completed (Past Section)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Event Information & Transition Controls */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-xs text-blue-700 font-medium mt-0.5">
                            Eligibility: {event.eligibility}
                          </p>
                        </div>

                        {/* Direct Stage Selector Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-gray-500 hidden sm:inline">Stage:</span>
                          <select 
                            value={stage}
                            onChange={(e) => transitionEventStage(event.id, e.target.value)}
                            className="text-xs font-bold rounded-lg border border-gray-300 py-1 px-2.5 bg-white text-gray-800 cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                          >
                            <option value="open">🟢 Open for Registration</option>
                            <option value="closed">🔴 Registration Closed</option>
                            <option value="upcoming">🟡 Upcoming (Not Open)</option>
                            <option value="past">🏁 Completed (Past Section)</option>
                          </select>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                      
                      {/* Metric Strip */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
                        <div>
                          <p className="text-gray-500 flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Date & Time
                          </p>
                          <p className="font-bold text-gray-900 mt-0.5">{event.date}</p>
                          <p className="text-[11px] text-gray-500">{event.time}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" /> Campus Venue
                          </p>
                          <p className="font-bold text-gray-900 mt-0.5 truncate">{event.venue}</p>
                          <p className="text-[11px] text-gray-500">Physical room / hall</p>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-gray-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-blue-600" /> Enrollment
                            </span>
                            <span className="font-bold text-gray-900">
                              {event.registeredCount} / {event.capacity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                stage === 'closed' ? 'bg-rose-500' : stage === 'past' ? 'bg-gray-800' : 'bg-blue-600'
                              }`} 
                              style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">
                            {stage === 'past' 
                              ? 'Event completed' 
                              : `${event.capacity - event.registeredCount} spots remaining`}
                          </p>
                        </div>
                      </div>

                      {/* Winners Preview for Past Events */}
                      {stage === 'past' && event.winners && event.winners.length > 0 && (
                        <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-amber-900 font-medium">
                            <Trophy className="w-4 h-4 text-amber-600" />
                            <span><strong>1st Place Champion:</strong> {event.winners[0]?.name} ({event.winners[0]?.branch})</span>
                          </div>
                          <button
                            onClick={() => handleOpenWinnersModal(event)}
                            className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                          >
                            View all {event.winners.length} winners
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Interactive Lifecycle Transition Action Bar */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
                      {/* Left: Quick Lifecycle Transition Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1">
                          Transition Stage:
                        </span>

                        {stage === 'open' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => transitionEventStage(event.id, 'closed')}
                              className="text-xs font-bold text-rose-700 border-rose-300 bg-rose-50/60 hover:bg-rose-100 gap-1.5 cursor-pointer shadow-2xs"
                              title="Close student registrations immediately"
                            >
                              <Lock className="w-3.5 h-3.5" /> Close Registration
                            </Button>

                            <Button 
                              size="sm"
                              onClick={() => transitionEventStage(event.id, 'past')}
                              className="text-xs font-bold bg-gray-900 hover:bg-black text-white gap-1.5 cursor-pointer shadow-2xs"
                              title="Mark event completed and put into Past Events section"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark Completed (Move to Past)
                            </Button>
                          </>
                        )}

                        {stage === 'closed' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => transitionEventStage(event.id, 'open')}
                              className="text-xs font-bold text-emerald-700 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 gap-1.5 cursor-pointer shadow-2xs"
                              title="Re-open registrations for students"
                            >
                              <Unlock className="w-3.5 h-3.5" /> Re-open Registration
                            </Button>

                            <Button 
                              size="sm"
                              onClick={() => transitionEventStage(event.id, 'past')}
                              className="text-xs font-bold bg-gray-900 hover:bg-black text-white gap-1.5 cursor-pointer shadow-2xs"
                              title="Mark event completed and put into Past Events section"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark Completed (Move to Past)
                            </Button>
                          </>
                        )}

                        {stage === 'upcoming' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => transitionEventStage(event.id, 'open')}
                              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer shadow-2xs"
                              title="Launch active registrations for students"
                            >
                              <Rocket className="w-3.5 h-3.5" /> Open Registrations Now
                            </Button>

                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => transitionEventStage(event.id, 'closed')}
                              className="text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50 gap-1.5 cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" /> Close
                            </Button>

                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => transitionEventStage(event.id, 'past')}
                              className="text-xs font-bold text-gray-700 border-gray-300 hover:bg-gray-100 gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                            </Button>
                          </>
                        )}

                        {stage === 'past' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleOpenWinnersModal(event)}
                              className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white gap-1.5 cursor-pointer shadow-2xs"
                              title="Declare or edit 1st, 2nd, and 3rd place champions"
                            >
                              <Trophy className="w-3.5 h-3.5 text-amber-100" /> Manage Winners Podium
                            </Button>

                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => transitionEventStage(event.id, 'open')}
                              className="text-xs font-semibold text-gray-600 border-gray-200 hover:bg-gray-100 gap-1.5 cursor-pointer"
                              title="Re-activate event into Open stage"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Re-open Event
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Right: View Registrations & Public Page Link */}
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/events/${event.id}`} 
                          target="_blank" 
                          className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium mr-1"
                        >
                          <span>Public Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedEventForRegs(event)}
                          className="gap-1.5 text-xs text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
                        >
                          <Users className="w-3.5 h-3.5" /> Registrations ({event.registeredCount})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-base">No events in this stage</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              There are currently no events matching the "{activeTab}" filter. You can transition events between Open, Closed, and Past at any time.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveTab('all')}
              className="mt-4 text-xs"
            >
              Show All Events ({clubEvents.length})
            </Button>
          </div>
        )}
      </div>

      {/* Registrations List Modal */}
      {selectedEventForRegs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-blue-50/60">
              <div>
                <h3 className="font-black text-lg text-gray-900">Registered Students: {selectedEventForRegs.title}</h3>
                <p className="text-xs text-blue-800 mt-0.5">
                  Verified campus attendance list • {selectedEventForRegs.registeredCount} active passes issued
                </p>
              </div>
              <button 
                onClick={() => setSelectedEventForRegs(null)} 
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
              {eventRegistrations.map((reg) => (
                <div key={reg.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-2xs">
                      {reg.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{reg.studentName}</p>
                      <p className="text-xs text-gray-500">{reg.collegeId} • {reg.department} ({reg.year})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{reg.date}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      reg.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Attendance can be validated at entry using college ID CS24089.
              </span>
              <Button size="sm" onClick={() => setSelectedEventForRegs(null)}>
                Close List
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Winners Podium Editor Modal */}
      {selectedEventForWinners && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <Trophy className="w-6 h-6 text-yellow-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Declare Official Winners</h3>
                  <p className="text-xs text-amber-100 truncate max-w-sm">
                    {selectedEventForWinners.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEventForWinners(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWinners}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <p className="text-xs text-gray-500">
                  Enter official competition champions. Results will be published live on the club public profile and event showcase.
                </p>

                {/* 1st Place */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                      🥇
                    </span>
                    <span className="font-extrabold text-sm text-amber-900">1st Place Champion</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text"
                      placeholder="Student / Team Name"
                      value={winnerForm.w1Name}
                      onChange={e => setWinnerForm({ ...winnerForm, w1Name: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                    <input 
                      type="text"
                      placeholder="Branch & Year (e.g. CSE 3rd Year)"
                      value={winnerForm.w1Branch}
                      onChange={e => setWinnerForm({ ...winnerForm, w1Branch: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <input 
                    type="text"
                    placeholder="Award / Prize (e.g. ₹15,000 Trophy & Gold Certificate)"
                    value={winnerForm.w1Prize}
                    onChange={e => setWinnerForm({ ...winnerForm, w1Prize: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                {/* 2nd Place */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-400 text-white font-bold flex items-center justify-center text-xs">
                      🥈
                    </span>
                    <span className="font-extrabold text-sm text-slate-800">2nd Place (Runner Up)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text"
                      placeholder="Student / Team Name"
                      value={winnerForm.w2Name}
                      onChange={e => setWinnerForm({ ...winnerForm, w2Name: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                      required
                    />
                    <input 
                      type="text"
                      placeholder="Branch & Year (e.g. IT 2nd Year)"
                      value={winnerForm.w2Branch}
                      onChange={e => setWinnerForm({ ...winnerForm, w2Branch: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                      required
                    />
                  </div>
                  <input 
                    type="text"
                    placeholder="Award / Prize (e.g. ₹10,000 Trophy & Silver Certificate)"
                    value={winnerForm.w2Prize}
                    onChange={e => setWinnerForm({ ...winnerForm, w2Prize: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                    required
                  />
                </div>

                {/* 3rd Place */}
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-700 text-white font-bold flex items-center justify-center text-xs">
                      🥉
                    </span>
                    <span className="font-extrabold text-sm text-orange-950">3rd Place (Second Runner Up)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text"
                      placeholder="Student / Team Name"
                      value={winnerForm.w3Name}
                      onChange={e => setWinnerForm({ ...winnerForm, w3Name: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-orange-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                    <input 
                      type="text"
                      placeholder="Branch & Year (e.g. CSE 1st Year)"
                      value={winnerForm.w3Branch}
                      onChange={e => setWinnerForm({ ...winnerForm, w3Branch: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-orange-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <input 
                    type="text"
                    placeholder="Award / Prize (e.g. ₹5,000 Trophy & Bronze Certificate)"
                    value={winnerForm.w3Prize}
                    onChange={e => setWinnerForm({ ...winnerForm, w3Prize: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-orange-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedEventForWinners(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Publish Winners List
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
