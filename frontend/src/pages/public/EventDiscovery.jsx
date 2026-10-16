import React, { useState } from 'react';
import { events } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Calendar, Clock, MapPin, Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function EventDiscovery() {
  const { isRegistered } = useAuth();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Technical', 'Workshop', 'Hackathon', 'Cultural'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' ? true : 
      event.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      event.description.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">College Events & Activities</h1>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">
            Discover upcoming hackathons, workshops, and competitions organized across campus clubs.
          </p>
        </div>
        
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search events, clubs, venues..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat} {cat === 'All' ? `(${events.length})` : ''}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => {
          const registered = isRegistered ? isRegistered(event.id) : false;

          return (
            <Card key={event.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-200 overflow-hidden group border-gray-200">
              <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <Badge variant={event.status === 'Upcoming' ? 'green' : 'gray'}>
                    {event.status}
                  </Badge>
                  {registered && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow">
                      <CheckCircle2 className="w-3 h-3" /> Registered
                    </span>
                  )}
                </div>
              </div>
              
              <CardContent className="flex-grow flex flex-col p-6">
                <Link 
                  to={`${basePath}/explore/${event.clubId}`}
                  className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1 hover:underline"
                >
                  {event.clubName}
                </Link>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-xs text-gray-600 mb-6 flex-grow bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>{event.date}</span>
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

                <div className="pt-2">
                  <Link to={`${basePath}/events/${event.id}`}>
                    <Button className="w-full gap-2 shadow-sm">
                      {registered ? 'View Ticket & Details' : 'View Details & Register'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg">No events found</h3>
            <p className="text-gray-500 text-sm mt-1">Try searching for a different keyword or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
