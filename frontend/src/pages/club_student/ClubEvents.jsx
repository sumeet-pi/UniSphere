import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { events } from '../../data/mockData';
import { Card, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';

export function ClubEvents() {
  const { user } = useAuth();
  const clubEvents = events.filter(e => e.clubId === user.clubId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <p className="text-gray-500">Assist in managing your club's events</p>
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
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-4">
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
                    <Button variant="outline" size="sm">Manage Registrations</Button>
                    <Button size="sm">Edit Details</Button>
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
