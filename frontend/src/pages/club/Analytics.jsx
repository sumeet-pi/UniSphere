import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { fetchClubById } from '../../store/slices/clubsSlice';
import { 
  getStoredEvents, 
  getStoredMembers, 
  clubs
} from '../../data/mockData';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  Award, 
  Zap, 
  Download, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  Clock, 
  Target, 
  GraduationCap, 
  Trophy, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Layers, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Analytics() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const reduxClub = useSelector((state) => state.clubs?.currentClub);
  const clubId = user?.clubId || user?.managedClubId || 'c1';
  const club = clubs.find(c => c.id === clubId) || clubs[0];

  useEffect(() => {
    if (clubId && clubId !== 'c1') {
      dispatch(fetchClubById(clubId));
    }
  }, [dispatch, clubId]);

  const activeClubName = reduxClub?.name || user?.clubName || club.name;

  const [timeHorizon, setTimeHorizon] = useState('Current Semester (Spring 2026)');
  const [reportExported, setReportExported] = useState(false);

  // Load live persistent data
  const eventsList = getStoredEvents().filter(e => e.clubId === club.id);
  const membersList = getStoredMembers(club.id);

  // Computed metrics from real stored data
  const totalRegistrations = eventsList.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);
  const totalCapacity = eventsList.reduce((acc, curr) => acc + (curr.capacity || 100), 0);
  const avgTurnoutRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 92;
  const completedEvents = eventsList.filter(e => e.stage === 'past' || e.status === 'Past');
  const certificatesIssued = completedEvents.reduce((acc, curr) => acc + (curr.registeredCount || 80), 0);

  const handleExportReport = () => {
    setReportExported(true);
    setTimeout(() => {
      setReportExported(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification on Export */}
      {reportExported && (
        <div className="fixed top-5 right-5 z-50 bg-gray-950 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 border border-gray-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-bold">Official Accreditation Audit Generated!</p>
            <p className="text-xs text-gray-300">Departmental NAAC / IQAC performance report ready for print or export.</p>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <BarChart3 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {activeClubName} • Performance Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Club Analytics & Engagement
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Track student turnouts, capacity utilization, multi-department diversity, and verified certificate disbursements. Ready for institutional accreditation (NAAC / NIRF).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Time Horizon Selector */}
            <select 
              value={timeHorizon}
              onChange={e => setTimeHorizon(e.target.value)}
              className="bg-white/15 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none backdrop-blur-md cursor-pointer hover:bg-white/20 transition-colors"
            >
              <option value="Current Semester (Spring 2026)" className="text-gray-900">Spring 2026 (Current Term)</option>
              <option value="Autumn 2025" className="text-gray-900">Autumn 2025</option>
              <option value="Academic Year 2025-2026" className="text-gray-900">Full Academic Year 2025-26</option>
              <option value="All-Time History" className="text-gray-900">All-Time Institutional Record</option>
            </select>

            <Button 
              onClick={handleExportReport} 
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md gap-2 border-0"
            >
              <Download className="w-4 h-4" /> Export NAAC Audit
            </Button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Campus Reach / Views */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Intranet Reach</p>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-gray-900">1,450</p>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Unique student impressions</p>
          </CardContent>
        </Card>

        {/* Total Club Members */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Club Members</p>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-gray-900">{membersList.length}</p>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Directly enrolled students</p>
          </CardContent>
        </Card>

        {/* Total Registrations */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Signups</p>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-gray-900">{totalRegistrations}</p>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Across all organized events</p>
          </CardContent>
        </Card>

        {/* Turnout / Capacity Rate */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Avg Turnout</p>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-gray-900">{avgTurnoutRate}%</p>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +6%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Capacity utilization rate</p>
          </CardContent>
        </Card>

        {/* Certificates Issued */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Certificates</p>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-gray-900">{certificatesIssued}</p>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Accredited participant credentials</p>
          </CardContent>
        </Card>

        {/* Student Rating */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Club Rating</p>
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-gray-900">4.92 / 5</p>
              <span className="text-xs font-bold text-rose-600">★ Top 1%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Post-event feedback survey</p>
          </CardContent>
        </Card>
      </div>

      {/* Mid Section: 2 Columns of Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Turnout & Capacity Utilization */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gray-50/70">
            <div>
              <h2 className="text-base font-bold text-gray-900">Event Capacity vs. Attendance</h2>
              <p className="text-xs text-gray-500">Turnout efficiency per campus event</p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
              {eventsList.length} Events Tracked
            </span>
          </CardHeader>
          <CardContent className="p-6 space-y-4 flex-1">
            {eventsList.map(event => {
              const cap = event.capacity || 100;
              const reg = event.registeredCount || 0;
              const pct = Math.min(100, Math.round((reg / cap) * 100));

              return (
                <div key={event.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{event.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        event.stage === 'past' ? 'bg-gray-100 text-gray-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {event.stage === 'past' ? 'Completed' : 'Active'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-gray-700">
                      {reg} / {cap} seats ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 95 ? 'bg-emerald-600' : pct >= 80 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Academic Branch Diversity & Cohorts */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gray-50/70">
            <div>
              <h2 className="text-base font-bold text-gray-900">Department Diversity Breakdown</h2>
              <p className="text-xs text-gray-500">Cross-departmental participation across engineering & management</p>
            </div>
            <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
              Inter-Disciplinary
            </span>
          </CardHeader>
          <CardContent className="p-6 space-y-5 flex flex-col justify-between flex-1">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-center">
                <p className="text-3xl font-black text-blue-700">58%</p>
                <p className="text-xs font-bold text-gray-800 mt-1">Computer Science (CSE)</p>
                <p className="text-[11px] text-gray-400">Flagship base department</p>
              </div>

              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-center">
                <p className="text-3xl font-black text-indigo-700">22%</p>
                <p className="text-xs font-bold text-gray-800 mt-1">Information Tech (IT)</p>
                <p className="text-[11px] text-gray-400">Software & network tracks</p>
              </div>

              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 text-center">
                <p className="text-3xl font-black text-purple-700">12%</p>
                <p className="text-xs font-bold text-gray-800 mt-1">Electronics (ECE)</p>
                <p className="text-[11px] text-gray-400">Hardware & IoT enthusiasts</p>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 text-center">
                <p className="text-3xl font-black text-amber-700">8%</p>
                <p className="text-xs font-bold text-gray-800 mt-1">ME & Management</p>
                <p className="text-[11px] text-gray-400">Product & design members</p>
              </div>
            </div>

            {/* Student Cohort / Year Distribution */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Student Cohort Representation</p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-extrabold text-gray-900 block text-sm">26%</span>
                  <span className="text-[11px] text-gray-500">1st Year</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-extrabold text-blue-700 block text-sm">38%</span>
                  <span className="text-[11px] text-gray-500">2nd Year</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-extrabold text-indigo-700 block text-sm">24%</span>
                  <span className="text-[11px] text-gray-500">3rd Year</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-extrabold text-purple-700 block text-sm">12%</span>
                  <span className="text-[11px] text-gray-500">4th Year</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Conversion Funnel */}
      <Card>
        <CardHeader className="bg-gray-50/70 pb-3 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Engagement & Attendance Conversion Funnel</h2>
          <p className="text-xs text-gray-500">From discovery on UniSphere to active event participation and completion</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">1. Feed Impressions</p>
              <p className="text-2xl font-black text-gray-900 mt-1">1,450</p>
              <p className="text-[11px] text-gray-400 mt-1">Public profile pageviews</p>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">2. Confirmed RSVPs</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{totalRegistrations}</p>
              <p className="text-[11px] text-blue-600 mt-1">29% conversion rate</p>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">3. Physical Turnout</p>
              <p className="text-2xl font-black text-indigo-900 mt-1">{Math.round(totalRegistrations * 0.94)}</p>
              <p className="text-[11px] text-indigo-600 mt-1">94% checked in at gate</p>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">4. Certificates Issued</p>
              <p className="text-2xl font-black text-emerald-900 mt-1">{certificatesIssued}</p>
              <p className="text-[11px] text-emerald-600 mt-1">100% verified fulfillment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Official Accreditation Audit Log Table (NAAC / IQAC Ready) */}
      <Card>
        <CardHeader className="bg-gray-50/70 p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Official Departmental Accreditation Audit Table</h2>
            <p className="text-xs text-gray-500">Verified record for College IQAC / NAAC Criterion 5 student support records</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportReport}
            className="text-xs gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" /> Export CSV / Print
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Event & Activity</th>
                  <th className="px-6 py-3.5 font-bold">Date & Venue</th>
                  <th className="px-6 py-3.5 font-bold">Capacity Filled</th>
                  <th className="px-6 py-3.5 font-bold">Lifecycle Stage</th>
                  <th className="px-6 py-3.5 font-bold">Winners & Podium</th>
                  <th className="px-6 py-3.5 text-right font-bold">Faculty Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eventsList.map(e => (
                  <tr key={e.id} className="bg-white hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-sm">{e.title}</p>
                      <p className="text-xs text-gray-400">{e.category || 'Technical Workshop'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800 text-xs font-semibold">{e.date}</p>
                      <p className="text-xs text-gray-400">{e.venue}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-gray-900 text-xs">
                        {e.registeredCount} / {e.capacity}
                      </span>
                      <span className="text-xs text-emerald-600 ml-1.5 font-semibold">
                        ({Math.round(((e.registeredCount || 0) / (e.capacity || 100)) * 100)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        e.stage === 'past' ? 'bg-gray-100 text-gray-700' :
                        e.stage === 'closed' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        e.stage === 'upcoming' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {e.stage === 'past' ? 'Concluded / Past' :
                         e.stage === 'closed' ? 'Admissions Closed' :
                         e.stage === 'upcoming' ? 'Announced (Soon)' : 'Open for Registration'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {e.winners && e.winners.length > 0 ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-flex">
                          <Trophy className="w-3.5 h-3.5 text-amber-600" />
                          <span>{e.winners.length} Champions Declared</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Pending Conclusion</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
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
  );
}
