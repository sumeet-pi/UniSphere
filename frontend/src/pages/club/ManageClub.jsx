import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clubs } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Pencil, 
  Copy, 
  Check, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  Building2, 
  Sparkles, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  ArrowLeft, 
  AlertCircle, 
  X, 
  Save, 
  RotateCcw, 
  FileText, 
  User, 
  Hash, 
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

export function ManageClub() {
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const baseClub = clubs.find(c => c.id === clubId) || clubs[0];

  // Initialize initial profile data merging baseClub with signup user information
  const getInitialClubData = () => {
    try {
      const stored = localStorage.getItem(`mockClubProfile_${clubId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          clubCode: parsed.clubCode || parsed.inviteCode || 'BW-CSE-2026',
          facultyAdvisor: parsed.facultyAdvisor || parsed.coordinatorTeacher || parsed.facultyHead || 'Dr. Sharma'
        };
      }
    } catch (e) {
      console.error(e);
    }

    const initialCode = user?.clubCode || 'BW-CSE-2026';
    const initialAdvisor = user?.facultyAdvisor || user?.coordinatorTeacher || baseClub.facultyHead || 'Dr. Sharma';

    return {
      id: baseClub.id,
      name: user?.clubName || baseClub.name || 'Byte Warriors',
      category: user?.category || baseClub.category || 'Technical & Coding',
      department: user?.department || 'Computer Science & Engineering',
      hod: user?.hod || 'Dr. V. K. Mathur',
      facultyAdvisor: initialAdvisor,
      coordinatorTeacher: initialAdvisor,
      facultyHead: initialAdvisor,
      phone: user?.phone || '+91 98101 23456',
      email: user?.email || 'bytewarriors@college.edu',
      clubCode: initialCode,
      status: 'Approved Institutional Charter',
      memberCount: baseClub.memberCount || 128,
      upcomingEventsCount: baseClub.upcomingEventsCount || 6,
      meetingSchedule: 'Every Wednesday • 4:30 PM - 6:00 PM',
      meetingVenue: 'Main Lab 3, CSE Academic Block, 3rd Floor',
      foundedYear: '2021',
      description: baseClub.description || 'The official coding and technology club of the CSE Department. We organize hackathons, coding contests, workshops, and industry tech talks to build hands-on engineering capabilities.',
      eligibility: 'Open to all enrolled undergraduate and postgraduate students of UniSphere with a valid college ID card.',
      banner: baseClub.banner || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
      logo: baseClub.logo || 'https://api.dicebear.com/7.x/shapes/svg?seed=ByteWarriors&backgroundColor=0a5c36,18181b',
      coreTeam: baseClub.coreTeam && baseClub.coreTeam.length > 0 ? baseClub.coreTeam : [
        { id: 'ct1', name: 'Aarav Kumar', role: 'Student Coordinator', year: '3rd Year', department: 'CSE' },
        { id: 'ct2', name: 'Priya Singh', role: 'Technical Lead', year: '3rd Year', department: 'CSE' },
        { id: 'ct3', name: 'Rahul Verma', role: 'Event Manager', year: '2nd Year', department: 'CSE' }
      ]
    };
  };

  const [clubData, setClubData] = useState(getInitialClubData);
  const [formData, setFormData] = useState(getInitialClubData);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // New team member modal / inline input state
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    year: '3rd Year',
    department: 'CSE'
  });
  const [showAddMember, setShowAddMember] = useState(false);

  // Sync formData whenever editing is toggled on
  const handleStartEdit = () => {
    setFormData(JSON.parse(JSON.stringify(clubData)));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(JSON.parse(JSON.stringify(clubData)));
    setIsEditing(false);
    setShowAddMember(false);
  };

  const handleSave = () => {
    // Keep clubCode and legacy inviteCode in sync
    const normalized = {
      ...formData,
      inviteCode: formData.clubCode || formData.inviteCode || 'BW-CSE-2026',
      coordinatorTeacher: formData.facultyAdvisor || formData.coordinatorTeacher
    };
    setClubData(normalized);
    try {
      localStorage.setItem(`mockClubProfile_${clubId}`, JSON.stringify(normalized));
    } catch (e) {
      console.error(e);
    }
    setIsEditing(false);
    setShowAddMember(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(clubData.clubCode || clubData.inviteCode || 'BW-CSE-2026');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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

  const handleRemoveTeamMember = (id) => {
    setFormData(prev => ({
      ...prev,
      coreTeam: prev.coreTeam.filter(m => m.id !== id)
    }));
  };

  const activeClubCode = clubData.clubCode || clubData.inviteCode || 'BW-CSE-2026';
  const activeFacultyAdvisor = clubData.facultyAdvisor || clubData.coordinatorTeacher || clubData.facultyHead || 'Dr. Sharma';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {isEditing ? 'Edit Club Profile & Details' : 'My Club Management'}
            </h1>
            <Badge variant={isEditing ? 'yellow' : 'green'}>
              {isEditing ? 'Editing Mode Active' : 'Live Institutional Record'}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {isEditing 
              ? 'Update institutional governance, public profile information, logistics, and student roster.' 
              : `Comprehensive overview and administrative record for ${clubData.name}.`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancelEdit} 
                className="gap-2 flex-1 sm:flex-none text-gray-700"
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="gap-2 flex-1 sm:flex-none shadow-md bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              >
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </>
          ) : (
            <>
              <Link to={`/explore/${clubData.id}`} target="_blank" className="flex-1 sm:flex-none">
                <Button variant="outline" className="gap-2 w-full">
                  Public Profile <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
              <Button 
                onClick={handleStartEdit} 
                className="gap-2 flex-1 sm:flex-none shadow-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Pencil className="w-4 h-4" /> Edit Club Details
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-sm">Club Profile & Details Saved Successfully!</p>
              <p className="text-xs text-emerald-700">All updates have been synced to the database and your public profile.</p>
            </div>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-700 hover:text-emerald-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Showcase Banner */}
      <div className="relative h-60 sm:h-64 rounded-3xl overflow-hidden shadow-md border border-gray-200 group bg-gray-900">
        <img 
          src={isEditing ? formData.banner : clubData.banner} 
          alt={clubData.name} 
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

        {/* Floating Status & Club Code */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {clubData.status}
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-blue-900/60 backdrop-blur-md text-blue-200 border border-blue-400/30 flex items-center gap-1.5 shadow-sm">
            <Hash className="w-3.5 h-3.5 text-blue-300" />
            Club Code: {activeClubCode}
          </span>
        </div>

        {/* Club Profile Card Overlay */}
        <div className="absolute bottom-5 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={isEditing ? formData.logo : clubData.logo} 
                alt={clubData.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-xl bg-white object-cover" 
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow border border-white" title="Verified Society">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-white">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black drop-shadow tracking-tight">
                  {isEditing ? formData.name : clubData.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-500/80 text-white backdrop-blur-xs">
                  {isEditing ? formData.category : clubData.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 mt-1 font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-300" />
                {isEditing ? formData.department : clubData.department}
                <span className="text-white/40">•</span>
                <span>Est. {isEditing ? formData.foundedYear : clubData.foundedYear}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Click to copy unique club code"
            >
              <Hash className="w-3.5 h-3.5 text-blue-300" />
              <span>Club Code: <strong className="font-mono text-amber-300">{activeClubCode}</strong></span>
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4-Stat High Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Members</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{clubData.memberCount}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Enrolled students</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Events Hosted</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{clubData.upcomingEventsCount}</p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">Conducted this term</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Faculty Advisor</span>
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-base font-bold text-gray-900 truncate" title={activeFacultyAdvisor}>
            {activeFacultyAdvisor}
          </p>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Designated Faculty</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Parent Department</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-base font-bold text-gray-900 truncate" title={clubData.department}>
            {clubData.department.split('&')[0]}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Department verified</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE: Comprehensive details taken during Signup & Public Profile   */}
      {/* ========================================================================= */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Section 1: Departmental & Institutional Leadership (Signup details) */}
          <Card className="border-gray-200 shadow-2xs overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Institutional Governance & Authority</h2>
                  <p className="text-xs text-gray-500">Official college authority details verified during club registration</p>
                </div>
              </div>
              <Badge variant="blue">Audited Credentials</Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Parent Academic Department</span>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    {clubData.department}
                  </p>
                  <p className="text-[11px] text-gray-500">Approved academic parent wing</p>
                </div>

                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Head of Department (HOD)</span>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    {clubData.hod}
                  </p>
                  <p className="text-[11px] text-gray-500">Departmental Authority & Endorsement</p>
                </div>

                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Faculty Advisor</span>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    {activeFacultyAdvisor}
                  </p>
                  <p className="text-[11px] text-gray-500">Designated Department Faculty</p>
                </div>

                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Coordinator Contact Phone</span>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2 font-mono">
                    <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {clubData.phone}
                  </p>
                  <p className="text-[11px] text-gray-500">For administrative queries & SMS alerts</p>
                </div>

                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Official Club / Contact Email</span>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2 truncate">
                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{clubData.email}</span>
                  </p>
                  <p className="text-[11px] text-gray-500">University domain mailbox</p>
                </div>

                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Unique Club Code</span>
                  <p className="text-sm font-bold text-indigo-700 flex items-center gap-2 font-mono">
                    <Hash className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    {activeClubCode}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Official University Code</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Meeting Logistics & Campus Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Operations & Logistics</h2>
                    <p className="text-xs text-gray-500">Schedule and venue published on public profile</p>
                  </div>
                </div>
                <Badge variant="purple">Public Profile</Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Meeting Schedule</span>
                    <p className="text-sm font-bold text-gray-900">{clubData.meetingSchedule}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Recurring weekly assembly for general members and project tracks</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Campus Venue / Room Base</span>
                    <p className="text-sm font-bold text-gray-900">{clubData.meetingVenue}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Reserved academic infrastructure</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                  <Hash className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Unique Club Code</span>
                    <div className="flex items-center justify-between mt-1 bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-lg">
                      <span className="font-mono font-bold text-amber-900 text-sm tracking-wide">{activeClubCode}</span>
                      <button 
                        onClick={handleCopyCode}
                        className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded border border-amber-300 shadow-2xs"
                      >
                        {copiedCode ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: About & Mission Statement */}
            <Card className="border-gray-200 shadow-2xs">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Charter & Mission</h2>
                    <p className="text-xs text-gray-500">Club charter purpose and membership eligibility</p>
                  </div>
                </div>
                <Badge variant="green">Approved Mission</Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">About & Purpose</span>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    {clubData.description}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Membership Eligibility</span>
                  <p className="text-xs text-blue-900 bg-blue-50/70 p-3 rounded-xl border border-blue-100 leading-relaxed font-medium">
                    {clubData.eligibility}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 4: Core Student Leadership Team */}
          <Card className="border-gray-200 shadow-2xs overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-4 px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Leadership & Advisory</h2>
                  <p className="text-xs text-gray-500">Faculty advisor and student coordinators</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleStartEdit} className="gap-1.5 text-xs">
                <Pencil className="w-3.5 h-3.5" /> Manage Team
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Faculty Advisor card */}
                <div className="bg-gradient-to-b from-indigo-50/70 to-blue-50/40 p-4 rounded-xl border border-indigo-100 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center mx-auto mb-2 shadow-xs">
                    {(activeFacultyAdvisor).charAt(0)}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{activeFacultyAdvisor}</h3>
                  <p className="text-xs text-indigo-700 font-semibold">Faculty Advisor</p>
                  <span className="inline-block px-2 py-0.5 bg-indigo-100/80 text-indigo-800 text-[10px] font-bold rounded-full mt-2">
                    {clubData.department.split('&')[0]}
                  </span>
                </div>

                {/* Student members */}
                {clubData.coreTeam && clubData.coreTeam.map(member => (
                  <div key={member.id} className="bg-white p-4 rounded-xl border border-gray-200 text-center hover:border-blue-300 transition-colors shadow-2xs">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center mx-auto mb-2">
                      {member.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{member.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{member.role}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{member.department} • {member.year}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* ========================================================================= */
        /* EDIT MODE: Interactive, multi-section configuration form                  */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Active Edit Alert Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-900 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">You are editing live club parameters</h3>
                <p className="text-xs text-amber-800">
                  Update institutional records, advisor details, meeting schedule, and visual assets. Changes are reflected in both public explore pages and member rosters.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="text-xs border-amber-300 hover:bg-amber-100">
                Discard
              </Button>
              <Button size="sm" onClick={handleSave} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm">
                Save Profile
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

          {/* Form Card 2: Departmental & Institutional Leadership (Signup Details) */}
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
              <span>Unsaved changes in edit mode</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleCancelEdit}>
                Discard Changes
              </Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-0 gap-2">
                <Check className="w-4 h-4" /> Save Profile Updates
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
