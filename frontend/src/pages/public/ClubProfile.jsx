import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { clubs, events, getStoredAnnouncements, getStoredEvents, addStoredMember } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  ArrowLeft, 
  Check, 
  Share2, 
  Megaphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Pencil,
  Copy,
  Mail,
  Phone,
  Building2,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  X,
  Save,
  RotateCcw,
  FileText,
  Hash,
  Award,
  ExternalLink,
  Trophy,
  Lock,
  Filter,
  Ticket
} from 'lucide-react';

const DEPARTMENT_OPTIONS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'School of Management (BBA/MBA)',
  'Computer Applications (BCA/MCA)',
  'Biotechnology & Applied Sciences'
];

const CATEGORY_OPTIONS = [
  'Technical & Coding',
  'Cultural & Arts',
  'Entrepreneurship',
  'Sports & Athletics',
  'Literature & Debating',
  'Social Impact & Volunteering',
  'Robotics & Hardware'
];

const BANNER_PRESETS = [
  { label: 'Code & Dev', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Hackathon Lab', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Robotics Workshop', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Campus Auditorium', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Cultural & Arts', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200' }
];

const LOGO_PRESETS = [
  { label: 'Byte Green', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=ByteWarriors&backgroundColor=0a5c36,18181b' },
  { label: 'Sapphire AI', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=UniSphereTech&backgroundColor=1d4ed8,0f172a' },
  { label: 'Crimson Society', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Robotics&backgroundColor=b91c1c,18181b' },
  { label: 'Indigo Arts', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Literary&backgroundColor=4338ca,18181b' },
  { label: 'Amber Venture', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=ECell&backgroundColor=f59e0b,18181b' }
];

export function ClubProfile() {
  const { id } = useParams();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/student');
  const basePath = isInsideDashboard ? '/student' : '';

  const { user, isClubJoined, toggleJoinClub, isRegistered } = useAuth();

  const clubParamId = id || 'c1';
  const defaultClub = clubs.find(c => c.id === clubParamId) || clubs[0];

  // Load from local storage or merge with default club & user signup data
  const getInitialClubData = () => {
    try {
      const saved = localStorage.getItem(`mockClubProfile_${clubParamId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultClub,
          ...parsed,
          clubCode: parsed.clubCode || parsed.inviteCode || 'BW-CSE-2026',
          facultyAdvisor: parsed.facultyAdvisor || parsed.coordinatorTeacher || parsed.facultyHead || 'Dr. Sharma'
        };
      }
    } catch (e) {
      console.error(e);
    }

    const initialCode = (user?.clubId === clubParamId ? user?.clubCode : null) || defaultClub.clubCode || defaultClub.inviteCode || 'BW-CSE-2026';
    const initialAdvisor = (user?.clubId === clubParamId ? (user?.facultyAdvisor || user?.coordinatorTeacher) : null) || defaultClub.facultyHead || 'Dr. Sharma';

    return {
      ...defaultClub,
      name: (user?.clubId === clubParamId ? user?.clubName : null) || defaultClub.name || 'Byte Warriors',
      category: (user?.clubId === clubParamId ? user?.category : null) || defaultClub.category || 'Technical & Coding',
      department: (user?.clubId === clubParamId ? user?.department : null) || defaultClub.department || 'Computer Science & Engineering',
      hod: (user?.clubId === clubParamId ? user?.hod : null) || defaultClub.hod || 'Dr. V. K. Mathur',
      facultyAdvisor: initialAdvisor,
      coordinatorTeacher: initialAdvisor,
      facultyHead: initialAdvisor,
      phone: (user?.clubId === clubParamId ? user?.phone : null) || defaultClub.phone || '+91 98101 23456',
      email: (user?.clubId === clubParamId ? user?.email : null) || defaultClub.email || 'bytewarriors@college.edu',
      clubCode: initialCode,
      status: defaultClub.status || 'Approved Institutional Charter',
      memberCount: defaultClub.memberCount || 128,
      upcomingEventsCount: defaultClub.upcomingEventsCount || 6,
      meetingSchedule: defaultClub.meetingSchedule || 'Every Wednesday • 4:30 PM - 6:00 PM',
      meetingVenue: defaultClub.meetingVenue || 'Main Lab 3, CSE Academic Block, 3rd Floor',
      foundedYear: defaultClub.foundedYear || '2021',
      description: defaultClub.description || 'The official coding and technology club of the CSE Department. We organize hackathons, coding contests, workshops, and industry tech talks to build hands-on engineering capabilities.',
      eligibility: defaultClub.eligibility || 'Open to all enrolled undergraduate and postgraduate students of UniSphere with a valid college ID card.',
      banner: defaultClub.banner || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
      logo: defaultClub.logo || 'https://api.dicebear.com/7.x/shapes/svg?seed=ByteWarriors&backgroundColor=0a5c36,18181b',
      coreTeam: defaultClub.coreTeam && defaultClub.coreTeam.length > 0 ? defaultClub.coreTeam : [
        { id: 'ct1', name: 'Aarav Kumar', role: 'Student Coordinator', year: '3rd Year', department: 'CSE' },
        { id: 'ct2', name: 'Priya Singh', role: 'Technical Lead', year: '3rd Year', department: 'CSE' },
        { id: 'ct3', name: 'Rahul Verma', role: 'Event Manager', year: '2nd Year', department: 'CSE' }
      ]
    };
  };

  const [club, setClub] = useState(getInitialClubData);
  const [formData, setFormData] = useState(getInitialClubData);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Role detection: distinguish General Student from Club Coordinator
  const isCoordinator = user?.role === 'Club Coordinator' || user?.role === 'teacher' || user?.role === 'club_student';
  const isStudent = user?.role === 'General Student';
  const isLoggedIn = !!user;

  // Filter state for events tab: 'all' | 'open' | 'upcoming' | 'past'
  const [eventStageFilter, setEventStageFilter] = useState('all');
  const [selectedWinnerEvent, setSelectedWinnerEvent] = useState(null);

  const clubEvents = getStoredEvents().filter(e => e.clubId === club.id);
  const clubAnnouncements = getStoredAnnouncements(club.id);

  const getEventStage = (evt) => {
    if (evt?.eventStage) return evt.eventStage;
    if (evt?.status === 'Past') return 'past';
    if (evt?.status === 'Closed') return 'closed';
    if (evt?.status === 'Upcoming' && evt?.registrationOpens) return 'upcoming';
    return 'open';
  };

  const openEvents = clubEvents.filter(e => getEventStage(e) === 'open');
  const closedEvents = clubEvents.filter(e => getEventStage(e) === 'closed');
  const upcomingEvents = clubEvents.filter(e => getEventStage(e) === 'upcoming');
  const pastEvents = clubEvents.filter(e => getEventStage(e) === 'past');

  const filteredClubEvents = clubEvents.filter(e => {
    if (eventStageFilter === 'all') return true;
    return getEventStage(e) === eventStageFilter;
  });

  const isMember = isClubJoined ? isClubJoined(club.id) : false;
  const [activeTab, setActiveTab] = useState('events');
  const [copiedCode, setCopiedCode] = useState(false);

  // Direct Join Club modal states (no invitation code required)
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [joinToast, setJoinToast] = useState('');
  const [joinFormData, setJoinFormData] = useState({
    name: user?.name || '',
    collegeId: user?.collegeId || 'CS26042',
    email: user?.email || '',
    phone: user?.phone || '+91 98123 45678',
    department: user?.department || 'CSE',
    year: user?.year || '2nd Year',
    interests: 'Technical workshops, hackathons, and software projects'
  });

  const handleJoinClick = () => {
    if (isCoordinatorViewing) {
      alert("You are viewing from a Club Coordinator perspective. Students can join freely without codes.");
      return;
    }
    if (isMember) {
      setShowMembershipModal(true);
    } else {
      setShowJoinModal(true);
    }
  };

  const handleConfirmJoin = (e) => {
    e.preventDefault();
    if (!joinFormData.name || !joinFormData.collegeId) return;

    const email = joinFormData.email || `${joinFormData.name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`;
    const phone = joinFormData.phone || '+91 98123 45678';

    addStoredMember({
      clubId: club.id,
      name: joinFormData.name.trim(),
      collegeId: joinFormData.collegeId.trim().toUpperCase(),
      email: email.trim(),
      phone: phone.trim(),
      department: joinFormData.department,
      year: joinFormData.year,
      role: 'Member',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    });

    if (!isMember) {
      toggleJoinClub(club.id);
    }

    setShowJoinModal(false);
    setJoinToast(`🎉 Welcome to ${club.name}! You are now an active member. No codes required!`);
    setTimeout(() => setJoinToast(''), 4000);
  };

  const handleLeaveClub = () => {
    if (window.confirm(`Are you sure you want to leave ${club.name}?`)) {
      toggleJoinClub(club.id);
      setShowMembershipModal(false);
      setJoinToast(`You have left ${club.name}. You can rejoin anytime!`);
      setTimeout(() => setJoinToast(''), 3000);
    }
  };

  // New team member modal / inline input state
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    year: '3rd Year',
    department: 'CSE'
  });
  const [showAddMember, setShowAddMember] = useState(false);

  const activeClubCode = club.clubCode || club.inviteCode || 'BW-CSE-2026';
  const activeFacultyAdvisor = club.facultyAdvisor || club.coordinatorTeacher || club.facultyHead || 'Dr. Sharma';

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activeClubCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleStartEdit = () => {
    setFormData(JSON.parse(JSON.stringify(club)));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(JSON.parse(JSON.stringify(club)));
    setIsEditing(false);
    setShowAddMember(false);
  };

  const handleSave = () => {
    const normalized = {
      ...formData,
      inviteCode: formData.clubCode || formData.inviteCode || 'BW-CSE-2026',
      coordinatorTeacher: formData.facultyAdvisor || formData.coordinatorTeacher
    };
    setClub(normalized);
    try {
      localStorage.setItem(`mockClubProfile_${clubParamId}`, JSON.stringify(normalized));
    } catch (e) {
      console.error(e);
    }
    setIsEditing(false);
    setShowAddMember(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleAddTeamMember = () => {
    if (!newMember.name.trim() || !newMember.role.trim()) return;
    const memberObj = {
      id: `ct-${Date.now()}`,
      name: newMember.name.trim(),
      role: newMember.role.trim(),
      year: newMember.year,
      department: newMember.department
    };
    setFormData(prev => ({
      ...prev,
      coreTeam: [...(prev.coreTeam || []), memberObj]
    }));
    setNewMember({ name: '', role: '', year: '3rd Year', department: 'CSE' });
    setShowAddMember(false);
  };

  const handleRemoveTeamMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      coreTeam: prev.coreTeam.filter(m => m.id !== memberId)
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Banner */}
      <div className="h-72 sm:h-80 w-full relative overflow-hidden bg-gray-900">
        <img 
          src={isEditing ? formData.banner : club.banner} 
          alt={club.name} 
          className="w-full h-full object-cover opacity-75" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/50 to-transparent"></div>
        
        {/* Navigation & Status Ribbon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute top-6 left-0 right-0 flex justify-between items-center z-10">
          <Link to={`${basePath}/explore`}>
            <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Clubs
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {club.status || 'Approved Institutional Charter'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-900/70 backdrop-blur-md text-blue-200 border border-blue-400/30 flex items-center gap-1.5 shadow-sm">
              <Hash className="w-3.5 h-3.5 text-blue-300" />
              Club Code: {activeClubCode}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative z-10 space-y-6">
        {/* Edit Success Notification */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-sm">Public Club Profile Updated Successfully!</p>
                <p className="text-xs text-emerald-700">All institutional governance, schedule updates, and leadership changes are now live for all students.</p>
              </div>
            </div>
            <button onClick={() => setSaveSuccess(false)} className="text-emerald-700 hover:text-emerald-900 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <div className="relative flex-shrink-0">
            <img 
              src={isEditing ? formData.logo : club.logo} 
              alt={club.name} 
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shadow-lg border-4 border-white bg-white object-cover" 
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md border-2 border-white" title="Verified Institutional Society">
              <Check className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex-grow pt-1 w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {isEditing ? formData.name : club.name}
                  </h1>
                  <Badge variant="blue">{isEditing ? formData.category : club.category}</Badge>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Est. {isEditing ? formData.foundedYear : (club.foundedYear || '2021')}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Official Student Organization • <strong>{isEditing ? formData.department : (club.department || 'CSE Department')}</strong></span>
                </p>
              </div>

              {/* Action Buttons: Join, Copy Code, and Edit Mode */}
              <div className="flex flex-wrap items-center gap-2.5">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      className="gap-1.5 text-xs sm:text-sm text-gray-700"
                    >
                      <X className="w-4 h-4" /> Discard
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="gap-1.5 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md"
                    >
                      <Save className="w-4 h-4" /> Save Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="md"
                      variant={isMember ? 'outline' : 'primary'}
                      onClick={handleJoinClick}
                      className={`font-semibold shadow-xs ${
                        isMember ? 'text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100' : ''
                      }`}
                    >
                      {isMember ? <><Check className="w-4 h-4 mr-1.5" /> Member Joined</> : 'Join Club'}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="md" 
                      onClick={handleCopyCode} 
                      title="Copy unique club code"
                      className="gap-1.5 text-gray-700"
                    >
                      <Hash className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-mono font-bold text-xs">{activeClubCode}</span>
                      {copiedCode ? <span className="text-[11px] text-emerald-600 font-bold ml-1">Copied!</span> : <Copy className="w-3.5 h-3.5 opacity-60 ml-0.5" />}
                    </Button>

                    {/* Dedicated Edit Mode Button */}
                    <Button 
                      variant="outline"
                      size="md"
                      onClick={handleStartEdit}
                      className="gap-1.5 text-blue-700 border-blue-200 bg-blue-50/60 hover:bg-blue-100"
                      title="Edit public club profile"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 mt-4 text-sm sm:text-base max-w-3xl leading-relaxed">
              {isEditing ? formData.description : club.description}
            </p>
            
            {/* 4-Stat Strip: Members, Events, Faculty Advisor, HOD */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-gray-100 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Members</p>
                <p className="font-black text-gray-900 text-lg flex items-center gap-1.5 mt-0.5">
                  <Users className="w-4 h-4 text-blue-600"/> {club.memberCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Upcoming Events</p>
                <p className="font-black text-gray-900 text-lg flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-blue-600"/> {clubEvents.filter(e => e.status === 'Upcoming').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Faculty Advisor</p>
                <p className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-1.5 mt-0.5 truncate" title={activeFacultyAdvisor}>
                  <User className="w-4 h-4 text-blue-600 flex-shrink-0"/> 
                  <span className="truncate">{activeFacultyAdvisor}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Head of Dept (HOD)</p>
                <p className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-1.5 mt-0.5 truncate" title={club.hod}>
                  <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0"/>
                  <span className="truncate">{club.hod || 'Dr. V. K. Mathur'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE: Content Tabs                                                  */}
        {/* ========================================================================= */}
        {!isEditing ? (
          <div>
            {/* Tab navigation */}
            <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('events')}
                className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'events' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Events & Activities ({clubEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'about' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                About & Institutional Charter
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'team' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Leadership & Governance ({((club.coreTeam?.length || 0) + 2)})
              </button>
              <button
                onClick={() => setActiveTab('notices')}
                className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'notices' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Notices & Announcements ({clubAnnouncements.length})
              </button>
            </div>

            {/* Tab 1: Events */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span>Events Organized by {club.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {clubEvents.length} Total
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Participate in hackathons, bootcamps, and tournaments to earn verified certificates
                    </p>
                  </div>
                  <Link to={`${basePath}/events`}>
                    <Button variant="outline" size="sm">Browse All Campus Events</Button>
                  </Link>
                </div>

                {/* Coordinator Perspective Notice Banner */}
                {isCoordinator && (
                  <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between text-indigo-950 text-xs shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-indigo-900">Coordinator Inspection View Active</p>
                        <p className="text-[11px] text-indigo-700 mt-0.5">
                          You are viewing events from a Club Coordinator perspective. Registration triggers and student passes are hidden. Operational capacity and declared winners remain visible.
                        </p>
                      </div>
                    </div>
                    <Link to="/club-dashboard" className="hidden sm:inline-flex flex-shrink-0 ml-3">
                      <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 text-xs">
                        Open Dashboard
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Event Stage Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-gray-100">
                  <button
                    onClick={() => setEventStageFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      eventStageFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>All Events</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${eventStageFilter === 'all' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {clubEvents.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setEventStageFilter('open')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      eventStageFilter === 'open'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Open Events</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${eventStageFilter === 'open' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {openEvents.length}
                    </span>
                  </button>

                  {closedEvents.length > 0 && (
                    <button
                      onClick={() => setEventStageFilter('closed')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        eventStageFilter === 'closed'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-rose-50/50'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Registration Closed</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${eventStageFilter === 'closed' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'}`}>
                        {closedEvents.length}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => setEventStageFilter('upcoming')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      eventStageFilter === 'upcoming'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-amber-50/50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Upcoming (Not Open Yet)</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${eventStageFilter === 'upcoming' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                      {upcomingEvents.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setEventStageFilter('past')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      eventStageFilter === 'past'
                        ? 'bg-gray-800 text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Past Events</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${eventStageFilter === 'past' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {pastEvents.length}
                    </span>
                  </button>
                </div>

                {/* Event Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredClubEvents.map(event => {
                    const stage = getEventStage(event);
                    const registered = isRegistered ? isRegistered(event.id) : false;

                    return (
                      <Card key={event.id} className="flex flex-col hover:shadow-lg transition-all overflow-hidden border-gray-200 group">
                        <div className="h-48 w-full relative overflow-hidden bg-gray-900">
                          <img 
                            src={event.image} 
                            alt={event.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
                          
                          {/* Badges Overlay */}
                          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                            {stage === 'open' && (
                              <Badge variant="green" className="bg-emerald-600 text-white font-bold text-[11px] shadow-sm">
                                ● Open for Registration
                              </Badge>
                            )}

                            {stage === 'closed' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                                <Lock className="w-3 h-3" /> Registration Closed
                              </span>
                            )}

                            {stage === 'upcoming' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                                <Clock className="w-3 h-3" /> Upcoming • Not Open Yet
                              </span>
                            )}

                            {stage === 'past' && (
                              <>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-900 text-gray-200 px-2.5 py-0.5 rounded-full shadow-sm border border-gray-700">
                                  <Award className="w-3 h-3 text-amber-400" /> Past Event • Concluded
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs">
                                  <Trophy className="w-3 h-3 text-amber-600" /> Winners Declared
                                </span>
                              </>
                            )}

                            {/* Registered badge only visible to student */}
                            {registered && stage === 'open' && isStudent && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                                <CheckCircle2 className="w-3 h-3" /> Registered • Pass Active
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <CardContent className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <Link to={`${basePath}/events/${event.id}`}>
                              <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                                {event.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                              {event.description}
                            </p>
                            
                            {/* Schedule & Venue Strip */}
                            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span>{event.date} • {event.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span className="truncate">{event.venue}</span>
                              </div>
                            </div>

                            {/* Stage-Specific Info Callout */}
                            {stage === 'open' && (
                              <div className="flex items-center justify-between text-xs bg-emerald-50/80 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 mb-4">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                                  Capacity: {event.registeredCount} / {event.capacity} Enrolled
                                </span>
                                <span className="font-bold text-emerald-700">
                                  {event.capacity - event.registeredCount} seats left
                                </span>
                              </div>
                            )}

                            {stage === 'closed' && (
                              <div className="flex items-center justify-between text-xs bg-rose-50/80 text-rose-900 p-2.5 rounded-xl border border-rose-200 mb-4 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                                  Registrations Closed:
                                </span>
                                <span className="font-bold text-rose-800">
                                  {event.registeredCount} / {event.capacity} Enrolled
                                </span>
                              </div>
                            )}

                            {stage === 'upcoming' && (
                              <div className="flex items-center justify-between text-xs bg-amber-50/80 text-amber-900 p-2.5 rounded-xl border border-amber-200 mb-4">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  Registration Opens:
                                </span>
                                <span className="font-bold text-amber-800">
                                  {event.registrationOpens || 'Oct 25, 2026 • 10:00 AM'}
                                </span>
                              </div>
                            )}

                            {stage === 'past' && (
                              <div className="flex items-center justify-between text-xs bg-gray-100 text-gray-800 p-2.5 rounded-xl border border-gray-200 mb-4">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                  1st Place Champion:
                                </span>
                                <span className="font-bold text-gray-900 truncate max-w-[170px]" title={event.winners?.[0]?.name}>
                                  {event.winners?.[0]?.name || 'Official Winner Declared'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons: Conditioned on Role & Event Stage */}
                          <div className="pt-2 flex flex-wrap items-center gap-2">
                            {/* CASE 1: Club Coordinator Perspective (no registration button) */}
                            {isCoordinator ? (
                              <>
                                {stage === 'past' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSelectedWinnerEvent(event)}
                                    className="text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold gap-1.5"
                                  >
                                    <Trophy className="w-3.5 h-3.5 text-amber-600" /> Winners List
                                  </Button>
                                )}
                                <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                  <Button variant="outline" className="w-full text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 gap-1.5">
                                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> View Event Details
                                  </Button>
                                </Link>
                              </>
                            ) : isStudent ? (
                              /* CASE 2: Logged-in General Student Perspective */
                              <>
                                {stage === 'open' && (
                                  <>
                                    {registered ? (
                                      <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 gap-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Registered • View Pass
                                        </Button>
                                      </Link>
                                    ) : (
                                      <>
                                        <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                          <Button className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5">
                                            <Ticket className="w-3.5 h-3.5" /> Register Now
                                          </Button>
                                        </Link>
                                        <Link to={`${basePath}/events/${event.id}`}>
                                          <Button variant="outline" size="sm" className="text-xs">
                                            Details
                                          </Button>
                                        </Link>
                                      </>
                                    )}
                                  </>
                                )}

                                {stage === 'closed' && (
                                  <>
                                    {registered ? (
                                      <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 gap-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Registered • View Pass
                                        </Button>
                                      </Link>
                                    ) : (
                                      <>
                                        <Button 
                                          disabled 
                                          className="text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 cursor-not-allowed opacity-90 gap-1.5"
                                        >
                                          <Lock className="w-3.5 h-3.5 text-rose-600" /> Closed
                                        </Button>
                                        <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                          <Button variant="outline" className="w-full text-xs font-semibold text-gray-700 hover:text-blue-600">
                                            Event Details
                                          </Button>
                                        </Link>
                                      </>
                                    )}
                                  </>
                                )}

                                {stage === 'upcoming' && (
                                  <>
                                    <Button 
                                      disabled 
                                      className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed opacity-90 gap-1.5"
                                      title={`Registrations open on ${event.registrationOpens || 'soon'}`}
                                    >
                                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Soon
                                    </Button>
                                    <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                      <Button variant="outline" className="w-full text-xs font-semibold text-gray-700 hover:text-blue-600">
                                        View Event Profile
                                      </Button>
                                    </Link>
                                  </>
                                )}

                                {stage === 'past' && (
                                  <>
                                    <Button 
                                      onClick={() => setSelectedWinnerEvent(event)} 
                                      className="flex-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shadow-xs"
                                    >
                                      <Trophy className="w-3.5 h-3.5 text-amber-100" /> Winners List
                                    </Button>
                                    <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                      <Button variant="outline" className="w-full text-xs font-semibold text-gray-700 hover:text-blue-600">
                                        Past Recap
                                      </Button>
                                    </Link>
                                  </>
                                )}
                              </>
                            ) : (
                              /* CASE 3: Logged-Out / Guest Visitor Perspective */
                              <>
                                {stage === 'open' && (
                                  <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                    <Button className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5">
                                      Register for Event <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                  </Link>
                                )}

                                {stage === 'closed' && (
                                  <>
                                    <Button 
                                      disabled 
                                      className="text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 cursor-not-allowed opacity-90 gap-1.5"
                                    >
                                      <Lock className="w-3.5 h-3.5 text-rose-600" /> Closed
                                    </Button>
                                    <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                      <Button variant="outline" className="w-full text-xs font-semibold text-gray-700 hover:text-blue-600">
                                        View Event
                                      </Button>
                                    </Link>
                                  </>
                                )}

                                {stage === 'upcoming' && (
                                  <>
                                    <Button 
                                      disabled 
                                      className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed opacity-90 gap-1.5"
                                    >
                                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Soon
                                    </Button>
                                    <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                      <Button variant="outline" className="w-full text-xs font-semibold text-gray-700 hover:text-blue-600">
                                        View Event
                                      </Button>
                                    </Link>
                                  </>
                                )}

                                {stage === 'past' && (
                                  <>
                                    <Button 
                                      onClick={() => setSelectedWinnerEvent(event)} 
                                      className="flex-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shadow-xs"
                                    >
                                      <Trophy className="w-3.5 h-3.5 text-amber-100" /> Winners List
                                    </Button>
                                    <Link to={`${basePath}/events/${event.id}`} className="flex-1">
                                      <Button variant="outline" className="w-full text-xs font-semibold text-gray-700 hover:text-blue-600">
                                        Past Recap
                                      </Button>
                                    </Link>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Empty State when no events match the stage filter */}
                {filteredClubEvents.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 text-base">No {eventStageFilter} events found</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      There are currently no events matching this stage filter for {club.name}.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEventStageFilter('all')}
                      className="mt-4 text-xs"
                    >
                      Show All Events ({clubEvents.length})
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: About & Institutional Charter */}
            {activeTab === 'about' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-bold text-gray-900">About {club.name}</h3>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4 text-gray-700 leading-relaxed text-sm">
                      <p>
                        {club.description}
                      </p>
                      <p>
                        The club serves as an incubator for creative thinking and real-world implementation. Through weekly coding workshops, annual hackathons, and guest seminars from industry experts, members gain practical engineering experience.
                      </p>
                      
                      {/* Membership Eligibility Notice */}
                      <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 mt-4">
                        <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" /> Membership Eligibility
                        </h4>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          {club.eligibility || 'Open to all undergraduate and postgraduate students of the college with an active student ID card.'}
                        </p>
                      </div>

                      {/* Institutional Charter Verification Badge */}
                      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-emerald-950">Official Institutional Charter Endorsement</p>
                            <p className="text-[11px] text-emerald-700">Audited and approved by Department HOD and Academic Board.</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-xs text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-200">
                          {activeClubCode}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Institutional Governance Details */}
                <div className="space-y-6">
                  <Card className="border-gray-200">
                    <CardHeader className="bg-gray-50/80 border-b border-gray-100 py-3.5 px-6">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" /> Institutional Governance
                      </h3>
                    </CardHeader>
                    <CardContent className="p-6 text-xs text-gray-600 space-y-4">
                      <div>
                        <p className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400 mb-0.5">Parent Department</p>
                        <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          {club.department || ('Department of ' + club.category)}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <p className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400 mb-0.5">Head of Department (HOD)</p>
                        <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          {club.hod || 'Dr. V. K. Mathur'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <p className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400 mb-0.5">Faculty Advisor</p>
                        <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          {activeFacultyAdvisor}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <p className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400 mb-0.5">Meeting Schedule</p>
                        <p className="text-gray-800 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          {club.meetingSchedule || 'Every Wednesday • 4:30 PM - 6:00 PM'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <p className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400 mb-0.5">Campus Base / Room</p>
                        <p className="text-gray-800 font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {club.meetingVenue || 'CSE Academic Block, 3rd Floor'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <p className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400 mb-0.5">Contact Queries</p>
                        <p className="text-gray-800 font-mono text-[11px] mt-0.5">
                          {club.phone || '+91 98101 23456'}
                        </p>
                        <p className="text-gray-600 text-[11px] truncate">
                          {club.email || 'club.cse@college.edu'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <p className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400 mb-0.5">Unique Club Code</p>
                        <div className="flex items-center justify-between gap-2 mt-1 bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                          <span className="font-mono font-bold text-blue-700 text-xs">
                            {activeClubCode}
                          </span>
                          <button 
                            onClick={handleCopyCode}
                            className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
                          >
                            {copiedCode ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tab 3: Leadership Team & Institutional Advisors */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Faculty Advisor */}
                  <Card className="text-center p-6 bg-gradient-to-b from-indigo-50/70 to-blue-50/30 border-indigo-100">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                      {(activeFacultyAdvisor).charAt(0)}
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{activeFacultyAdvisor}</h4>
                    <p className="text-xs text-indigo-700 font-semibold mt-0.5">Faculty Advisor</p>
                    <p className="text-[11px] text-gray-500 mt-2">{club.department ? club.department.split('&')[0] : 'Department Faculty'}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
                      Faculty Advisor
                    </span>
                  </Card>

                  {/* HOD Endorsement */}
                  <Card className="text-center p-6 bg-gradient-to-b from-blue-50/60 to-gray-50 border-blue-100">
                    <div className="w-16 h-16 rounded-full bg-blue-700 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                      {(club.hod || 'D').charAt(0)}
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{club.hod || 'Dr. V. K. Mathur'}</h4>
                    <p className="text-xs text-blue-700 font-semibold mt-0.5">Head of Department (HOD)</p>
                    <p className="text-[11px] text-gray-500 mt-2">Departmental Authority</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                      Charter Endorser
                    </span>
                  </Card>

                  {/* Core Team Members */}
                  {club.coreTeam && club.coreTeam.map(member => (
                    <Card key={member.id} className="text-center p-6 hover:shadow-md transition-shadow border-gray-200">
                      <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center mx-auto mb-3">
                        {member.name.charAt(0)}
                      </div>
                      <h4 className="font-bold text-gray-900 text-base">{member.name}</h4>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">{member.role}</p>
                      <p className="text-[11px] text-gray-400 mt-2">{member.department} • {member.year}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Notices */}
            {activeTab === 'notices' && (
              <div className="space-y-4 max-w-4xl">
                {clubAnnouncements.length > 0 ? (
                  clubAnnouncements.map(notice => (
                    <Card key={notice.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Megaphone className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-base">{notice.title}</h4>
                            <p className="text-xs text-gray-400">{notice.date}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mt-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          {notice.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-700 font-semibold">No recent announcements</p>
                    <p className="text-xs text-gray-500 mt-1">Check back later for updates from this club.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* EDIT MODE: Interactive Form for Public Profile                           */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Active Edit Mode Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-900 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Editing Public Club Profile</h3>
                  <p className="text-xs text-amber-800">
                    You are modifying live parameters for {club.name}. Changes will be visible immediately to all students on the public campus portal.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={handleCancelEdit} className="text-xs border-amber-300 hover:bg-amber-100">
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm">
                  Save Live Profile
                </Button>
              </div>
            </div>

            {/* Form Card 1: Identity & Categorization */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Basic Identity & Category</h2>
                </div>
                <span className="text-xs text-gray-400">Public profile header</span>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input 
                      label="Club Name" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Byte Warriors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Input 
                      label="Founded Year" 
                      value={formData.foundedYear}
                      onChange={e => setFormData({ ...formData, foundedYear: e.target.value })}
                      placeholder="e.g. 2021"
                    />
                  </div>

                  <div>
                    <Input 
                      label="Unique Club Code" 
                      value={formData.clubCode || formData.inviteCode}
                      onChange={e => setFormData({ 
                        ...formData, 
                        clubCode: e.target.value.toUpperCase(),
                        inviteCode: e.target.value.toUpperCase() 
                      })}
                      placeholder="e.g. BW-CSE-2026"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Official university code uniquely representing this club</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institutional Charter Status
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.status}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2 bg-gray-50 text-gray-600 sm:text-sm font-medium"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Card 2: Institutional Governance (Signup Details) */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-base font-bold text-gray-900">Institutional Governance & Authority</h2>
                </div>
                <Badge variant="blue">Audited College Credentials</Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Academic Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {DEPARTMENT_OPTIONS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <Input 
                    label="Head of Department (HOD)" 
                    value={formData.hod}
                    onChange={e => setFormData({ ...formData, hod: e.target.value })}
                    placeholder="e.g. Dr. V. K. Mathur"
                    required
                  />

                  <Input 
                    label="Faculty Advisor" 
                    value={formData.facultyAdvisor || formData.coordinatorTeacher || formData.facultyHead}
                    onChange={e => setFormData({ 
                      ...formData, 
                      facultyAdvisor: e.target.value,
                      coordinatorTeacher: e.target.value,
                      facultyHead: e.target.value 
                    })}
                    placeholder="e.g. Dr. Sharma / Dr. Neha Verma"
                    required
                  />

                  <Input 
                    label="Coordinator Contact Phone" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98101 23456"
                    required
                  />

                  <Input 
                    label="Official Club / Contact Email" 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. club.cse@college.edu"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Card 3: Operations & Meetings (Public Profile Details) */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <h2 className="text-base font-bold text-gray-900">Operations, Schedule & Campus Venue</h2>
                </div>
                <Badge variant="purple">Public Profile</Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Regular Meeting Schedule" 
                    value={formData.meetingSchedule}
                    onChange={e => setFormData({ ...formData, meetingSchedule: e.target.value })}
                    placeholder="e.g. Every Wednesday • 4:30 PM - 6:00 PM"
                  />

                  <Input 
                    label="Campus Base / Venue" 
                    value={formData.meetingVenue}
                    onChange={e => setFormData({ ...formData, meetingVenue: e.target.value })}
                    placeholder="e.g. Main Lab 3, CSE Block, 3rd Floor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membership Eligibility Note
                  </label>
                  <input 
                    type="text"
                    value={formData.eligibility}
                    onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
                    placeholder="e.g. Open to all students with valid college ID"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Card 4: Brand Visuals & Media */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base font-bold text-gray-900">Cover Banner & Club Emblem</h2>
                </div>
                <span className="text-xs text-gray-400">Visual brand identity</span>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Banner Selector */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Cover Banner URL</label>
                    <span className="text-xs text-gray-400">Quick presets below</span>
                  </div>
                  <Input 
                    value={formData.banner}
                    onChange={e => setFormData({ ...formData, banner: e.target.value })}
                    placeholder="https://..."
                  />
                  
                  {/* Banner Presets */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">Presets:</span>
                    {BANNER_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, banner: preset.url })}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          formData.banner === preset.url 
                            ? 'bg-blue-50 text-blue-700 border-blue-400 font-bold' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Banner Thumbnail Preview */}
                  <div className="mt-3 h-28 rounded-xl overflow-hidden border border-gray-200 relative">
                    <img src={formData.banner} alt="Banner Preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-3 bg-black/60 px-2 py-0.5 rounded text-[11px] text-white backdrop-blur-xs">
                      Banner Preview
                    </div>
                  </div>
                </div>

                {/* Logo / Emblem Selector */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Club Emblem / Logo URL</label>
                    <span className="text-xs text-gray-400">Quick presets below</span>
                  </div>
                  <div className="flex gap-4 items-start">
                    <img 
                      src={formData.logo} 
                      alt="Logo Preview" 
                      className="w-16 h-16 rounded-xl border border-gray-200 bg-white object-cover shadow-sm flex-shrink-0" 
                    />
                    <div className="flex-grow space-y-2">
                      <Input 
                        value={formData.logo}
                        onChange={e => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="https://..."
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400">Presets:</span>
                        {LOGO_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, logo: preset.url })}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              formData.logo === preset.url 
                                ? 'bg-blue-50 text-blue-700 border-blue-400 font-bold' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Card 5: Mission & Objectives */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">About & Mission Statement</h2>
                </div>
                <span className="text-xs text-gray-400">Published on public overview tab</span>
              </CardHeader>
              <CardContent className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Purpose & Activities
                </label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-800 leading-relaxed" 
                  rows="4" 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the club's core objective, weekly initiatives, hands-on projects, and vision..."
                />
              </CardContent>
            </Card>

            {/* Form Card 6: Core Student Leadership Roster */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h2 className="text-base font-bold text-gray-900">Core Student Leadership Roster</h2>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowAddMember(true)}
                  className="gap-1.5 text-xs text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Team Member
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Add Member inline form */}
                {showAddMember && (
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">New Student Coordinator</h3>
                      <button onClick={() => setShowAddMember(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <Input 
                        placeholder="Student Full Name"
                        value={newMember.name}
                        onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                      />
                      <Input 
                        placeholder="Role (e.g. Tech Lead)"
                        value={newMember.role}
                        onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                      />
                      <select
                        value={newMember.year}
                        onChange={e => setNewMember({ ...newMember, year: e.target.value })}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Dept (e.g. CSE)"
                          value={newMember.department}
                          onChange={e => setNewMember({ ...newMember, department: e.target.value })}
                        />
                        <Button size="sm" onClick={handleAddTeamMember} className="flex-shrink-0 text-xs">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Roster */}
                <div className="space-y-2.5">
                  {formData.coreTeam && formData.coreTeam.map((member, idx) => (
                    <div key={member.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{member.name}</p>
                          <p className="text-xs text-blue-600 font-medium">{member.role} • {member.department} ({member.year})</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove member from core team"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!formData.coreTeam || formData.coreTeam.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No student team members configured yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sticky Bottom Actions */}
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes on public profile</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Discard Changes
                </Button>
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-0 gap-2">
                  <Check className="w-4 h-4" /> Save Live Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Winners List Modal */}
      {selectedWinnerEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <Trophy className="w-6 h-6 text-yellow-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Official Winners List</h3>
                  <p className="text-xs text-amber-100 truncate max-w-sm">
                    {selectedWinnerEvent.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWinnerEvent(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Summary Strip */}
            <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Concluded: <strong>{selectedWinnerEvent.date}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>{selectedWinnerEvent.venue}</span>
              </div>
            </div>

            {/* Podium Cards */}
            <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-gray-500 font-medium">
                Official podium verified and recognized by {club.name} and academic faculty:
              </p>

              {selectedWinnerEvent.winners && selectedWinnerEvent.winners.length > 0 ? (
                selectedWinnerEvent.winners.map((winner, idx) => {
                  const isGold = idx === 0 || winner.rank.includes('1st');
                  const isSilver = idx === 1 || winner.rank.includes('2nd');

                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                        isGold 
                          ? 'bg-gradient-to-r from-amber-50/90 via-yellow-50/60 to-white border-amber-300 shadow-xs' 
                          : isSilver 
                            ? 'bg-gradient-to-r from-slate-50 to-white border-slate-300' 
                            : 'bg-gradient-to-r from-orange-50/50 to-white border-orange-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-xs ${
                          isGold 
                            ? 'bg-amber-500 text-white shadow-amber-200' 
                            : isSilver 
                              ? 'bg-slate-400 text-white' 
                              : 'bg-amber-700 text-white'
                        }`}>
                          {isGold ? '🥇' : isSilver ? '🥈' : '🥉'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isGold ? 'bg-amber-200/80 text-amber-900' : isSilver ? 'bg-slate-200 text-slate-800' : 'bg-orange-200/80 text-orange-900'
                            }`}>
                              {winner.rank}
                            </span>
                            <span className="text-xs text-gray-500">{winner.branch}</span>
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-base mt-1">
                            {winner.name}
                          </h4>
                          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                            <Award className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            {winner.prize}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Winners are being finalized by the organizing committee.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedWinnerEvent(null)}
                className="text-xs text-gray-600"
              >
                Close
              </Button>
              <Link to={`${basePath}/events/${selectedWinnerEvent.id}`} onClick={() => setSelectedWinnerEvent(null)}>
                <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <span>Go to Full Event Showcase</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {joinToast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-950 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 border border-gray-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{joinToast}</span>
        </div>
      )}

      {/* Direct Join Club Modal (No Invitation Code Needed) */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Join {club.name}</h3>
                  <p className="text-xs text-blue-100">Official campus student registration</p>
                </div>
              </div>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Zero Code Required Banner */}
            <div className="px-6 py-3.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">No Invitation Code Required</p>
                <p className="text-emerald-800 text-[11px]">UniSphere operates open campus access. Just verify your student credentials to join immediately.</p>
              </div>
            </div>

            {/* Join Form */}
            <form onSubmit={handleConfirmJoin} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input 
                  label="Full Name" 
                  placeholder="e.g. Priyanshu Roy"
                  value={joinFormData.name}
                  onChange={e => setJoinFormData({ ...joinFormData, name: e.target.value })}
                  required
                />
                <Input 
                  label="College Roll No / ID" 
                  placeholder="e.g. CS26042"
                  value={joinFormData.collegeId}
                  onChange={e => setJoinFormData({ ...joinFormData, collegeId: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input 
                  label="College Email" 
                  type="email"
                  placeholder="name@campus.edu"
                  value={joinFormData.email}
                  onChange={e => setJoinFormData({ ...joinFormData, email: e.target.value })}
                  required
                />
                <Input 
                  label="Contact Phone" 
                  placeholder="+91 98123 45678"
                  value={joinFormData.phone}
                  onChange={e => setJoinFormData({ ...joinFormData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select 
                    value={joinFormData.department}
                    onChange={e => setJoinFormData({ ...joinFormData, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option>CSE</option>
                    <option>IT</option>
                    <option>ECE</option>
                    <option>ME</option>
                    <option>Civil</option>
                    <option>Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Academic Year
                  </label>
                  <select 
                    value={joinFormData.year}
                    onChange={e => setJoinFormData({ ...joinFormData, year: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Interests / What excites you about this club?
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Competitive programming, hackathons, robotics"
                  value={joinFormData.interests}
                  onChange={e => setJoinFormData({ ...joinFormData, interests: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md gap-1.5"
                >
                  <UserCheck className="w-4 h-4" /> Submit & Join Club
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Membership Status Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-extrabold text-lg">Active Membership</h3>
              </div>
              <button 
                onClick={() => setShowMembershipModal(false)} 
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Member
                </span>
                <h4 className="font-bold text-gray-900 text-base">{club.name}</h4>
                <p className="text-xs text-gray-500">Department of {club.department}</p>
              </div>

              <div className="text-xs text-gray-600 space-y-2 border-y border-gray-100 py-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Regular Meetings</span>
                  <span className="font-medium text-gray-900">{club.meetingSchedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Base Location</span>
                  <span className="font-medium text-gray-900">{club.meetingVenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Club Identifier</span>
                  <span className="font-mono font-bold text-gray-900">{activeClubCode}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link to="/student" onClick={() => setShowMembershipModal(false)}>
                  <Button className="w-full text-xs">
                    Go to Student Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleLeaveClub}
                  className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  Leave Club Membership
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
