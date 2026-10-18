import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { getClubApprovalStatus } from '../../data/mockData';
import { 
  GraduationCap, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  X,
  Briefcase,
  Clock,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { getDashboardPathForRole } from '../../services/roles';

export function Login() {
  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  // Active role tab: 'student' or 'club'
  const [role, setRole] = useState('student');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state: { show: boolean, type: 'warning' | 'error' | 'success', title: string, message: string }
  const [toast, setToast] = useState(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Trigger floating toast notification
  const triggerToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 6500);
  };

  // Auto-fill demo credentials
  const handleAutoFill = (selectedRole, variant = 'approved') => {
    setError('');
    if (selectedRole === 'club') {
      setRole('club');
      if (variant === 'requested') {
        setEmail('verma.fintech@college.edu');
        setPassword('FintechAdmin#2026');
      } else if (variant === 'rejected') {
        setEmail('roy.gaming@college.edu');
        setPassword('GamingAdmin#2026');
      } else {
        setEmail('sharma.cse@college.edu');
        setPassword('ClubAdmin#2026');
      }
    } else {
      setRole('student');
      setEmail('vikram.cs24@college.edu');
      setPassword('Password@2026');
    }
  };

  // Coordinator login verification checking approval status
  const handleCoordinatorLoginAttempt = (coordRoleOrAccount) => {
    let clubId = 'c1';
    
    if (typeof coordRoleOrAccount === 'string') {
      if (coordRoleOrAccount === 'coordinator_requested') {
        clubId = 'c_pending';
      } else if (coordRoleOrAccount === 'coordinator_rejected') {
        clubId = 'c_rejected';
      } else {
        clubId = 'c1';
      }
    } else if (coordRoleOrAccount?.clubId) {
      clubId = coordRoleOrAccount.clubId;
    }

    const approvalInfo = getClubApprovalStatus(clubId);

    if (approvalInfo.approvalStatus === 'requested') {
      triggerToast(
        'warning',
        'not yet approved',
        `Your club "${approvalInfo.clubName}" is currently pending review by the university administration. Access to the club coordinator dashboard will unlock once approved.`
      );
      return false;
    }

    if (approvalInfo.approvalStatus === 'rejected') {
      triggerToast(
        'error',
        'your club was rejected',
        `Your club "${approvalInfo.clubName}" registration was rejected by university administration. Reason: ${approvalInfo.rejectionReason || 'Non-compliance with campus society guidelines.'}`
      );
      return false;
    }

    return true;
  };

  // Direct 1-click login handler for rapid testing/demos
  const handleDirectLogin = async (roleType) => {
    if (roleType === 'club_coordinator') {
      setEmail('coordinator@college.edu');
      setPassword('Admin@2026');
      setRole('club');
    } else if (roleType === 'coordinator_requested') {
      handleCoordinatorLoginAttempt('coordinator_requested');
    } else if (roleType === 'coordinator_rejected') {
      handleCoordinatorLoginAttempt('coordinator_rejected');
    } else {
      setEmail('vikram.cs24@college.edu');
      setPassword('Password@2026');
      setRole('student');
    }
  };

  // Form submit handler with real backend authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your college email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await loginWithCredentials(trimmedEmail, password);
      const destination = getDashboardPathForRole(loggedUser.role);

      if (destination) {
        navigate(destination);
      } else {
        // Safe access-denied for unknown or missing roles
        setError(`Access Denied: Unrecognized account role "${loggedUser?.role}". Please contact system administration.`);
      }
    } catch (err) {
      const errorCode = err.code || '';
      const errorMessage = err.message || 'Login failed. Please check your credentials.';

      // Handle specific backend error codes with user-friendly toasts
      if (errorCode === 'ACCOUNT_PENDING_APPROVAL' || errorCode === 'CLUB_NOT_YET_APPROVED') {
        triggerToast(
          'warning',
          'Account Pending Approval',
          'Your club registration is currently pending review by the university administration. You will receive access once approved.'
        );
      } else if (errorCode === 'CLUB_REJECTED') {
        triggerToast(
          'error',
          'Club Application Rejected',
          errorMessage || 'Your club registration was rejected by university administration.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg border-gray-200 shadow-xl overflow-hidden">
        {/* Top Header */}
        <CardHeader className="text-center pt-8 pb-4 border-b-0 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md mb-3 text-white transition-all">
            {role === 'student' ? (
              <GraduationCap className="w-8 h-8 animate-in fade-in" />
            ) : (
              <Building2 className="w-8 h-8 animate-in fade-in" />
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to access your college club portal & activities
          </p>

          {/* Role Switcher Pill Tabs */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl mt-6 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                role === 'student'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              General Student
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('club');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                role === 'club'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Club Coordinator
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form Top Label with Auto-Fill Action */}
            <div className="flex flex-wrap justify-between items-center gap-1.5 pb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {role === 'student' ? 'Student Credentials' : 'Club Coordinator Credentials'}
              </span>
              {role === 'student' ? (
                <button
                  type="button"
                  onClick={() => handleAutoFill('student')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Auto-fill Student
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-gray-400 font-medium">Auto-fill:</span>
                  <button
                    type="button"
                    onClick={() => handleAutoFill('club', 'approved')}
                    className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    title="Auto-fill approved Byte Warriors coordinator"
                  >
                    Approved
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => handleAutoFill('club', 'requested')}
                    className="font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                    title="Auto-fill requested/pending FinTech Society coordinator"
                  >
                    Requested
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => handleAutoFill('club', 'rejected')}
                    className="font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    title="Auto-fill rejected Gaming Union coordinator"
                  >
                    Rejected
                  </button>
                </div>
              )}
            </div>

            {/* Email Address */}
            <Input 
              label="College Email Address" 
              id="email" 
              type="email" 
              placeholder={role === 'student' ? 'e.g. vikram.cs24@college.edu' : 'e.g. sharma.cse@college.edu'}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required 
              disabled={isSubmitting}
            />

            {/* Password with Eye Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  disabled={isSubmitting}
                  className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                />
                <span className="text-gray-600 text-xs sm:text-sm">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-semibold text-blue-600 hover:text-blue-700 text-xs sm:text-sm cursor-pointer hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Active Sign In Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-sm font-bold shadow-md gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In as {role === 'student' ? 'Student' : 'Club Coordinator'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 font-medium text-gray-400 uppercase tracking-wider">
                Or 1-Click Instant Demo Login
              </span>
            </div>
          </div>

          {/* 1-Click Prototype Demo Logins */}
          <div className="space-y-2.5">
            {/* Approved Club Coordinator */}
            <Button 
              variant="outline" 
              className="w-full justify-start text-left gap-3.5 h-15 border-blue-200 hover:bg-blue-50/60 hover:border-blue-400 transition-all cursor-pointer group" 
              onClick={() => handleDirectLogin('club_coordinator')}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                  Dr. Sharma • Byte Warriors
                  <span className="text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Approved</span>
                </div>
                <div className="text-[11px] text-gray-500 font-normal truncate">
                  Unlocks full Coordinator Dashboard & Event Hosting
                </div>
              </div>
            </Button>

            {/* Pending / Requested Club Coordinator (Triggers Toast) */}
            <Button 
              variant="outline" 
              className="w-full justify-start text-left gap-3.5 h-15 border-amber-200 hover:bg-amber-50/60 hover:border-amber-400 transition-all cursor-pointer group" 
              onClick={() => handleDirectLogin('coordinator_requested')}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                  Dr. Neha Verma • FinTech Society
                  <span className="text-[10px] uppercase font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Requested</span>
                </div>
                <div className="text-[11px] text-amber-700 font-normal truncate">
                  Tests: triggers "not yet approved" toast notification
                </div>
              </div>
            </Button>

            {/* Rejected Club Coordinator (Triggers Toast) */}
            <Button 
              variant="outline" 
              className="w-full justify-start text-left gap-3.5 h-15 border-rose-200 hover:bg-rose-50/60 hover:border-rose-400 transition-all cursor-pointer group" 
              onClick={() => handleDirectLogin('coordinator_rejected')}
            >
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-700 group-hover:scale-105 transition-transform">
                <XCircle className="w-4 h-4 text-rose-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                  Devansh Roy • Campus Gaming Union
                  <span className="text-[10px] uppercase font-extrabold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">Rejected</span>
                </div>
                <div className="text-[11px] text-rose-700 font-normal truncate">
                  Tests: triggers "your club was rejected" toast notification
                </div>
              </div>
            </Button>

            {/* General Student Login */}
            <Button 
              variant="outline" 
              className="w-full justify-start text-left gap-3.5 h-15 border-gray-200 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all cursor-pointer group" 
              onClick={() => handleDirectLogin('general_student')}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                  Vikram Singh • B.Tech CSE
                  <span className="text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Student</span>
                </div>
                <div className="text-[11px] text-gray-500 font-normal truncate">
                  Browse Clubs, RSVP Passes & Student Profile
                </div>
              </div>
            </Button>
          </div>
          {/* Bottom link to Signup */}
          <div className="pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700">
              Create an Account / Register Club
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Toast Notification (Fixed Top-Center) */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
            toast.type === 'warning' 
              ? 'bg-amber-50/95 border-amber-300 text-amber-900 shadow-amber-500/10'
              : toast.type === 'error'
              ? 'bg-rose-50/95 border-rose-300 text-rose-900 shadow-rose-500/10'
              : 'bg-emerald-50/95 border-emerald-300 text-emerald-900 shadow-emerald-500/10'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'warning' && <Clock className="w-5 h-5 text-amber-600 animate-pulse" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-600" />}
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <div className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                <span>{toast.title}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  toast.type === 'warning' ? 'bg-amber-200/80 text-amber-800' : 'bg-rose-200/80 text-rose-800'
                }`}>
                  {toast.type === 'warning' ? 'Status: Requested' : 'Status: Rejected'}
                </span>
              </div>
              <p className="text-xs leading-relaxed mt-1 opacity-90 font-medium">
                {toast.message}
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Campus Password Reset</h3>
              <p className="text-xs text-gray-500 mt-1">
                For institutional security, student and faculty accounts are managed by the campus administration.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> College IT Helpdesk
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Contact: <strong>it-helpdesk@college.edu</strong> or visit <strong>Academic Block 1, Room 204</strong> with your College ID card to issue a password reset ticket.
              </p>
            </div>
            <Button 
              className="w-full text-xs font-bold cursor-pointer" 
              onClick={() => setShowForgotModal(false)}
            >
              Got it, close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
