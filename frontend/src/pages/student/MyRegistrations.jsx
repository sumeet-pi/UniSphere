import React, { useState } from 'react';
import { events } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Calendar, MapPin, Clock, ExternalLink, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function MyRegistrations() {
  const { registeredEventIds, unregisterFromEvent } = useAuth();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  const [notification, setNotification] = useState(null);

  const registeredEvents = events.filter(e => registeredEventIds.includes(e.id) && e.status === 'Upcoming');
  const pastEvents = events.filter(e => e.status === 'Past');

  const handleCancel = (eventId, eventTitle) => {
    unregisterFromEvent(eventId);
    setNotification(`Successfully cancelled registration for "${eventTitle}".`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Event Registrations</h1>
          <p className="text-gray-500">Track and manage your upcoming and past college event participations</p>
        </div>
        <Link to={`${basePath}/events`}>
          <Button variant="outline" className="gap-2">
            Discover More Events
          </Button>
        </Link>
      </div>

      {notification && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
          Upcoming Events ({registeredEvents.length})
        </h2>

        {registeredEvents.length > 0 ? (
          registeredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-52 h-48 sm:h-auto flex-shrink-0 relative">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 sm:hidden">
                    <Badge variant="green">Registered</Badge>
                  </div>
                </div>
                <CardContent className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link 
                          to={`${basePath}/explore/${event.clubId}`}
                          className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline"
                        >
                          {event.clubName}
                        </Link>
                        <h3 className="text-xl font-bold text-gray-900 mt-0.5">{event.title}</h3>
                      </div>
                      <div className="hidden sm:block">
                        <Badge variant="green">Confirmed Ticket</Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600"/> 
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600"/> 
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600"/> 
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-between items-center gap-2 border-t border-gray-100 pt-4">
                    <span className="text-xs text-gray-400">Bring your student ID for hall entry</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCancel(event.id, event.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                      >
                        Cancel Registration
                      </Button>
                      <Link to={`${basePath}/events/${event.id}`}>
                        <Button size="sm" className="gap-1.5 text-xs">
                          View Event Details <ExternalLink className="w-3.5 h-3.5"/>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg">No active event registrations</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">You have not registered for any upcoming events yet.</p>
            <Link to={`${basePath}/events`}>
              <Button>Browse Upcoming Events</Button>
            </Link>
          </div>
        )}

        {/* Past Events */}
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mt-12">
          Past Attended Events
        </h2>
        {pastEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-36 h-28 sm:h-auto flex-shrink-0">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover grayscale" />
              </div>
              <CardContent className="p-4 flex-grow flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{event.title}</h3>
                    <p className="text-xs text-gray-500">{event.clubName} • Held on {event.date}</p>
                    <p className="text-xs text-gray-400 mt-1">Certificate of participation generated</p>
                  </div>
                  <Badge variant="gray">Attended</Badge>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
