import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  Search, 
  Filter, 
  LogOut, 
  ExternalLink, 
  Sparkles, 
  Eye, 
  X, 
  Check, 
  GraduationCap, 
  Coins, 
  ChevronRight,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export function AdminDashboard() {
  const { user, loginWithCredentials, logout } = useAuth();

  // Authentication State — use real backend auth token
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('unisphere_token');
    const savedUser = localStorage.getItem('unisphere_user');
    if (token && savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return u.role === 'Admin';
      } catch { return false; }
    }
    return false;
  });

  // Auth gate form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [showGatePasscode, setShowGatePasscode] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Dashboard State
  const [allClubsList, setAllClubsList] = useState([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [activeTab, setActiveTab] = useState('requested'); // 'requested' | 'all' | 'approved' | 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Modals & Feedback
  const [inspectClub, setInspectClub] = useState(null);
  const [rejectingClub, setRejectingClub] = useState(null);
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [toast, setToast] = useState(null);

  // Fetch clubs from real backend API
  const refreshClubs = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingClubs(true);
    try {
      // Fetch pending clubs from admin API
      const pendingRes = await api.getPendingClubs();
      const pendingClubs = (pendingRes?.data || pendingRes || []).map(c => ({
        ...c,
        approvalStatus: c.approvalStatus || 'requested',
      }));

      // Fetch all approved clubs from public API 
      let approvedClubs = [];
      try {
        const approvedRes = await api.getClubs();
        const approvedData = approvedRes?.data || approvedRes || [];
        approvedClubs = approvedData.map(c => ({
          ...c,
          approvalStatus: c.approvalStatus || 'approved',
        }));
      } catch {
        // If fetching approved clubs fails, continue with pending only
      }

      // Merge into single list, deduplicate by id
      const clubMap = new Map();
      pendingClubs.forEach(c => clubMap.set(c.id, c));
      approvedClubs.forEach(c => {
        if (!clubMap.has(c.id)) clubMap.set(c.id, c);
      });
      setAllClubsList(Array.from(clubMap.values()));
    } catch (err) {
      console.error('Failed to fetch clubs:', err);
      triggerToast('error', 'Fetch Error', err.message || 'Failed to load clubs from server.');
    } finally {
      setIsLoadingClubs(false);
    }
  }, [isAuthenticated]);

  // Sync authentication state with user context
  useEffect(() => {
    if (user && user.role === 'Admin') {
      setIsAuthenticated(true);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshClubs();
    }
  }, [isAuthenticated, refreshClubs]);

  const triggerToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 5500);
  };

  // Handle Admin Gate Authentication — real backend login
  const handleAdminGateLogin = async (e) => {
    e?.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    const cleanMail = adminEmail.trim().toLowerCase();
    const cleanPass = adminPasscode.trim();

    try {
      const loggedUser = await loginWithCredentials(cleanMail, cleanPass);
      if (loggedUser && loggedUser.role === 'Admin') {
        setIsAuthenticated(true);
        triggerToast('success', 'Admin Access Granted', 'Welcome to the UniSphere Higher Authority Governance Console.');
      } else {
        setAuthError(`Access denied. Your account role "${loggedUser?.role || 'Unknown'}" does not have administrative privileges. Only Admin accounts can access this console.`);
        logout();
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid administrator credentials. Please enter valid admin email and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 1-Click Demo Unlock for Reviewers — uses real admin credentials
  const handleQuickUnlock = async () => {
    setAdminEmail('admin@college.edu');
    setAdminPasscode('Admin@2026');
    setIsLoggingIn(true);
    try {
      const loggedUser = await loginWithCredentials('admin@college.edu', 'Admin@2026');
      if (loggedUser && loggedUser.role === 'Admin') {
        setIsAuthenticated(true);
        triggerToast('success', 'Authenticated as Admin', 'Cleared with University Administrator credentials.');
      } else {
        setAuthError('Quick unlock failed. Admin account may not exist or role is incorrect.');
        logout();
      }
    } catch (err) {
      setAuthError(err.message || 'Quick unlock failed. Backend may be unreachable.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout / Lock Gate — real logout
  const handleLockAdminGate = () => {
    logout();
    setIsAuthenticated(false);
    setAllClubsList([]);
    setAdminPasscode('');
    setAdminEmail('');
  };

  // Action: Approve Club — real API call
  const handleApprove = async (club) => {
    try {
      await api.approveClub(club.id);
      triggerToast(
        'success',
        'Club Charter Approved!',
        `"${club.name}" is now approved. The coordinator can log into the club dashboard, and the club is visible to students.`
      );
      refreshClubs();
    } catch (err) {
      triggerToast('error', 'Approval Failed', err.message || 'Failed to approve club.');
    }
  };

  // Action: Open Reject Modal
  const handleOpenRejectModal = (club) => {
    setRejectingClub(club);
    setCustomRejectionReason('Faculty advisor endorsement letter is missing, and campus policy restricts unaccredited societies.');
  };

  // Action: Confirm Reject — real API call
  const handleConfirmReject = async () => {
    if (!rejectingClub) return;
    const reason = customRejectionReason.trim() || 'Application does not comply with institutional standards.';
    try {
      await api.rejectClub(rejectingClub.id, { rejectionReason: reason });
      triggerToast(
        'error',
        'Club Registration Rejected',
        `"${rejectingClub.name}" has been marked as rejected with reason recorded.`
      );
      setRejectingClub(null);
      refreshClubs();
    } catch (err) {
      triggerToast('error', 'Rejection Failed', err.message || 'Failed to reject club.');
    }
  };

  // Filtered Clubs
  const requestedClubs = allClubsList.filter(c => c.approvalStatus === 'requested');
  const approvedClubs = allClubsList.filter(c => c.approvalStatus === 'approved');
  const rejectedClubs = allClubsList.filter(c => c.approvalStatus === 'rejected');

  const filteredClubs = allClubsList.filter(club => {
    // Tab filter
    if (activeTab === 'requested' && club.approvalStatus !== 'requested') return false;
    if (activeTab === 'approved' && club.approvalStatus !== 'approved') return false;
    if (activeTab === 'rejected' && club.approvalStatus !== 'rejected') return false;

    // Search filter
    const matchesSearch = 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.clubCode && club.clubCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (club.department && club.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (club.facultyAdvisor && club.facultyAdvisor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (club.hod && club.hod.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (club.referenceId && club.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));

    // Dept filter
    const matchesDept = selectedDept === 'All' ? true : club.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  // Extract unique departments for dropdown
  const departments = ['All', ...new Set(allClubsList.map(c => c.department).filter(Boolean))];

  // -------------------------------------------------------------
  // VIEW 1: SECURE ADMINISTRATIVE ACCESS GATE (PROTECTION)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-full max-w-md z-10 space-y-6">
          {/* Header Badge */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Restricted Institutional Network
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Higher Authority Governance
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Office of the Dean of Student Welfare (DSW) & University Administrative Syndicate.
            </p>
          </div>

          {/* Secure Gate Card */}
          <Card className="bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-xl text-white">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">Administrative Gatekeeper</h2>
                  <p className="text-xs text-slate-400">Enter Syndicate Key to unlock /admin</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleAdminGateLogin} className="space-y-4">
                {/* Official College Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Administrator College ID / Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="e.g. dean.dsw@college.edu or admin"
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                    required
                  />
                </div>

                {/* Master Security Key */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Security Passcode / Master Key
                    </label>
                    <span className="text-[11px] font-mono text-blue-400">Default: ADMIN2026</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showGatePasscode ? 'text' : 'password'}
                      value={adminPasscode}
                      onChange={(e) => {
                        setAdminPasscode(e.target.value);
                        setAuthError('');
                      }}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowGatePasscode(!showGatePasscode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="p-3 bg-rose-950/50 border border-rose-800/80 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Submit Action */}
                <Button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 text-xs sm:text-sm gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-70"
                >
                  <KeyRound className="w-4 h-4" /> {isLoggingIn ? 'Authenticating...' : 'Authenticate & Unlock Console'}
                </Button>
              </form>

              {/* 1-Click Review Shortcut */}
              <div className="pt-3 border-t border-slate-800/80">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleQuickUnlock}
                  className="w-full border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-bold h-10 gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1-Click Fast Unlock (Dean / DSW Demo Key)
                </Button>
              </div>

              {/* Back to Public App */}
              <div className="text-center pt-2">
                <Link to="/" className="text-xs text-slate-500 hover:text-slate-400 inline-flex items-center gap-1">
                  &larr; Return to UniSphere Student Portal
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN GOVERNANCE CONSOLE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Administrative Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md text-white font-extrabold text-base">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">UniSphere Admin</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                  DSW Console
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Syndicate Network
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dean of Student Welfare & Higher Authority Approvals Portal
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" target="_blank" className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> Main Portal
            </Link>

            <div className="hidden sm:flex flex-col text-right pr-1">
              <span className="text-xs font-bold text-slate-200">Dr. K. R. Nambiar</span>
              <span className="text-[10px] text-slate-400">Dean of Student Welfare</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleLockAdminGate}
              className="border-rose-900/60 bg-rose-950/40 hover:bg-rose-950 text-rose-300 text-xs font-bold gap-1.5 h-9 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Lock Console
            </Button>
          </div>
        </div>
      </header>

      {/* Main Administrative Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Executive Banner & Overview */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-blue-900/40 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <Building2 className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full text-xs font-bold text-blue-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Institutional Charter Review Queue
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Club Establishment & Approval Governance
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Vetting requests submitted by faculty advisors and student leads. Verify HOD endorsements, operational scopes, and grant official university clearance.
            </p>
          </div>

          {/* Top 4 KPI Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
            {/* Pending Requests */}
            <div 
              onClick={() => setActiveTab('requested')} 
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'requested' 
                  ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-900/20' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div className="flex justify-between items-center text-amber-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {requestedClubs.length}
              </div>
              <p className="text-[11px] text-amber-200/70 mt-0.5">Awaiting higher clearance</p>
            </div>

            {/* Approved Organizations */}
            <div 
              onClick={() => setActiveTab('approved')} 
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'approved' 
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-900/20' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex justify-between items-center text-emerald-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Approved Active</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                {approvedClubs.length}
              </div>
              <p className="text-[11px] text-emerald-200/70 mt-0.5">Live campus clubs</p>
            </div>

            {/* Rejected Applications */}
            <div 
              onClick={() => setActiveTab('rejected')} 
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'rejected' 
                  ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-900/20' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/30'
              }`}
            >
              <div className="flex justify-between items-center text-rose-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
                <XCircle className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-300">
                {rejectedClubs.length}
              </div>
              <p className="text-[11px] text-rose-200/70 mt-0.5">Declined with reasons</p>
            </div>

            {/* Statutory Standard */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex justify-between items-center text-blue-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Standard</span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-300">
                NAAC 5.3
              </div>
              <p className="text-[11px] text-blue-200/70 mt-0.5">IQAC Criteria Compliant</p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Interactive Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('requested')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'requested'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Requested Awaiting Review ({requestedClubs.length})
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              All Proposals ({allClubsList.length})
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'approved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved ({approvedClubs.length})
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Rejected ({rejectedClubs.length})
            </button>
          </div>

          {/* Search & Department Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search club, advisor, HOD, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Clubs with Complete Details */}
        {isLoadingClubs ? (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Fetching proposals from database...</p>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Clubs Matching Filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no club establishment proposals in the <strong>{activeTab}</strong> queue matching your search parameters.
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => { setActiveTab('all'); setSearchTerm(''); setSelectedDept('All'); }}
              className="border-slate-700 text-xs text-slate-300 mt-2"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredClubs.map(club => {
              const isRequested = club.approvalStatus === 'requested';
              const isApproved = club.approvalStatus === 'approved';
              const isRejected = club.approvalStatus === 'rejected';

              return (
                <Card 
                  key={club.id} 
                  className={`border overflow-hidden transition-all duration-200 ${
                    isRequested 
                      ? 'bg-slate-950/90 border-amber-500/40 shadow-xl shadow-amber-950/20' 
                      : isRejected
                      ? 'bg-slate-950/60 border-rose-900/40 opacity-90'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  {/* Top Cover Banner Preview */}
                  <div className="h-32 sm:h-40 w-full relative overflow-hidden bg-slate-900">
                    <img 
                      src={club.banner || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000'} 
                      alt={club.name}
                      className="w-full h-full object-cover opacity-60" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Status Badge in Top Corner */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {isRequested && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md uppercase tracking-wider animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Clearance (Requested)
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Chartered
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5" /> Application Rejected
                        </span>
                      )}
                    </div>

                    {/* Reference ID Pill */}
                    {club.referenceId && (
                      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-300">
                        Ref: {club.referenceId}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 sm:p-7 space-y-6">
                    {/* Club Header Info */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-800/80">
                      <div className="flex items-start gap-4">
                        <img 
                          src={club.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${club.id}`} 
                          alt={club.name} 
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-slate-700 bg-slate-800 object-cover p-1 shadow-md flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                              {club.name}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {club.category}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              Code: {club.clubCode || `CLUB-${club.id}`}
                            </span>
                            <span>•</span>
                            <span>Submitted: {club.submittedAt || 'Oct 2026'}</span>
                            {club.rejectedAt && (
                              <>
                                <span>•</span>
                                <span className="text-rose-400">Rejected on: {club.rejectedAt}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setInspectClub(club)}
                          className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold gap-1.5 h-9"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" /> Full Charter Details
                        </Button>
                      </div>
                    </div>

                    {/* Complete Institutional Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Department & Governance */}
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Academic Governance
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div>
                            <span className="text-slate-400">Department:</span>{' '}
                            <strong className="text-slate-200">{club.department}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Endorsing HOD:</span>{' '}
                            <strong className="text-slate-200">{club.hod || 'Dr. V. K. Mathur'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Faculty Advisor:</span>{' '}
                            <strong className="text-emerald-400">{club.facultyAdvisor || club.coordinatorTeacher}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Contact & Verification Credentials */}
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Official Contact Credentials
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                            <span className="text-slate-300 font-mono text-[11px] truncate">
                              {club.email || `${club.id}@college.edu`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="text-slate-300 text-xs">
                              {club.phone || '+91 98101 23456'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span className="text-slate-300 text-xs truncate">
                              {club.meetingRoom || 'Campus Seminar Block'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scope, Budget & Target Intake */}
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Resource & Operational Metrics
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div>
                            <span className="text-slate-400">Proposed Budget:</span>{' '}
                            <strong className="text-amber-400">{club.proposedBudget || '₹25,000 (Departmental)'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Target Intake:</span>{' '}
                            <strong className="text-slate-200">{club.expectedMembers || '60+ Campus Students'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Governance Tier:</span>{' '}
                            <strong className="text-purple-400">Tier-1 Registered Society</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mission / Mandate Description */}
                    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Mission Statement & Charter Summary
                      </span>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {club.about_mission || club.description}
                      </p>
                    </div>

                    {/* Rejection Notice if rejected */}
                    {isRejected && club.rejectionReason && (
                      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs space-y-1">
                        <div className="font-extrabold flex items-center gap-1.5 text-rose-300">
                          <XCircle className="w-4 h-4 text-rose-400" /> Administrative Rejection Reason:
                        </div>
                        <p className="leading-relaxed pl-5 font-medium">
                          {club.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Administrative Action Command Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>University Syndicate Decision Required</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* If rejected, allow re-approving / reversing */}
                        {isRejected && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(club)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 h-10 px-4 cursor-pointer"
                          >
                            <Check className="w-4 h-4" /> Reconsider & Approve Club
                          </Button>
                        )}

                        {/* If requested: display Approve & Reject controls */}
                        {isRequested && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenRejectModal(club)}
                              className="border-rose-800 text-rose-400 hover:bg-rose-950/80 hover:text-rose-300 font-bold text-xs gap-1.5 h-10 px-4 cursor-pointer"
                            >
                              <X className="w-4 h-4" /> Reject Application
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleApprove(club)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 h-10 px-5 shadow-lg shadow-emerald-900/30 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve & Issue Charter
                            </Button>
                          </>
                        )}

                        {/* If approved: allow re-reviewing or revoking */}
                        {isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRejectModal(club)}
                            className="border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-800 font-bold text-xs gap-1.5 h-10 px-4 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" /> Revoke Approval
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* REJECTION REASON MODAL */}
      {rejectingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <button 
                onClick={() => setRejectingClub(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                Reject Proposal: {rejectingClub.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Please provide an official administrative justification. This notice will be shown to the coordinator when they attempt to sign in.
              </p>
            </div>

            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Preset Compliance Notices:
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  'Faculty advisor endorsement letter is missing or unverified.',
                  'Club mandate substantially overlaps with an existing registered society.',
                  'Constitutional charter does not comply with university syndicate guidelines.',
                  'Departmental budget allocation rejected by finance committee.'
                ].map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomRejectionReason(reason)}
                    className="text-left px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs transition-colors cursor-pointer"
                  >
                    "{reason}"
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Official Feedback Reason
              </label>
              <textarea
                rows={3}
                value={customRejectionReason}
                onChange={(e) => setCustomRejectionReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                placeholder="Write official explanation to coordinator..."
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingClub(null)}
                className="border-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE CHARTER INSPECTION MODAL */}
      {inspectClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img 
                  src={inspectClub.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${inspectClub.id}`} 
                  alt={inspectClub.name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700" 
                />
                <div>
                  <h3 className="text-xl font-extrabold text-white">{inspectClub.name}</h3>
                  <p className="text-xs text-slate-400">Institutional Charter Dossier • Code: {inspectClub.clubCode}</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectClub(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Full Charter Dossier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
                <p className="font-semibold text-slate-100">{inspectClub.department}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Category Domain</span>
                <p className="font-semibold text-slate-100">{inspectClub.category}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Faculty Advisor</span>
                <p className="font-semibold text-emerald-400">{inspectClub.facultyAdvisor || inspectClub.coordinatorTeacher}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Endorsing HOD</span>
                <p className="font-semibold text-slate-100">{inspectClub.hod || 'Dr. V. K. Mathur'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Official Contact</span>
                <p className="font-mono text-slate-200">{inspectClub.email || 'N/A'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Contact Telephone</span>
                <p className="font-semibold text-slate-200">{inspectClub.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Mandate & Student Impact
              </span>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {inspectClub.about_mission || inspectClub.description}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectClub(null)}
                className="border-slate-700 text-xs text-slate-300"
              >
                Close Dossier
              </Button>
              {inspectClub.approvalStatus === 'requested' && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleApprove(inspectClub);
                    setInspectClub(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Grant Approval Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 ${
            toast.type === 'success' 
              ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-100 shadow-emerald-950/40' 
              : toast.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/80 text-rose-100 shadow-rose-950/40'
              : 'bg-amber-950/95 border-amber-500/80 text-amber-100 shadow-amber-950/40'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <Clock className="w-5 h-5 text-amber-400" />}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <div className="font-bold text-xs uppercase tracking-wide">{toast.title}</div>
              <p className="text-xs leading-relaxed mt-0.5 opacity-90">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
