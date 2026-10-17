import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getStoredClubs } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { 
  Search, 
  Users, 
  Calendar, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export function ExploreClubs() {
  const { isClubJoined } = useAuth();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  const [allClubs] = useState(() => getStoredClubs());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Computer Science', 'Engineering', 'Arts & Culture', 'Entrepreneurship'];

  const filteredClubs = allClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          club.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (club.facultyAdvisor && club.facultyAdvisor.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (club.department && club.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' ? true : club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <ShieldCheck className="w-80 h-80 text-white" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> UniSphere Campus Organizations
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explore Campus Clubs & Societies
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Discover student-led engineering societies, technical forums, cultural circles, and venture incubators. 
            Click any club to view its official public profile, faculty mentorship, activity calendar, and join with zero invitation codes.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-blue-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> 100% Faculty Advisor Governed
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <Check className="w-3.5 h-3.5 text-emerald-300" /> Zero-Code Open Admissions
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat} {cat === 'All' ? `(${allClubs.length})` : ''}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by club, advisor, dept..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-xs bg-gray-50/50"
          />
        </div>
      </div>

      {/* Clubs Grid - Every card opens its public profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClubs.map(club => {
          const isMember = isClubJoined ? isClubJoined(club.id) : false;
          const profileUrl = `${basePath}/explore/${club.id}`;

          return (
            <div 
              key={club.id} 
              className="flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Banner with Link */}
              <Link to={profileUrl} className="h-36 w-full relative overflow-hidden bg-gray-900 block">
                <img 
                  src={club.banner} 
                  alt={club.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/20" />
                
                {/* Category Pill */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/95 text-blue-700 shadow-sm backdrop-blur-xs">
                    {club.category}
                  </span>
                </div>

                {/* Membership indicator */}
                {isMember && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Member
                    </span>
                  </div>
                )}

                {/* Unique Code Tag */}
                <div className="absolute bottom-2 right-3">
                  <span className="text-[10px] font-mono text-gray-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                    {club.clubCode}
                  </span>
                </div>
              </Link>

              {/* Card Body */}
              <div className="relative flex-grow flex flex-col pt-9 p-5">
                {/* Overlapping Logo with Link */}
                <Link to={profileUrl} className="absolute -top-9 left-5">
                  <img 
                    src={club.logo} 
                    alt={club.name} 
                    className="w-16 h-16 rounded-2xl shadow-md border-3 border-white bg-white object-cover group-hover:ring-2 group-hover:ring-blue-500 transition-all" 
                  />
                </Link>
                
                <div className="mb-2">
                  <Link to={profileUrl}>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 flex items-center justify-between">
                      <span>{club.name}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </h3>
                  </Link>
                  <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                    {club.department || 'Academic Department'}
                  </p>
                </div>
                
                <p className="text-gray-600 text-xs mb-4 flex-grow line-clamp-2 leading-relaxed">
                  {club.description}
                </p>

                {/* Governance Attribution */}
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="truncate">
                    Faculty Advisor: <strong>{club.facultyAdvisor}</strong>
                  </span>
                </div>
                
                {/* Stats Bar */}
                <div className="flex items-center justify-between text-xs text-gray-500 py-2.5 border-t border-gray-100 mb-3">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <Users className="w-3.5 h-3.5 text-blue-600"/> {club.memberCount} members
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-600"/> {club.upcomingEventsCount} events
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-1">
                  <Link to={profileUrl} className="block w-full">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full text-xs font-bold gap-1.5 shadow-sm group-hover:bg-blue-700"
                    >
                      <span>View Public Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filteredClubs.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg">No campus clubs found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
