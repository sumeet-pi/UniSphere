import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
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
  Briefcase
} from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Active role tab: 'student' or 'club'
  const [role, setRole] = useState('student');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Auto-fill demo credentials
  const handleAutoFill = (selectedRole) => {
    setError('');
    if (selectedRole === 'club') {
      setRole('club');
      setEmail('sharma.cse@college.edu');
      setPassword('ClubAdmin#2026');
    } else {
      setRole('student');
      setEmail('vikram.cs24@college.edu');
      setPassword('Password@2026');
    }
  };

  // Direct 1-click login handler
  const handleDirectLogin = (roleType) => {
    login(roleType);
    if (roleType === 'club_coordinator' || roleType === 'teacher' || roleType === 'club_student') {
      navigate('/club-dashboard');
    } else {
      navigate('/student');
    }
  };

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your college email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (role === 'club') {
      login('club_coordinator');
      navigate('/club-dashboard');
    } else {
      login('general_student');
      navigate('/student');
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
            <div className="flex justify-between items-center pb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {role === 'student' ? 'Student Credentials' : 'Club Coordinator Credentials'}
              </span>
              <button
                type="button"
                onClick={() => handleAutoFill(role)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Auto-fill Demo
              </button>
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
                  className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
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
              <Button type="submit" className="w-full h-11 text-sm font-bold shadow-md gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer">
                Sign In as {role === 'student' ? 'Student' : 'Club Coordinator'} <ArrowRight className="w-4 h-4" />
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
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start text-left gap-3.5 h-16 border-blue-200 hover:bg-blue-50/60 hover:border-blue-400 transition-all cursor-pointer group" 
              onClick={() => handleDirectLogin('club_coordinator')}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  Continue as Club Coordinator
                  <span className="text-[10px] uppercase font-extrabold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Faculty & Student</span>
                </div>
                <div className="text-xs text-gray-500 font-normal truncate mt-0.5">
                  Dr. Sharma • Byte Warriors (Manage & Create Events)
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start text-left gap-3.5 h-16 border-gray-200 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all cursor-pointer group" 
              onClick={() => handleDirectLogin('general_student')}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  Continue as General Student
                  <span className="text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Student Portal</span>
                </div>
                <div className="text-xs text-gray-500 font-normal truncate mt-0.5">
                  Vikram Singh • B.Tech CSE (Discover Clubs & Events)
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

