import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clubs } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { Search, Users, Calendar, Check, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../../components/Button';

export function ExploreClubs() {
  const { isClubJoined, toggleJoinClub } = useAuth();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Computer Science', 'Engineering', 'Arts & Culture', 'Entrepreneurship'];

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          club.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' ? true : club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Explore Campus Clubs</h1>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">
            Find student organizations, meet peers, and get involved in projects and events.
          </p>
        </div>
        
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search clubs by name or field..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
          />
        </div>
      </div>

      {/* Category Pills */}
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
            {cat} {cat === 'All' ? `(${clubs.length})` : ''}
          </button>
        ))}
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClubs.map(club => {
          const isMember = isClubJoined ? isClubJoined(club.id) : false;

          return (
            <Card key={club.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-200 border-gray-200 group">
              <div className="h-32 w-full relative overflow-hidden bg-gray-100">
                <img 
                  src={club.banner} 
                  alt={club.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <CardContent className="relative flex-grow flex flex-col pt-10 p-5">
                <div className="absolute -top-10 left-5">
                  <img 
                    src={club.logo} 
                    alt={club.name} 
                    className="w-18 h-18 rounded-2xl shadow-md border-3 border-white bg-white object-cover" 
                  />
                </div>
                
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {club.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {club.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-xs mb-4 flex-grow line-clamp-3 leading-relaxed">
                  {club.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 py-3 border-t border-gray-100 mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600"/> {club.memberCount} members
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600"/> {club.upcomingEventsCount} events
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <Link to={`${basePath}/explore/${club.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Profile
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant={isMember ? 'ghost' : 'primary'}
                    onClick={() => toggleJoinClub(club.id)}
                    className={`text-xs gap-1 ${isMember ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : ''}`}
                  >
                    {isMember ? <><Check className="w-3.5 h-3.5" /> Joined</> : 'Join'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredClubs.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg">No clubs found</h3>
            <p className="text-gray-500 text-sm mt-1">Try a different search term or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
