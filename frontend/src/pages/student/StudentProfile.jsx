import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoredClubs, getStoredEvents, getStoredStudentProfile } from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building2, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Edit3, 
  Save, 
  X, 
  Share2, 
  Ticket, 
  Award, 
  ExternalLink, 
  Globe, 
  Sparkles, 
  Download, 
  Printer, 
  QrCode, 
  Check, 
  Plus, 
  Trash2,
  BookOpen,
  Hash,
  Activity,
  Layers,
  HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function StudentProfile() {
  const { user, signup, joinedClubIds, registeredEventIds } = useAuth();

  // Load custom student profile from localStorage or fallback to auth user / defaults
  const getInitialProfile = () => {
    const stored = getStoredStudentProfile();
    return {
      ...stored,
      name: user?.name || stored.name || 'Vikram Singh',
      email: user?.email || stored.email || 'vikram.singh@college.edu'
    };
  };

  const [profile, setProfile] = useState(getInitialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newInterestInput, setNewInterestInput] = useState('');

  // Associated datasets
  const allClubs = getStoredClubs();
  const allEvents = getStoredEvents();
  const myClubs = allClubs.filter(c => joinedClubIds.includes(c.id));
  const myEvents = allEvents.filter(e => registeredEventIds.includes(e.id));
  const completedEvents = myEvents.filter(e => e.status === 'Past');

  // Handle Edit Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(formData);
    localStorage.setItem('mockStudentProfile', JSON.stringify(formData));
    if (signup) {
      signup({ ...user, ...formData });
    }
    setIsEditing(false);
    setToastMessage('Student profile updated successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  // Add & remove skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (!formData.skills.includes(newSkillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkillInput.trim()] });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  // Add & remove interest
  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!newInterestInput.trim()) return;
    if (!formData.interests.includes(newInterestInput.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, newInterestInput.trim()] });
    }
    setNewInterestInput('');
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interestToRemove)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Profile Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white/20 shadow-lg bg-gray-800"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-indigo-700 shadow-xs" title="Student Status: Active" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Verified Institutional Scholar
                </span>
                <span className="text-xs text-blue-200 font-mono bg-blue-900/60 px-2.5 py-0.5 rounded-lg border border-blue-400/30">
                  ID: {profile.classRollNo}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {profile.name}
              </h1>

              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                {profile.course} in {profile.branch} • {profile.sem} ({profile.year})
              </p>

              <p className="text-[11px] text-blue-200">
                Department of {profile.department} • University Roll: <span className="font-mono font-bold text-white">{profile.universityRollNo}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {!isEditing ? (
              <>
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md gap-2 border-0 text-xs sm:text-sm"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </Button>
                <Button 
                  onClick={() => setShowIdCardModal(true)} 
                  variant="outline" 
                  className="text-white border-white/40 hover:bg-white/10 gap-2 font-medium text-xs sm:text-sm"
                >
                  <QrCode className="w-4 h-4" /> Virtual Student ID
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit} 
                  className="text-white border-white/40 hover:bg-white/10 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile} 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Academic Profile & Co-Curricular Track */}
        <div className="lg:col-span-2 space-y-6">
          {/* Institutional Academic Credentials Card */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center bg-gray-50/70 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Academic & College Record</h2>
                  <p className="text-xs text-gray-500">Official student registry verified by University Examination Cell</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Active Enrolled
              </span>
            </CardHeader>
            <CardContent className="p-6">
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class Roll Number</span>
                    <p className="text-sm font-mono font-bold text-gray-900">{profile.classRollNo}</p>
                    <p className="text-[11px] text-gray-500">Department Section A</p>
                  </div>

                  <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">University Registration No</span>
                    <p className="text-sm font-mono font-bold text-gray-900">{profile.universityRollNo}</p>
                    <p className="text-[11px] text-gray-500">Permanent Campus ID</p>
                  </div>

                  <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Degree Program & Branch</span>
                    <p className="text-sm font-bold text-gray-900">{profile.course}</p>
                    <p className="text-[11px] text-gray-500">{profile.branch}</p>
                  </div>

                  <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Semester & Year</span>
                    <p className="text-sm font-bold text-gray-900">{profile.sem}</p>
                    <p className="text-[11px] text-gray-500">{profile.year} • Batch {profile.admissionYear} - {profile.graduatingYear}</p>
                  </div>

                  <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">College Email</span>
                    <p className="text-sm font-semibold text-gray-900 truncate">{profile.email}</p>
                    <p className="text-[11px] text-gray-500">Google Workspace SSO</p>
                  </div>

                  <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact Phone</span>
                    <p className="text-sm font-semibold text-gray-900">{profile.phone}</p>
                    <p className="text-[11px] text-gray-500">SMS Alerts & WhatsApp</p>
                  </div>

                  <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Blood Group</span>
                    <p className="text-sm font-bold text-gray-900">{profile.bloodGroup}</p>
                    <p className="text-[11px] text-gray-500">Medical Dispensary Record</p>
                  </div>

                  <div className="p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Emergency Contact</span>
                    <p className="text-sm font-semibold text-gray-900">{profile.emergencyContact}</p>
                    <p className="text-[11px] text-gray-500">Guardian / Next of Kin</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Avatar Image URL</label>
                      <input 
                        type="text" 
                        value={formData.avatar}
                        onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Current Semester</label>
                      <input 
                        type="text" 
                        value={formData.sem}
                        onChange={e => setFormData({ ...formData, sem: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
                      <input 
                        type="text" 
                        value={formData.bloodGroup}
                        onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact</label>
                      <input 
                        type="text" 
                        value={formData.emergencyContact}
                        onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Bio / Student Statement</label>
                    <textarea 
                      rows={3}
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                    />
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Student Bio & Personal Statement */}
          {!isEditing && (
            <Card>
              <CardHeader className="pb-3 bg-gray-50/70 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Student Bio & Statement</h3>
                <p className="text-xs text-gray-500">Public intro visible to club coordinators and campus peers</p>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed">
                  "{profile.bio}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skills & Technical Interests */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center bg-gray-50/70 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Skills & Tech Stack</h3>
                <p className="text-xs text-gray-500">Tools, languages, and technical disciplines</p>
              </div>
              <Badge variant="blue" className="text-[10px]">{profile.skills.length} Skills</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold"
                  >
                    <span>{skill}</span>
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <input 
                    type="text" 
                    placeholder="Add a new skill (e.g. Flutter, C++, UI/UX)..."
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <Button size="sm" onClick={handleAddSkill} className="text-xs font-semibold gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracurricular Interests */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center bg-gray-50/70 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Campus Interests & Activities</h3>
                <p className="text-xs text-gray-500">Passions, hobbies, and co-curricular areas of involvement</p>
              </div>
              <Badge variant="purple" className="text-[10px]">{profile.interests.length} Topics</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold"
                  >
                    <span>{interest}</span>
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <input 
                    type="text" 
                    placeholder="Add an interest (e.g. Debating, Photography, Drone Racing)..."
                    value={newInterestInput}
                    onChange={e => setNewInterestInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <Button size="sm" onClick={handleAddInterest} className="text-xs font-semibold gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Virtual ID Card preview, Clubs Roster, Social Links */}
        <div className="space-y-6">
          {/* Virtual Student ID Pass Widget */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 text-white shadow-xl border-0 overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
              <QrCode className="w-48 h-48 text-white" />
            </div>

            <CardContent className="p-6 space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center font-bold text-xs text-white">U</div>
                  <span className="font-extrabold text-xs tracking-wider uppercase text-blue-200">UniSphere Digital ID</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  Active 2026
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <img 
                  src={profile.avatar} 
                  alt="" 
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white/30"
                />
                <div>
                  <h4 className="font-extrabold text-base text-white">{profile.name}</h4>
                  <p className="text-xs text-gray-300">{profile.course} • {profile.branch}</p>
                  <p className="text-[11px] font-mono text-blue-300 font-bold">Roll: {profile.classRollNo}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-[11px]">Univ Roll:</span>
                  <span className="font-mono text-white font-bold">{profile.universityRollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-[11px]">Valid Until:</span>
                  <span className="text-gray-200">June {profile.graduatingYear}</span>
                </div>
              </div>

              <Button 
                onClick={() => setShowIdCardModal(true)} 
                size="sm" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-md"
              >
                <QrCode className="w-3.5 h-3.5" /> Open Full Virtual ID Card
              </Button>
            </CardContent>
          </Card>

          {/* Active Club Memberships */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-3 bg-gray-50/70 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Enrolled Clubs</h3>
                <p className="text-xs text-gray-500">Student organizations you belong to</p>
              </div>
              <Badge variant="blue" className="text-[10px]">{myClubs.length} Active</Badge>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {myClubs.map(club => (
                <div 
                  key={club.id} 
                  className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={club.logo} 
                      alt={club.name} 
                      className="w-9 h-9 rounded-xl object-cover bg-gray-50 border border-gray-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">{club.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{club.category}</p>
                    </div>
                  </div>
                  <Link to={`/student/explore/${club.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7 px-2">
                      Profile
                    </Button>
                  </Link>
                </div>
              ))}

              {myClubs.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-xs">
                  <p>No club memberships yet.</p>
                  <Link to="/student/explore" className="text-blue-600 font-bold hover:underline mt-1 block">
                    Explore Clubs &rarr;
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social & Developer Profiles */}
          <Card>
            <CardHeader className="pb-3 bg-gray-50/70 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Social & Portfolios</h3>
              <p className="text-xs text-gray-500">Developer links and professional channels</p>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {!isEditing ? (
                <>
                  <a 
                    href={profile.github} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-xs text-gray-700 font-medium group"
                  >
                    <div className="flex items-center gap-2.5">
                      <GithubIcon className="w-4 h-4 text-gray-900" />
                      <span>GitHub Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </a>

                  <a 
                    href={profile.linkedin} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-xs text-gray-700 font-medium group"
                  >
                    <div className="flex items-center gap-2.5">
                      <LinkedinIcon className="w-4 h-4 text-blue-600" />
                      <span>LinkedIn Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GitHub URL</label>
                    <input 
                      type="text" 
                      value={formData.github}
                      onChange={e => setFormData({ ...formData, github: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn URL</label>
                    <input 
                      type="text" 
                      value={formData.linkedin}
                      onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL: VIRTUAL STUDENT IDENTITY CARD */}
      {showIdCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <QrCode className="w-4 h-4" />
                <span>Virtual Campus ID Card</span>
              </div>
              <button onClick={() => setShowIdCardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ID Card Front Frame */}
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-blue-700 via-indigo-700 to-blue-800 text-white p-5 shadow-xl relative overflow-hidden space-y-4 text-center">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white text-blue-700 font-extrabold flex items-center justify-center text-xs">U</div>
                  <span className="font-extrabold text-xs tracking-wider">UNISPHERE UNIVERSITY</span>
                </div>
                <span className="text-[10px] font-mono text-blue-200">SESSION 2024-28</span>
              </div>

              <div className="flex flex-col items-center gap-2 pt-1">
                <img 
                  src={profile.avatar} 
                  alt="" 
                  className="w-20 h-20 rounded-2xl object-cover border-3 border-white shadow-md"
                />
                <div>
                  <h3 className="font-extrabold text-lg text-white">{profile.name}</h3>
                  <p className="text-xs text-blue-200 font-medium">{profile.course} in {profile.branch}</p>
                </div>
              </div>

              {/* ID Card Fields Grid */}
              <div className="bg-white/10 rounded-xl p-3 text-left space-y-1 text-xs border border-white/15 backdrop-blur-xs">
                <div className="flex justify-between">
                  <span className="text-blue-200 text-[11px]">Class Roll No:</span>
                  <span className="font-mono font-bold text-white">{profile.classRollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-[11px]">Univ Roll No:</span>
                  <span className="font-mono font-bold text-white">{profile.universityRollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-[11px]">Semester / Year:</span>
                  <span className="text-white font-medium">{profile.sem} ({profile.year})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-[11px]">Blood Group:</span>
                  <span className="font-bold text-red-300">{profile.bloodGroup}</span>
                </div>
              </div>

              {/* Barcode Simulator */}
              <div className="bg-white rounded-xl p-2.5 text-gray-800 flex flex-col items-center gap-0.5 font-mono text-[9px]">
                <div className="tracking-widest font-black text-xs">||| | |||| | |||||| || | |||| ||</div>
                <span>UNI-STUDENT-{profile.classRollNo}-2026</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="flex-1 text-xs font-semibold gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print ID Card
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setToastMessage('Virtual student card saved to device.');
                  setShowIdCardModal(false);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Save Digital ID
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
