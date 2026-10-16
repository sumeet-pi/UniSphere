import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card, CardContent } from '../../components/Card';
import { 
  Calendar, 
  Users, 
  Trophy, 
  ArrowRight, 
  Compass, 
  Sparkles, 
  Shield, 
  CheckCircle2, 
  Star, 
  ArrowUpRight, 
  Award, 
  Layers, 
  Zap, 
  Clock, 
  MapPin, 
  Building2, 
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { clubs, events } from '../../data/mockData';

export function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter clubs by category
  const categories = ['All', 'Computer Science', 'Engineering', 'Arts & Culture', 'Entrepreneurship'];
  const filteredClubs = selectedCategory === 'All' 
    ? clubs.slice(0, 4) 
    : clubs.filter(c => c.category === selectedCategory).slice(0, 4);

  // Top upcoming events
  const upcomingEvents = events.filter(e => e.status === 'Upcoming').slice(0, 3);

  return (
    <div className="bg-white overflow-hidden">
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-gray-50/50 pt-10 pb-20 sm:pt-16 sm:pb-28">
        {/* Decorative Background Elements */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div 
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-indigo-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>The Official College Club & Engagement Hub</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12]">
                Where Campus Passions <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Converge.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                <strong className="text-gray-900 font-semibold">UniSphere</strong> connects thousands of students with recognized academic societies, technical clubs, cultural chapters, and live campus hackathons. Explore clubs, reserve event seats, or submit a new club proposal.
              </p>

              {/* Dual Action CTAs */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link to="/explore">
                  <Button size="lg" className="h-12 px-6 shadow-md gap-2 font-bold text-sm bg-blue-600 hover:bg-blue-700">
                    <Compass className="w-4 h-4" /> Explore Campus Clubs
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="h-12 px-6 gap-2 font-bold text-sm border-gray-300 hover:bg-gray-50">
                    <Calendar className="w-4 h-4 text-blue-600" /> Live Events Schedule
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="ghost" className="h-12 px-4 gap-1.5 font-semibold text-sm text-gray-700 hover:text-blue-600">
                    Register a Club <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> HOD & Dean Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> 1-Click Event Passes
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" /> Official College Recognition
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Composite Hero Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Image Frame with Ambient Glow */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-900 aspect-[4/3] group">
                  <img
                    src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1000"
                    alt="College students collaborating in technical workshop"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
                  
                  {/* Bottom Text Inside Image */}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                      College Activity Spotlight
                    </span>
                    <h4 className="text-base font-bold mt-0.5">
                      Byte Warriors Annual Hackathon • Main Lab 3
                    </h4>
                  </div>
                </div>

                {/* Floating Glassmorphism Badge 1: Top Right Event RSVP */}
                <div className="absolute -top-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce [animation-duration:5s]">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">ByteHacks 2026</div>
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      45 Seats Reserved Today
                    </div>
                  </div>
                </div>

                {/* Floating Glassmorphism Badge 2: Bottom Left Verified Club */}
                <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">45+ Active Societies</div>
                    <div className="text-[11px] text-gray-500">Tech • Cultural • Robotics</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CAMPUS LIVE METRICS BAR                               */}
      {/* ======================================================== */}
      <section className="py-12 bg-gray-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {/* Stat 1 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">45+</div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium mt-1">Recognized Student Clubs</div>
            </div>

            {/* Stat 2 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">120+</div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium mt-1">Annual Campus Events</div>
            </div>

            {/* Stat 3 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">3,400+</div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium mt-1">Active Students Enrolled</div>
            </div>

            {/* Stat 4 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">100%</div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium mt-1">HOD & Faculty Mentored</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. DUAL-ROLE GATEWAY ("Tailored for Every Campus Role")    */}
      {/* ======================================================== */}
      <section className="py-20 bg-gray-50 border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Tailored Portals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mt-3">
              One Unified Platform, Two Powerful Experiences
            </h2>
            <p className="text-gray-500 text-base mt-3">
              Whether you are an aspiring student exploring clubs or a faculty coordinator leading campus initiatives, UniSphere gives you dedicated tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Role Card */}
            <Card className="border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="h-3 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardContent className="p-8 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">For General Students</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Make your college journey unforgettable. Discover organizations tailored to your degree, RSVP for hackathons, and build real-world leadership credentials.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Personalized club catalog by department (B.Tech, BBA, MBA, BCA)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>1-Click Event Reservations with instant digital passes</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Track joined communities and verified participation records</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link to="/signup" className="w-full">
                    <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs gap-2">
                      Join as General Student <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Club Coordinator Role Card */}
            <Card className="border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <CardContent className="p-8 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">For Club Heads & Faculty</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Supercharge your club operations. Manage event planning, member rosters, task delegations, and official administrative clearances in one unified portal.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Event publishing with capacity controls and RSVP tracking</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Official HOD & Dean approval submission workflow</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Task management board & core team coordination</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link to="/signup" className="w-full">
                    <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold text-xs gap-2">
                      Register Your Club for Approval <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FEATURED CLUBS WITH CATEGORY FILTER                   */}
      {/* ======================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Explore Campus Life
              </span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-2">
                Featured Campus Organizations
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Discover active clubs recognized by the college administration.
              </p>
            </div>
            <Link to="/explore">
              <Button variant="outline" className="text-xs font-bold gap-1.5 border-gray-300">
                View All 45+ Clubs <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Club Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredClubs.map((club) => (
              <Card key={club.id} className="border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                {/* Banner */}
                <div className="h-32 w-full relative overflow-hidden bg-gray-100">
                  <img 
                    src={club.banner} 
                    alt={club.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                    {club.category}
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-5 pt-10 relative flex-1 flex flex-col justify-between">
                  {/* Floating Logo */}
                  <div className="absolute -top-8 left-5">
                    <img 
                      src={club.logo} 
                      alt={club.name} 
                      className="w-16 h-16 rounded-2xl shadow-md border-3 border-white bg-white object-cover" 
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {club.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {club.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> {club.memberCount} Members
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {club.facultyHead}
                      </span>
                    </div>

                    <Link to={`/explore/${club.id}`} className="block">
                      <Button variant="outline" className="w-full h-9 text-xs font-semibold gap-1 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                        Explore Club <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. TRENDING LIVE CAMPUS EVENTS                            */}
      {/* ======================================================== */}
      <section className="py-20 bg-gray-50/70 border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Mark Your Calendar
              </span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-2">
                Flagship Campus Events
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Upcoming workshops, hackathons, and cultural fests taking place on campus.
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline" className="text-xs font-bold gap-1.5 border-gray-300">
                Full Events Calendar <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => {
              const seatPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
              const isFull = event.registeredCount >= event.capacity;

              return (
                <Card key={event.id} className="border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                  {/* Event Image */}
                  <div className="h-44 w-full relative overflow-hidden bg-gray-900">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Date Pill */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>

                    {/* Host Club Tag */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                        Hosted by {event.clubName}
                      </span>
                      <h3 className="text-base font-bold text-white truncate">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Capacity Meter */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-[11px] mb-1 font-semibold">
                        <span className="text-gray-500">Seat Capacity</span>
                        <span className={isFull ? 'text-rose-600' : 'text-emerald-600'}>
                          {event.registeredCount} / {event.capacity} Filled
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-blue-600'}`}
                          style={{ width: `${seatPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Register Button */}
                    <Link to={`/events/${event.id}`}>
                      <Button className="w-full h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700">
                        {isFull ? 'View Event Details' : 'Reserve Seat Pass'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. INSTITUTIONAL GOVERNANCE & SECURITY PILLAR            */}
      {/* ======================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
            {/* Ambient pattern */}
            <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Institutional Trust & Quality
              </span>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Built for Verified Campus Security & Academic Integrity
              </h2>

              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Unlike open public social networks, <strong>UniSphere</strong> is strictly governed by college academic policies. Every club charter is endorsed by the Head of Department (HOD) and verified by the Dean of Student Welfare (DSW).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-white">College Intranet Only</h4>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    Access is limited to authenticated roll numbers and college emails.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-white">Zero Fake Groups</h4>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    Club registration proposals undergo formal administrative vetting.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-white">Official Participation</h4>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    Event attendance is recognized for semester extracurricular credits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. STUDENT & FACULTY VOICES                               */}
      {/* ======================================================== */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Campus Testimonials
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-3">
              Trusted by Students and Faculty Alike
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <Card className="border-gray-200/80 shadow-xs p-6 space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "Finding Byte Warriors on UniSphere transformed my 2nd year. I registered for their Hackathon with one click and ended up working on a smart robotics project!"
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  VS
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Vikram Singh</div>
                  <div className="text-[11px] text-gray-500">B.Tech CSE, 2nd Year</div>
                </div>
              </div>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-gray-200/80 shadow-xs p-6 space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "As a faculty coordinator, UniSphere eliminated the endless paperwork for event approvals and seat allocations. The HOD clearance tracking is seamless."
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  DS
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Dr. Sharma</div>
                  <div className="text-[11px] text-gray-500">Faculty Coordinator, Byte Warriors</div>
                </div>
              </div>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-gray-200/80 shadow-xs p-6 space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "Managing club announcements, task assignments for junior coordinators, and tracking RSVP attendance used to be chaotic. UniSphere centralized everything."
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  AK
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Aarav Kumar</div>
                  <div className="text-[11px] text-gray-500">Student Lead, Robotics Society</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. BOTTOM CALL TO ACTION                                 */}
      {/* ======================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Shape Your College Legacy?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Join thousands of campus peers discovering opportunities, leading student societies, and participating in flagship hackathons.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-7 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md">
                  Get Started (Create Account)
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="lg" variant="outline" className="h-12 px-7 text-white border-white/50 hover:bg-white/10 font-bold text-sm">
                  Browse Clubs Directory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

