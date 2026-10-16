import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { events, eventRegistrations } from '../../data/mockData';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Plus, Edit2, Users, Calendar, MapPin, X, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ManageEvents() {
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const clubEvents = events.filter(e => e.clubId === clubId);

  const [activeTab, setActiveTab] = useState('All');
  const [selectedEventForRegs, setSelectedEventForRegs] = useState(null);

  const filteredEvents = clubEvents.filter(e => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return e.status === 'Upcoming';
    if (activeTab === 'Past') return e.status === 'Past';
    if (activeTab === 'Drafts') return e.status === 'Draft';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-gray-500">Create, edit, and track registrations for your club events</p>
        </div>
        <Link to="/club-dashboard/events/create">
          <Button className="gap-2 shadow-sm"><Plus className="w-4 h-4"/> Create Event</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {['All', 'Upcoming', 'Drafts', 'Past'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-blue-50 text-blue-700 font-semibold' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab} Events
          </button>
        ))}
      </div>

      {/* Event Cards */}
      <div className="space-y-4">
        {filteredEvents.map(event => (
          <Card key={event.id} className="hover:shadow-md transition-shadow overflow-hidden border-gray-200">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 relative">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 sm:hidden">
                    <Badge variant={event.status === 'Upcoming' ? 'green' : 'gray'}>{event.status}</Badge>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                        <p className="text-xs text-blue-600 font-medium">{event.eligibility}</p>
                      </div>
                      <div className="hidden sm:block">
                        <Badge variant={event.status === 'Upcoming' ? 'green' : 'gray'}>{event.status}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date & Time</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{event.date}</p>
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Venue</p>
                        <p className="font-semibold text-gray-900 mt-0.5 truncate">{event.venue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Attendance</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{event.registeredCount} / {event.capacity} seats</p>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                    <Link to={`/events/${event.id}`} target="_blank" className="text-xs text-gray-500 hover:text-blue-600 underline">
                      View public landing page
                    </Link>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedEventForRegs(event)}
                        className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                      >
                        <Users className="w-4 h-4"/> View Registrations ({event.registeredCount})
                      </Button>
                      <Link to="/club-dashboard/events/create">
                        <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                          <Edit2 className="w-4 h-4"/> Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Registrations Modal */}
      {selectedEventForRegs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Registrations: {selectedEventForRegs.title}</h3>
                <p className="text-xs text-gray-500">Total registered students: {selectedEventForRegs.registeredCount}</p>
              </div>
              <button onClick={() => setSelectedEventForRegs(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
              {eventRegistrations.map((reg) => (
                <div key={reg.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {reg.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{reg.studentName}</p>
                      <p className="text-xs text-gray-500">{reg.collegeId} • {reg.department} ({reg.year})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{reg.date}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      reg.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Button onClick={() => setSelectedEventForRegs(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
