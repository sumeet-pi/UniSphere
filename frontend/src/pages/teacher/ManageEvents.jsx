import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { events } from '../../data/mockData';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Plus, Edit2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ManageEvents() {
  const { user } = useAuth();
  const clubEvents = events.filter(e => e.clubId === user.managedClubId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-gray-500">View and edit your club's events</p>
        </div>
        <Link to="/teacher/events/create">
          <Button className="gap-2"><Plus className="w-4 h-4"/> Create Event</Button>
        </Link>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap">All Events</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap">Upcoming</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap">Drafts</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap">Past Events</button>
      </div>

      <div className="space-y-4">
        {clubEvents.map(event => (
          <Card key={event.id} className="hover:shadow-sm transition-shadow overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                      <Badge variant={event.status === 'Upcoming' ? 'green' : 'gray'}>{event.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">{event.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Venue</p>
                        <p className="font-medium text-gray-900 truncate">{event.venue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Registrations</p>
                        <p className="font-medium text-gray-900">{event.registeredCount} / {event.capacity}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="gap-2 text-gray-600">
                      <Edit2 className="w-4 h-4"/> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                      <Users className="w-4 h-4"/> View Registrations
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
