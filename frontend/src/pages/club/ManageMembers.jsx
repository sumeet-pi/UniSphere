import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getStoredMembers, 
  addStoredMember, 
  updateStoredMember, 
  deleteStoredMember, 
  clubs 
} from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { 
  Search, 
  Plus, 
  UserCheck, 
  Shield, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  CheckCircle2, 
  Users, 
  Award, 
  Filter, 
  Sparkles, 
  Info,
  Check,
  Building,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ManageMembers() {
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const club = clubs.find(c => c.id === clubId) || clubs[0];

  const [membersList, setMembersList] = useState(() => getStoredMembers(club.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);
  const [editingRoleMember, setEditingRoleMember] = useState(null);
  const [newRoleValue, setNewRoleValue] = useState('Member');
  const [toastMessage, setToastMessage] = useState('');

  const [newStudent, setNewStudent] = useState({ 
    name: '', 
    collegeId: '', 
    email: '', 
    phone: '', 
    department: 'CSE', 
    year: '2nd Year', 
    role: 'Member' 
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const reloadMembers = () => {
    setMembersList(getStoredMembers(club.id));
  };

  // Filter members based on search, role, and department
  const filteredMembers = membersList.filter(m => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      (m.name || '').toLowerCase().includes(q) || 
      (m.collegeId || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q);

    const matchesRole = 
      roleFilter === 'All' ? true : 
      roleFilter === 'Core Team' ? m.role !== 'Member' : 
      roleFilter === 'Member' ? m.role === 'Member' :
      m.role === roleFilter;

    const matchesDept = 
      deptFilter === 'All' ? true : 
      m.department === deptFilter;

    return matchesSearch && matchesRole && matchesDept;
  });

  // Calculate roster statistics
  const coreMembersCount = membersList.filter(m => m.role !== 'Member').length;
  const generalMembersCount = membersList.filter(m => m.role === 'Member').length;
  const uniqueDepartments = Array.from(new Set(membersList.map(m => m.department))).filter(Boolean);

  // Handle adding a new member directly without any invitation code
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.collegeId) return;

    const email = newStudent.email || `${newStudent.name.toLowerCase().replace(/\s+/g, '.') || 'student'}@campus.edu`;
    const phone = newStudent.phone || '+91 98' + Math.floor(10000000 + Math.random() * 90000000);

    const newMemberObj = {
      clubId: club.id,
      name: newStudent.name.trim(),
      collegeId: newStudent.collegeId.trim().toUpperCase(),
      email: email.trim(),
      phone: phone.trim(),
      department: newStudent.department,
      year: newStudent.year,
      role: newStudent.role,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    addStoredMember(newMemberObj);
    reloadMembers();
    setNewStudent({ 
      name: '', 
      collegeId: '', 
      email: '', 
      phone: '', 
      department: 'CSE', 
      year: '2nd Year', 
      role: 'Member' 
    });
    setShowAddModal(false);
    showToast(`✓ Added ${newMemberObj.name} directly to the club roster without any code!`);
  };

  // Handle changing role of an existing member
  const handleSaveRoleChange = (e) => {
    e.preventDefault();
    if (!editingRoleMember) return;

    updateStoredMember(editingRoleMember.id, { role: newRoleValue });
    reloadMembers();
    const targetName = editingRoleMember.name;
    setEditingRoleMember(null);
    showToast(`✓ Updated ${targetName}'s role to ${newRoleValue}!`);
  };

  // Handle removing a member from the club
  const handleRemoveMember = (member) => {
    if (window.confirm(`Are you sure you want to remove ${member.name} (${member.collegeId}) from ${club.name}?`)) {
      deleteStoredMember(member.id);
      reloadMembers();
      showToast(`Removed ${member.name} from club roster.`);
    }
  };

  // Helper for role styling
  const getRoleBadge = (role) => {
    if (role === 'Student Coordinator') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Coordinator Lead
        </span>
      );
    }
    if (role === 'Technical Lead') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Award className="w-3.5 h-3.5 text-purple-600" /> Technical Lead
        </span>
      );
    }
    if (role === 'Event Manager') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Event Manager
        </span>
      );
    }
    if (role === 'Content & PR Lead') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Content & PR Lead
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
        <Users className="w-3.5 h-3.5 text-gray-400" /> General Member
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 border border-gray-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Users className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {club.name} • Official Membership Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Manage Club Members
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Open campus enrollment is active. Students can join freely from the public club profile simply by providing their academic details — <strong>no invitation code required</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={() => setShowAddModal(true)} 
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md gap-2 border-0"
            >
              <Plus className="w-4 h-4" /> Add Member Directly
            </Button>
            <Link to={`/explore/${club.id}`} target="_blank">
              <Button variant="outline" className="text-white border-white/40 hover:bg-white/10 gap-2">
                Public Profile <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Callout: Clarifying Open Joining Without Codes */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-blue-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-blue-950">Zero Barriers to Join</p>
            <p className="text-xs text-blue-800">
              No invitation code is required for students to join this club. Any campus student can join by submitting their name, email, phone, and roll number on the club profile. Coordinators can also register members directly below.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-blue-800 whitespace-nowrap shadow-xs">
          Club Identifier: {club.clubCode || 'BW-CSE-2026'}
        </div>
      </div>

      {/* Roster Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Members</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{membersList.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                Leadership
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Core Team Leads</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{coreMembersCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Coordinators & Leads</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                General
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">General Members</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{generalMembersCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Standard participants</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Branches
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Departments</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{uniqueDepartments.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">{uniqueDepartments.join(', ') || 'CSE, IT'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Roster Card with Filters and Search */}
      <Card>
        <CardHeader className="bg-gray-50/70 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, roll no, email, or phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white shadow-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Role Filter Pills */}
            <div className="flex items-center bg-gray-200/70 p-1 rounded-xl text-xs font-semibold">
              <button 
                onClick={() => setRoleFilter('All')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  roleFilter === 'All' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({membersList.length})
              </button>
              <button 
                onClick={() => setRoleFilter('Core Team')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  roleFilter === 'Core Team' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Core Leads ({coreMembersCount})
              </button>
              <button 
                onClick={() => setRoleFilter('Member')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  roleFilter === 'Member' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Members ({generalMembersCount})
              </button>
            </div>

            {/* Department Dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold bg-white shadow-xs"
              >
                <option value="All">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        {/* Member Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Student Member</th>
                  <th className="px-6 py-3.5 font-bold">Department & Year</th>
                  <th className="px-6 py-3.5 font-bold">Club Role</th>
                  <th className="px-6 py-3.5 font-bold">Contact Info</th>
                  <th className="px-6 py-3.5 font-bold">Joined Date</th>
                  <th className="px-6 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="bg-white hover:bg-blue-50/40 transition-colors group">
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                          {member.name ? member.name.charAt(0) : 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-sm">
                            {member.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {member.collegeId}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Year */}
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-semibold text-sm">{member.department}</p>
                      <p className="text-xs text-gray-500">{member.year}</p>
                    </td>

                    {/* Club Role */}
                    <td className="px-6 py-4">
                      {getRoleBadge(member.role)}
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[160px]">{member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 font-mono">
                          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span>{member.phone || '+91 98101 23456'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{member.joinedDate || '2026-08-15'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewingMember(member)}
                          title="View Member Profile"
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingRoleMember(member);
                            setNewRoleValue(member.role || 'Member');
                          }}
                          title="Change Role & Leadership"
                          className="p-1.5 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveMember(member)}
                          title="Remove from Club"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-bold text-gray-800 text-base">No club members match your filter</p>
                      <p className="text-xs text-gray-400 mt-1">Try resetting your search query or role filter.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { setSearchTerm(''); setRoleFilter('All'); setDeptFilter('All'); }}
                        className="mt-3 text-xs"
                      >
                        Reset All Filters
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Modal (Zero Code Needed) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-blue-50/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Add Club Member</h3>
                  <p className="text-xs text-gray-500">Directly register a student into {club.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">No Invitation Code Required</p>
                  <p className="text-emerald-800 mt-0.5">
                    Just fill in the student details below to immediately enroll them into the club roster.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Student Full Name" 
                  placeholder="e.g. Siddharth Bansal" 
                  value={newStudent.name}
                  onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                  required 
                />
                <Input 
                  label="College Roll No / ID" 
                  placeholder="e.g. CS25088" 
                  value={newStudent.collegeId}
                  onChange={e => setNewStudent({ ...newStudent, collegeId: e.target.value })}
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="College Email Address" 
                  type="email"
                  placeholder="siddharth@campus.edu" 
                  value={newStudent.email}
                  onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                />
                <Input 
                  label="Contact Phone Number" 
                  placeholder="+91 98765 43210" 
                  value={newStudent.phone}
                  onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Department</label>
                  <select 
                    value={newStudent.department}
                    onChange={e => setNewStudent({ ...newStudent, department: e.target.value })}
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
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Academic Year</label>
                  <select 
                    value={newStudent.year}
                    onChange={e => setNewStudent({ ...newStudent, year: e.target.value })}
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
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Assign Club Role</label>
                <select 
                  value={newStudent.role}
                  onChange={e => setNewStudent({ ...newStudent, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white font-medium"
                >
                  <option value="Member">👤 General Member</option>
                  <option value="Student Coordinator">🛡️ Student Coordinator (Core Lead)</option>
                  <option value="Technical Lead">⚡ Technical Lead</option>
                  <option value="Event Manager">📅 Event Manager</option>
                  <option value="Content & PR Lead">📢 Content & PR Lead</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md gap-1.5"
                >
                  <UserCheck className="w-4 h-4" /> Enroll Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {editingRoleMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Change Club Role</h3>
              </div>
              <button 
                onClick={() => setEditingRoleMember(null)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoleChange} className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  {editingRoleMember.name ? editingRoleMember.name.charAt(0) : 'S'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{editingRoleMember.name}</p>
                  <p className="text-xs text-gray-500">{editingRoleMember.collegeId} • {editingRoleMember.department}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select New Role
                </label>
                <select 
                  value={newRoleValue}
                  onChange={e => setNewRoleValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white font-medium"
                >
                  <option value="Member">👤 General Member</option>
                  <option value="Student Coordinator">🛡️ Student Coordinator (Core Lead)</option>
                  <option value="Technical Lead">⚡ Technical Lead</option>
                  <option value="Event Manager">📅 Event Manager</option>
                  <option value="Content & PR Lead">📢 Content & PR Lead</option>
                </select>
              </div>

              <p className="text-xs text-gray-500">
                Updating role immediately gives the student coordinator privileges or demotes them to general member status.
              </p>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2.5">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setEditingRoleMember(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save New Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Profile Details Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5" /> Member Information
              </h3>
              <button 
                onClick={() => setViewingMember(null)} 
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xl shadow-inner">
                  {viewingMember.name ? viewingMember.name.charAt(0) : 'S'}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{viewingMember.name}</h4>
                  <p className="text-xs font-mono font-semibold text-gray-500">{viewingMember.collegeId}</p>
                  <div className="mt-1">
                    {getRoleBadge(viewingMember.role)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Department</span>
                  <span className="font-semibold text-gray-900">{viewingMember.department}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Academic Year</span>
                  <span className="font-semibold text-gray-900">{viewingMember.year}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">College Email</span>
                  <span className="font-medium text-gray-900 font-mono text-xs">{viewingMember.email || `${viewingMember.name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Contact Phone</span>
                  <span className="font-medium text-gray-900 font-mono text-xs">{viewingMember.phone || '+91 98101 23456'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Date Joined</span>
                  <span className="font-medium text-gray-900">{viewingMember.joinedDate || '2026-08-15'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 text-xs">Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <UserCheck className="w-3 h-3" /> Active Member
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button 
                  onClick={() => setViewingMember(null)}
                  className="w-full"
                >
                  Close Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
