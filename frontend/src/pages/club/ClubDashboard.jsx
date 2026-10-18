import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { fetchClubMembers } from '../../store/slices/membersSlice';
import { fetchClubById } from '../../store/slices/clubsSlice';
import { 
  getStoredEvents, 
  updateStoredEvent,
  getStoredTasks, 
  updateStoredTask, 
  addStoredTask,
  getStoredMembers, 
  getStoredAnnouncements, 
  addStoredAnnouncement,
  clubs, 
  eventRegistrations,
  getClubApprovalStatus
} from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  Users, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Plus, 
  CheckSquare, 
  Megaphone, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  Sparkles,
  BarChart3,
  MapPin,
  Check,
  Radio,
  Copy,
  ChevronRight,
  ChevronDown,
  Filter,
  X,
  FileText,
  AlertCircle,
  Eye,
  Trophy,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ClubDashboard() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const defaultClub = clubs.find(c => c.id === clubId) || clubs[0];

  const reduxClub = useSelector((state) => state.clubs.currentClub);
  const reduxMembersData = useSelector((state) => state.members.byClubId[clubId]);

  // Load dynamically updated club profile if edited
  const club = {
    ...defaultClub,
    ...(reduxClub || {}),
    name: user?.clubName || reduxClub?.name || defaultClub.name,
    department: user?.department || reduxClub?.department || defaultClub.department,
  };

  useEffect(() => {
    dispatch(fetchClubById(clubId));
    dispatch(fetchClubMembers(clubId));
  }, [dispatch, clubId]);

  // Stored state subscriptions with setters for live reactive updates
  const [tasks, setTasks] = useState(() => getStoredTasks(club.id));
  const [allEvents, setAllEvents] = useState(() => getStoredEvents());
  const membersList = reduxMembersData?.members || getStoredMembers(club.id);
  const [announcementsList, setAnnouncementsList] = useState(() => getStoredAnnouncements(club.id));

  // Sync state if storage updates elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      setTasks(getStoredTasks(club.id));
      setAllEvents(getStoredEvents());
      setAnnouncementsList(getStoredAnnouncements(club.id));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [club.id]);

  // UI state
  const [eventsTab, setEventsTab] = useState('active'); // 'active' | 'past'
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const [showQuickNoticeModal, setShowQuickNoticeModal] = useState(false);
  const [stageMenuOpenFor, setStageMenuOpenFor] = useState(null);

  // Quick Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskCategory, setTaskCategory] = useState('Logistics');
  const [taskDueDate, setTaskDueDate] = useState('Next Week');

  // Quick Notice form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('Notice');
  const [noticePriority, setNoticePriority] = useState('Normal');
  const [noticeAudience, setNoticeAudience] = useState('All Students');

  // Filter events by club
  const clubEvents = allEvents.filter(e => e.clubId === club.id);
  const upcomingEvents = clubEvents.filter(e => e.stage === 'open' || e.stage === 'closed' || e.stage === 'upcoming');
  const pastEvents = clubEvents.filter(e => e.stage === 'past' || e.status === 'Past');
  const recentRegistrations = eventRegistrations.slice(0, 4);

  // Dynamic calculations across modules
  const coreLeadsCount = membersList.filter(m => m.role && m.role !== 'Member').length;
  const generalMembersCount = membersList.length - coreLeadsCount;
  const totalRegistrations = clubEvents.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);
  const totalCapacity = clubEvents.reduce((acc, curr) => acc + (curr.capacity || 100), 0);
  const avgTurnoutRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 92;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  // Active terminology
  const activeClubCode = club.clubCode || club.inviteCode || 'BW-CSE-2026';
  const activeFacultyAdvisor = club.facultyAdvisor || club.coordinatorTeacher || club.facultyHead || 'Dr. Sharma';
  const activeDepartment = club.department || user?.department || 'Computer Science & Engineering';
  const activeHOD = club.hod || user?.hod || 'Dr. V. K. Mathur';

  // Toggle tasks completion
  const toggleTask = (taskId) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;
    const nextStatus = target.status === 'completed' ? 'pending' : 'completed';
    updateStoredTask(taskId, { status: nextStatus });
    setTasks(getStoredTasks(club.id));
  };

  // Quick add task
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addStoredTask({
      clubId: club.id,
      title: taskTitle.trim(),
      priority: taskPriority,
      category: taskCategory,
      status: 'pending',
      dueDate: taskDueDate || 'Next Week',
      assignedTo: user?.name || 'Club Coordinator'
    });
    setTasks(getStoredTasks(club.id));
    setTaskTitle('');
    setShowQuickTaskModal(false);
  };

  // Quick broadcast announcement
  const handleBroadcastNotice = (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    addStoredAnnouncement({
      clubId: club.id,
      clubName: club.name,
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      category: noticeCategory,
      priority: noticePriority,
      targetAudience: noticeAudience,
      author: `${user?.name || 'Club Coordinator'} (${user?.clubRole || 'Club Coordinator'})`
    });

    setAnnouncementsList(getStoredAnnouncements(club.id));
    setNoticeTitle('');
    setNoticeContent('');
    setShowQuickNoticeModal(false);
  };

  // Quick Transition Stage directly from Dashboard
  const handleTransitionStage = (eventId, nextStage) => {
    updateStoredEvent(eventId, {
      stage: nextStage,
      status: nextStage === 'past' ? 'Past' : (nextStage === 'open' ? 'Open' : (nextStage === 'closed' ? 'Closed' : 'Upcoming'))
    });
    setAllEvents(getStoredEvents());
    setStageMenuOpenFor(null);
  };

  // Copy code feedback
  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeClubCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Event stage badge helper
  const getEventStageBadge = (stage) => {
    if (stage === 'open') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Open for Registration
        </span>
      );
    }
    if (stage === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Registration Closed
        </span>
      );
    }
    if (stage === 'upcoming') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          Announced (Upcoming)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
        Completed / Past
      </span>
    );
  };

  const approvalInfo = getClubApprovalStatus(clubId);

  return (
    <div className="space-y-6 pb-12">
      {/* Club Administrative Approval Warning Banner (if requested or rejected) */}
      {approvalInfo.approvalStatus === 'requested' && (
        <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-lg flex items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 border border-amber-400">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-200 animate-pulse flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs uppercase tracking-wider bg-amber-600 px-2 py-0.5 rounded-full text-white">
                  Status: Requested
                </span>
                <span className="font-bold text-sm">not yet approved</span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Your club is awaiting university admin approval. Live event registrations, member invites, and catalog broadcasting remain in preview mode.
              </p>
            </div>
          </div>
        </div>
      )}

      {approvalInfo.approvalStatus === 'rejected' && (
        <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-lg flex items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 border border-rose-500">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-rose-200 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs uppercase tracking-wider bg-rose-700 px-2 py-0.5 rounded-full text-white">
                  Status: Rejected
                </span>
                <span className="font-bold text-sm">your club was rejected</span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Administrative reason: {approvalInfo.rejectionReason || 'Application does not meet institutional compliance standards.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner / Coordinator Executive Command Hub */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <ShieldCheck className="w-72 h-72 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {club.name} • Institutional Coordinator Portal
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Club Coordinator'}
            </h1>
            
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Department of <strong>{activeDepartment}</strong> • HOD: <strong>{activeHOD}</strong> • Faculty Advisor: <strong>{activeFacultyAdvisor}</strong> • Coordinator: <strong>{user?.name || 'In-Charge'}</strong>. 
              Review zero-code student enrollment, manage real-time event lifecycles, and track departmental accreditation metrics.
            </p>


            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-blue-200">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                <span>Unique Club Code:</span>
                <span className="font-mono font-bold text-white tracking-wider">{activeClubCode}</span>
                <button 
                  onClick={handleCopyCode}
                  className="ml-1 hover:text-white transition-colors"
                  title="Copy Unique Club Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Zero-Code Campus Joining Active
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <Link to="/club-dashboard/events/create" className="flex-1 sm:flex-initial">
              <Button className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md gap-2 border-0">
                <Plus className="w-4 h-4" /> Create Event
              </Button>
            </Link>
            <Button 
              onClick={() => setShowQuickNoticeModal(true)}
              variant="outline" 
              className="flex-1 sm:flex-initial text-white border-white/40 hover:bg-white/10 gap-2 font-medium"
            >
              <Megaphone className="w-4 h-4" /> Broadcast Notice
            </Button>
            <Link to={`/explore/${club.id}`} target="_blank" className="hidden sm:inline-block">
              <Button variant="ghost" className="text-blue-100 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
                Public View <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (4 Synchronized Dynamic Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members (Dynamic from getStoredMembers) */}
        <Link to="/club-dashboard/members" className="group">
          <Card className="hover:shadow-md transition-all border-gray-200 group-hover:border-blue-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                  <TrendingUp className="w-3.5 h-3.5" /> Open Campus
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500">Enrolled Members</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{membersList.length}</p>
              <p className="text-xs text-gray-400 mt-1">
                {coreLeadsCount} Core Leads • {generalMembersCount} Members
              </p>
            </CardContent>
          </Card>
        </Link>
        
        {/* Active & Scheduled Events */}
        <Link to="/club-dashboard/events" className="group">
          <Card className="hover:shadow-md transition-all border-gray-200 group-hover:border-purple-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {upcomingEvents.length} Active
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500">Scheduled Events</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{upcomingEvents.length}</p>
              <p className="text-xs text-gray-400 mt-1">
                {pastEvents.length} Concluded & Archived in Past
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Total Registrations & Turnout */}
        <Link to="/club-dashboard/analytics" className="group">
          <Card className="hover:shadow-md transition-all border-gray-200 group-hover:border-emerald-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {avgTurnoutRate}% Turnout
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500">Total Student RSVPs</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalRegistrations}</p>
              <p className="text-xs text-gray-400 mt-1">
                Confirmed across {clubEvents.length} organized events
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Operational Tasks Checklist */}
        <Link to="/club-dashboard/tasks" className="group">
          <Card className="hover:shadow-md transition-all border-gray-200 group-hover:border-amber-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  pendingTasksCount > 0 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {pendingTasksCount} To-Do
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500">Coordinator Checklist</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {completedTasksCount} / {tasks.length}
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Events Management, Dispatched Announcements, Recent Registrations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduled & Past Events Section with Stage Filter & Direct Transition */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/70 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">Events & Activities Command</h2>
                  <Badge variant="blue" className="text-[10px]">{clubEvents.length} Total</Badge>
                </div>
                <p className="text-xs text-gray-500">Live stage lifecycle tracking & attendance monitor</p>
              </div>

              {/* Event Tabs Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex p-0.5 bg-gray-200/80 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setEventsTab('active')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      eventsTab === 'active' 
                        ? 'bg-white text-gray-900 shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Active & Scheduled ({upcomingEvents.length})
                  </button>
                  <button
                    onClick={() => setEventsTab('past')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      eventsTab === 'past' 
                        ? 'bg-white text-gray-900 shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Past & Concluded ({pastEvents.length})
                  </button>
                </div>
                
                <Link to="/club-dashboard/events/create">
                  <Button size="sm" className="gap-1.5 text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5" /> New
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {eventsTab === 'active' ? (
                <div className="divide-y divide-gray-100">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-gray-50/75 transition-colors relative">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 shadow-xs">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-base">{event.title}</h3>
                            {getEventStageBadge(event.stage)}
                          </div>
                          
                          <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-gray-400" /> {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" /> {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" /> {event.venue}
                            </span>
                          </div>

                          <div className="mt-2.5 flex items-center gap-3">
                            <div className="w-36 bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  (event.registeredCount / event.capacity) >= 0.9 ? 'bg-amber-500' : 'bg-blue-600'
                                }`} 
                                style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 font-semibold">
                              {event.registeredCount} / {event.capacity} seats ({Math.round((event.registeredCount / event.capacity) * 100)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Stage Controls */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 relative">
                        {/* Quick Stage Transition Dropdown Trigger */}
                        <div className="relative">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setStageMenuOpenFor(stageMenuOpenFor === event.id ? null : event.id)}
                            className="text-xs font-semibold gap-1.5"
                          >
                            <span>Stage: <strong className="capitalize">{event.stage}</strong></span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </Button>

                          {/* Quick Stage Switcher Popover */}
                          {stageMenuOpenFor === event.id && (
                            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 animate-in fade-in zoom-in-95">
                              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                Transition Event Stage
                              </div>
                              <button
                                onClick={() => handleTransitionStage(event.id, 'open')}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                                  event.stage === 'open' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-gray-700'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Open for Registration
                                </span>
                                {event.stage === 'open' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                              </button>
                              
                              <button
                                onClick={() => handleTransitionStage(event.id, 'closed')}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50 ${
                                  event.stage === 'closed' ? 'text-amber-700 font-bold bg-amber-50/50' : 'text-gray-700'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Registration Closed
                                </span>
                                {event.stage === 'closed' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                              </button>

                              <button
                                onClick={() => handleTransitionStage(event.id, 'upcoming')}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 ${
                                  event.stage === 'upcoming' ? 'text-purple-700 font-bold bg-purple-50/50' : 'text-gray-700'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> Announced (Soon)
                                </span>
                                {event.stage === 'upcoming' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                              </button>

                              <div className="border-t border-gray-100 my-1"></div>

                              <button
                                onClick={() => handleTransitionStage(event.id, 'past')}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-100 ${
                                  event.stage === 'past' ? 'text-gray-900 font-bold bg-gray-100' : 'text-gray-700'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" /> Mark as Completed (Past)
                                </span>
                                {event.stage === 'past' && <Check className="w-3.5 h-3.5 text-gray-700" />}
                              </button>
                            </div>
                          )}
                        </div>

                        <Link to={`/events/${event.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:text-gray-900 gap-1">
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}

                  {upcomingEvents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-bold text-gray-800">No active events currently scheduled.</p>
                      <p className="text-xs text-gray-400 mt-1">Concluded events have been archived into the Past section.</p>
                      <Link to="/club-dashboard/events/create">
                        <Button size="sm" className="mt-3 text-xs">Create New Event</Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                /* Past Events Tab */
                <div className="divide-y divide-gray-100">
                  {pastEvents.map(event => (
                    <div key={event.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-gray-50/75 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 opacity-90">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover grayscale-30" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-base">{event.title}</h3>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                              Completed Event
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>Held on: <strong>{event.date}</strong></span>
                            <span>Turnout: <strong>{event.registeredCount} Attendees</strong></span>
                          </div>

                          {/* Winners Preview if available */}
                          {event.winners && event.winners.length > 0 && (
                            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              <Trophy className="w-3.5 h-3.5 text-amber-600" />
                              <span>1st Place: <strong>{event.winners[0]?.student}</strong> ({event.winners[0]?.project || 'Winner'})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0">
                        <Link to={`/events/${event.id}`}>
                          <Button variant="outline" size="sm" className="text-xs font-semibold gap-1">
                            <Trophy className="w-3.5 h-3.5 text-amber-600" /> View Results & Podium
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}

                  {pastEvents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <p className="font-bold text-gray-800">No past events recorded yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Concluded events will appear here with student turnouts and winners lists.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Looking for advanced filters and bulk status edits?</span>
                <Link to="/club-dashboard/events" className="text-blue-600 font-bold hover:underline">
                  Open Events Console &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Latest Campus Bulletins & Announcements Feed */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center bg-gray-50/70 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">Latest Dispatched Bulletins</h2>
                  <Badge variant="blue" className="text-[10px]">{announcementsList.length}</Badge>
                </div>
                <p className="text-xs text-gray-500">Broadcasts pushed to student notices & discovery feeds</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setShowQuickNoticeModal(true)} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" /> Quick Post
                </Button>
                <Link to="/club-dashboard/announcements" className="text-xs text-blue-600 hover:text-blue-700 font-bold">
                  View All &rarr;
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {announcementsList.slice(0, 3).map(bulletin => (
                  <div key={bulletin.id} className="p-4 hover:bg-gray-50/60 transition-colors flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900 text-sm">{bulletin.title}</h4>
                          {bulletin.priority === 'High' && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                              Urgent Notice
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {bulletin.category || 'Notice'}
                          </span>
                          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {bulletin.targetAudience || 'All Students'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1 mt-1">{bulletin.content}</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Published {bulletin.date} by {bulletin.author || activeFacultyAdvisor}
                        </p>
                      </div>
                    </div>

                    <Link to="/club-dashboard/announcements">
                      <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-900">
                        Manage
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Student Registrations Stream */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center bg-gray-50/70 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Live Student Registrations</h2>
                <p className="text-xs text-gray-500">Real-time RSVPs enrolled for upcoming sessions</p>
              </div>
              <Link to="/club-dashboard/events">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs font-semibold">
                  Manage Attendance
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Student</th>
                      <th className="px-6 py-3 font-semibold">Event</th>
                      <th className="px-6 py-3 font-semibold">Date Registered</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentRegistrations.map((reg) => (
                      <tr key={reg.id} className="bg-white hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {reg.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{reg.studentName}</p>
                              <p className="text-xs text-gray-500 font-mono">{reg.collegeId} • {reg.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-800 text-xs font-medium">
                          {allEvents.find(e => e.id === reg.eventId)?.title || 'Flagship Hackathon 2026'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{reg.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            reg.status === 'Confirmed' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Operational Checklist, Club Leadership & Zero-Code Admissions, Institutional Accreditation */}
        <div className="space-y-6">
          {/* Coordinator Checklist & Operational Queue (Direct interactive toggle & quick add) */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-3 bg-gray-50/70 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">Coordinator Checklist</h2>
                  <Badge variant="blue" className="text-[10px]">{tasks.length}</Badge>
                </div>
                <p className="text-xs text-gray-500">Shared tasks for teachers & student leads</p>
              </div>
              <Button 
                onClick={() => setShowQuickTaskModal(true)} 
                variant="outline" 
                size="sm" 
                className="text-xs gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" /> Add Task
              </Button>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              <div className="space-y-2.5">
                {tasks.slice(0, 5).map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'} 
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 font-medium group-hover:text-blue-700'}`}>
                        {task.title}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          task.status === 'completed' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : task.status === 'in_progress' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {task.status === 'in_progress' ? 'In Progress' : task.status === 'completed' ? 'Done' : 'To-Do'}
                        </span>
                        
                        {task.priority === 'High' && (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            Urgent
                          </span>
                        )}

                        <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                          {task.category || 'General'}
                        </span>

                        <span className="text-[10px] text-gray-400">
                          Due: {task.dueDate || 'Soon'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/club-dashboard/tasks">
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs gap-1 font-semibold">
                  Manage Full Checklist & Kanban ({tasks.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Club Leadership Roster & Direct Admissions Notice */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-3 bg-gray-50/70 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Club Leadership Roster</h2>
                <p className="text-xs text-gray-500">Official Advisor & Student Coordinators</p>
              </div>
              <Link to="/club-dashboard/members" className="text-xs text-blue-600 font-semibold hover:underline">
                Full Directory
              </Link>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {/* Club Coordinator Leadership Banner */}
              <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {(user?.name || 'C').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{user?.name || 'Club Coordinator'}</p>
                    <p className="text-xs text-blue-700 font-semibold">{user?.clubRole || 'Club Coordinator'}</p>
                  </div>
                </div>
                <Badge variant="blue" className="text-[10px]">Coordinator In-Charge</Badge>
              </div>

              {/* Faculty Advisor Leadership Banner */}
              <div className="flex items-center justify-between p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {activeFacultyAdvisor ? activeFacultyAdvisor.charAt(0) : 'D'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{activeFacultyAdvisor}</p>
                    <p className="text-xs text-purple-700 font-semibold">Faculty Advisor</p>
                  </div>
                </div>
                <Badge variant="purple" className="text-[10px]">Academic Mentor</Badge>
              </div>


              {/* Student Coordinators List */}
              <div className="space-y-2 mt-2">
                {club.coreTeam && club.coreTeam.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">{member.year}</span>
                  </div>
                ))}
              </div>

              {/* Direct Zero-Code Joining Note */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Open Campus Enrollment Active</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Students join seamlessly by submitting academic details on your public club profile. No invitation codes required.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Unique Code: <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{activeClubCode}</span>
                </div>
                <Link to="/club-dashboard/members">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 font-semibold">
                    + Add Member
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Institutional Accreditation & Analytics Hub */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 text-white shadow-lg border-0">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">NAAC Accreditation Hub</h3>
                    <p className="text-[11px] text-gray-400">Criterion 5.3 Institutional Audit</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  Audit Ready
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-1">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[11px] text-gray-400">Intranet Reach</p>
                  <p className="text-lg font-extrabold text-white mt-0.5">1,450</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">+28% this term</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[11px] text-gray-400">Turnout Efficiency</p>
                  <p className="text-lg font-extrabold text-white mt-0.5">{avgTurnoutRate}%</p>
                  <p className="text-[10px] text-blue-400 mt-0.5">High Engagement</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Department of <strong>{activeDepartment}</strong> meeting schedule: <strong>{club.meetingSchedule || 'Every Wednesday'}</strong> at {club.meetingVenue || 'Main Computer Lab 3'}.
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to={`/explore/${club.id}`} target="_blank">
                  <Button size="sm" variant="outline" className="w-full text-white border-white/30 hover:bg-white/10 text-xs gap-1.5">
                    Public View <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link to="/club-dashboard/analytics">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-sm font-semibold">
                    <BarChart3 className="w-3.5 h-3.5" /> Full Audit Report
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Add Task Modal */}
      {showQuickTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900">Add Operational Task</h3>
              </div>
              <button onClick={() => setShowQuickTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Task Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Finalize projector & audio in Lab 3"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="High">Urgent / High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Logistics">Logistics</option>
                    <option value="Technical">Technical</option>
                    <option value="Publicity">Publicity</option>
                    <option value="Finance">Finance</option>
                    <option value="Permissions">Permissions</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Due Deadline</label>
                <input 
                  type="text"
                  placeholder="e.g. Tomorrow 5 PM, Friday"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowQuickTaskModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Add to Checklist
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Broadcast Announcement Modal */}
      {showQuickNoticeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900">Broadcast Campus Notice</h3>
              </div>
              <button onClick={() => setShowQuickNoticeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notice Headline *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Schedule Change: Workshop starts at 3 PM"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Content / Details *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Provide essential details, venue updates, or registration reminders..."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Notice">Notice</option>
                    <option value="Event Alert">Event Alert</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Recruitment">Recruitment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Audience</label>
                  <select
                    value={noticeAudience}
                    onChange={(e) => setNoticeAudience(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="All Students">All Students</option>
                    <option value="Club Members Only">Club Members</option>
                    <option value="Core Team">Core Team</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowQuickNoticeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Publish Notice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
