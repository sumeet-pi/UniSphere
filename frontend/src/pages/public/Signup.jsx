import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader } from '../../components/Card';
import { Input } from '../../components/Input';
import { 
  GraduationCap, 
  Building2, 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Shield,
  Clock,
  Send,
  Loader2
} from 'lucide-react';
import { getDashboardPathForRole } from '../../services/roles';

// Dynamic course configuration
export const COURSE_CONFIGS = {
  'B.Tech': {
    duration: '4 Years (8 Sems)',
    hasBranch: true,
    branchLabel: 'Branch / Engineering Department',
    branches: [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Communication',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Artificial Intelligence & Data Science'
    ],
    semesters: ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem']
  },
  'BCA': {
    duration: '3 Years (6 Sems)',
    hasBranch: false,
    branches: [],
    semesters: ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem']
  },
  'BBA': {
    duration: '3 Years (6 Sems)',
    hasBranch: false,
    branches: [],
    semesters: ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem']
  },
  'MBA': {
    duration: '2 Years (4 Sems)',
    hasBranch: true,
    branchLabel: 'Management Specialization',
    branches: [
      'General Management',
      'Finance & Banking',
      'Marketing & Sales',
      'Human Resource Management (HR)',
      'Business Analytics',
      'Operations & Supply Chain'
    ],
    semesters: ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem']
  },
  'MCA': {
    duration: '2 Years (4 Sems)',
    hasBranch: false,
    branches: [],
    semesters: ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem']
  },
  'M.Tech': {
    duration: '2 Years (4 Sems)',
    hasBranch: true,
    branchLabel: 'M.Tech Specialization',
    branches: [
      'Computer Science & Engineering',
      'VLSI & Embedded Systems',
      'Thermal & Fluid Engineering',
      'Structural Engineering',
      'Power Systems & Control'
    ],
    semesters: ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem']
  },
  'B.Sc': {
    duration: '3 Years (6 Sems)',
    hasBranch: true,
    branchLabel: 'Major Field / Subject',
    branches: [
      'Computer Science',
      'Information Technology',
      'Mathematics',
      'Physics',
      'Chemistry'
    ],
    semesters: ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem']
  }
};

// Reusable Password and Confirm Password Component with Strength Meter
function PasswordFields({ 
  password, 
  confirmPassword, 
  onChangePassword, 
  onChangeConfirmPassword,
  passwordLabel = "Create Password",
  confirmLabel = "Confirm Password"
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Criteria calculations
  const criteria = [
    { label: '8+ Characters', met: password.length >= 8 },
    { label: 'Upper & Lowercase', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'At least 1 Number', met: /[0-9]/.test(password) },
    { label: 'Special Symbol (!@#$)', met: /[^A-Za-z0-9]/.test(password) }
  ];

  const metCount = criteria.filter(c => c.met).length;

  // Strength score & styling
  let strengthLabel = 'Too Weak';
  let strengthColor = 'text-gray-400';
  let barColor = 'bg-gray-200';
  let filledBars = 0;

  if (password.length > 0) {
    if (metCount <= 1) {
      strengthLabel = 'Weak';
      strengthColor = 'text-rose-600';
      barColor = 'bg-rose-500';
      filledBars = 1;
    } else if (metCount === 2) {
      strengthLabel = 'Fair';
      strengthColor = 'text-amber-600';
      barColor = 'bg-amber-500';
      filledBars = 2;
    } else if (metCount === 3) {
      strengthLabel = 'Good';
      strengthColor = 'text-blue-600';
      barColor = 'bg-blue-500';
      filledBars = 3;
    } else {
      strengthLabel = 'Strong';
      strengthColor = 'text-emerald-600';
      barColor = 'bg-emerald-500';
      filledBars = 4;
    }
  }

  const isMatching = confirmPassword && password === confirmPassword;
  const isMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="space-y-3 pt-1">
      {/* 2-Column Password & Confirm Password Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {passwordLabel}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => onChangePassword(e.target.value)}
              placeholder="••••••••"
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

        {/* Confirm Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              {confirmLabel}
            </label>
            {isMatching && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Match
              </span>
            )}
            {isMismatch && (
              <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5" /> Do not match
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => onChangeConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={`block w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 shadow-sm transition-colors ${
                isMismatch
                  ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                  : isMatching
                  ? 'border-emerald-300 text-emerald-900 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/20'
                  : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 bg-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer"
              title={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Password Strength Indicator & Requirements Checklist */}
      {password.length > 0 && (
        <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Strength Header & Bar */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-gray-500" />
              Password Strength:
              <span className={`font-bold ml-0.5 ${strengthColor}`}>{strengthLabel}</span>
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              {metCount} of {criteria.length} rules met
            </span>
          </div>

          {/* 4 Segment Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5 h-1.5">
            {[1, 2, 3, 4].map(idx => (
              <div
                key={idx}
                className={`h-full rounded-full transition-all duration-300 ${
                  idx <= filledBars ? barColor : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Criteria Checklist Chips */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5 text-xs">
            {criteria.map((c, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                  c.met ? 'text-emerald-700 font-semibold' : 'text-gray-400'
                }`}
              >
                {c.met ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 stroke-[2.5]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1 mr-1 flex-shrink-0" />
                )}
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Signup() {
  const { signupWithCredentials, registerCoordinator } = useAuth();
  const navigate = useNavigate();

  // Active role tab: 'student' or 'club'
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedClubRequest, setSubmittedClubRequest] = useState(null);

  // General Student Form State
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    classRollNo: '',
    universityRollNo: '',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    sem: '1st Sem'
  });

  // Current course configuration
  const currentCourseConfig = COURSE_CONFIGS[studentData.course] || COURSE_CONFIGS['B.Tech'];

  // Handle dynamic course change
  const handleCourseChange = (newCourse) => {
    const config = COURSE_CONFIGS[newCourse] || COURSE_CONFIGS['B.Tech'];
    const availableBranches = config.branches || [];
    const availableSemesters = config.semesters;

    setStudentData(prev => ({
      ...prev,
      course: newCourse,
      branch: config.hasBranch ? (availableBranches[0] || '') : '',
      sem: availableSemesters.includes(prev.sem) ? prev.sem : availableSemesters[0]
    }));
  };

  // Club Registration Form State
  const [clubData, setClubData] = useState({
    clubName: '',
    department: 'Computer Science & Engineering',
    hod: '',
    coordinatorTeacher: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    category: 'Technical',
    description: ''
  });

  // Quick fill sample data helper
  const handleQuickFillStudent = (courseType = 'B.Tech') => {
    setError('');
    if (courseType === 'BBA') {
      setStudentData({
        name: 'Aanya Gupta',
        email: 'aanya.bba@college.edu',
        phone: '+91 98765 12018',
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
        classRollNo: 'BBA-18',
        universityRollNo: '2401050018',
        course: 'BBA',
        branch: '',
        sem: '3rd Sem'
      });
    } else if (courseType === 'MBA') {
      setStudentData({
        name: 'Karan Mehra',
        email: 'karan.mba@college.edu',
        phone: '+91 98112 34507',
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
        classRollNo: 'MBA-07',
        universityRollNo: '2401090007',
        course: 'MBA',
        branch: 'Finance & Banking',
        sem: '2nd Sem'
      });
    } else if (courseType === 'BCA') {
      setStudentData({
        name: 'Sneha Patel',
        email: 'sneha.bca@college.edu',
        phone: '+91 97234 56731',
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
        classRollNo: 'BCA-31',
        universityRollNo: '2401040031',
        course: 'BCA',
        branch: '',
        sem: '4th Sem'
      });
    } else {
      setStudentData({
        name: 'Rohan Sharma',
        email: 'rohan.cs25@college.edu',
        phone: '+91 98991 23488',
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
        classRollNo: 'CS-42',
        universityRollNo: '2401020088',
        course: 'B.Tech',
        branch: 'Computer Science & Engineering',
        sem: '4th Sem'
      });
    }
  };

  const handleQuickFillClub = () => {
    setError('');
    setClubData({
      clubName: 'AI & Machine Learning Club',
      department: 'Computer Science & Engineering',
      hod: 'Dr. V. K. Mathur',
      coordinatorTeacher: 'Dr. Neha Verma',
      phone: '+91 98101 23456',
      email: 'aiml.club@college.edu',
      password: 'ClubAdmin#2026',
      confirmPassword: 'ClubAdmin#2026',
      category: 'Technical',
      description: 'Dedicated to hands-on artificial intelligence projects, Kaggle hackathons, and research talks.'
    });
  };

  // Student form submission
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (studentData.password !== studentData.confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (studentData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    const config = COURSE_CONFIGS[studentData.course] || COURSE_CONFIGS['B.Tech'];
    const payload = {
      full_name: studentData.name.trim(),
      email: studentData.email.trim(),
      password: studentData.password,
      phone: studentData.phone?.trim() || null,
      course: studentData.course,
      branch: config.hasBranch ? studentData.branch : null,
      semester: studentData.sem,
      class_roll_no: studentData.classRollNo?.trim() || null,
      university_roll_no: studentData.universityRollNo?.trim() || null,
    };

    setIsSubmitting(true);
    try {
      const registeredUser = await signupWithCredentials(payload);
      const destination = getDashboardPathForRole(registeredUser?.role) || '/student';
      navigate(destination);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Club form submission - routes to higher authority approval
  const handleClubSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (clubData.password !== clubData.confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (clubData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    const payload = {
      club_name: clubData.clubName.trim(),
      department: clubData.department.trim(),
      category: clubData.category.trim(),
      hod: clubData.hod.trim(),
      faculty_advisor: clubData.coordinatorTeacher.trim(),
      email: clubData.email.trim(),
      phone: clubData.phone.trim(),
      description: clubData.description?.trim() || null,
      password: clubData.password,
    };

    setIsSubmitting(true);
    try {
      const response = await registerCoordinator(payload);
      const newClubRequest = {
        id: response.club_id,
        referenceId: response.reference_id,
        name: response.faculty_advisor,
        email: response.email,
        phone: response.phone,
        role: 'Club Coordinator',
        clubName: response.club_name,
        department: response.department,
        hod: response.hod,
        facultyAdvisor: response.faculty_advisor,
        coordinatorTeacher: response.faculty_advisor,
        category: response.category,
        clubCode: 'BW-CSE-2026',
        clubRole: 'Faculty Club Coordinator',
        managedClubId: response.club_id,
        clubId: response.club_id,
        status: 'Pending Higher Authority Approval',
        submittedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };
      setSubmittedClubRequest(newClubRequest);
    } catch (err) {
      setError(err.message || 'Club registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If a club registration request was submitted, display the pending authority confirmation screen
  if (submittedClubRequest) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 text-white text-center relative overflow-hidden">
            <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white">
              <Clock className="w-9 h-9 text-amber-300 animate-pulse" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-200 border border-amber-300/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" /> Institutional Review In Progress
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Club Registration Request Lodged!
            </h2>
            <p className="text-blue-100 text-sm mt-2 max-w-lg mx-auto">
              Your request to establish <span className="font-semibold text-white">"{submittedClubRequest.clubName}"</span> has been submitted to the Higher Authority Board for verification.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Request Details Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-200">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Application Reference No.
                  </span>
                  <span className="text-sm font-mono font-bold text-gray-800">
                    {submittedClubRequest.referenceId}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Awaiting HOD / DSW Clearance
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Proposed Club:</span>{' '}
                  <span className="font-bold text-gray-800">{submittedClubRequest.clubName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Category:</span>{' '}
                  <span className="font-semibold text-gray-800">{submittedClubRequest.category}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Department:</span>{' '}
                  <span className="font-semibold text-gray-800">{submittedClubRequest.department}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">HOD Endorsement:</span>{' '}
                  <span className="font-semibold text-gray-800">{submittedClubRequest.hod}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Faculty Advisor:</span>{' '}
                  <span className="font-semibold text-gray-800">{submittedClubRequest.facultyAdvisor || submittedClubRequest.coordinatorTeacher}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Coordinator Contact:</span>{' '}
                  <span className="font-semibold text-gray-800">{submittedClubRequest.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 font-medium">Official Email:</span>{' '}
                  <span className="font-semibold text-gray-800">{submittedClubRequest.email}</span>
                </div>
              </div>
            </div>

            {/* Verification Workflow Stepper */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Higher Authority Approval Process
              </h3>
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Step 1: Application Lodged Online</div>
                    <div className="text-[11px] text-gray-500">Proposal details, faculty coordinator, and HOD details registered in college queue.</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Clock className="w-4 h-4 animate-spin text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Step 2: Department HOD & Dean of Student Welfare (DSW) Review</div>
                    <div className="text-[11px] text-gray-500">
                      The Head of Department and Dean verify the club constitution, faculty sponsorship, and ensure no conflicting duplicate societies exist.
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400">Step 3: Portal Credentials Activation & Official Charter</div>
                    <div className="text-[11px] text-gray-400">
                      Once formally endorsed by the college administration, activation credentials will be dispatched to the coordinator's email and phone to open dashboard management.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Verification Card */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Security & Governance Safeguard</span>
                <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                  Direct self-creation of clubs is restricted so that random students cannot arbitrarily register organizations on the official college portal.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/" className="w-full">
                  <Button variant="outline" className="w-full gap-2 text-xs font-semibold">
                    Return to Home
                  </Button>
                </Link>
                <Link to="/login" className="w-full">
                  <Button className="w-full gap-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700">
                    Sign In to Existing Account
                  </Button>
                </Link>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => setSubmittedClubRequest(null)}
                  className="text-gray-500 hover:text-gray-700 underline text-xs cursor-pointer"
                >
                  ← Submit another proposal
                </button>
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs cursor-pointer"
                >
                  Sign In with Coordinator Account →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl border-gray-200 shadow-xl overflow-hidden">
        {/* Top Header */}
        <CardHeader className="text-center pt-8 pb-4 border-b-0 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md mb-3 text-white">
            {role === 'student' ? (
              <GraduationCap className="w-8 h-8" />
            ) : (
              <Building2 className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Join UniSphere
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Choose your account type to register for the college club portal
          </p>

          {/* Role Switcher Pill Tabs */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl mt-6 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => { setRole('student'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
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
              onClick={() => { setRole('club'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                role === 'club'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Register Your Club
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* ======================================================== */}
          {/* GENERAL STUDENT REGISTRATION FORM                        */}
          {/* ======================================================== */}
          {role === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-5">
              {/* Header with Demo Quick Fill Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Academic Information
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-400 font-medium mr-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo:
                  </span>
                  {['B.Tech', 'BBA', 'MBA', 'BCA'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleQuickFillStudent(c)}
                      className={`px-2 py-0.5 rounded-md font-semibold text-xs transition-all border ${
                        studentData.course === c
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Full Name */}
              <Input 
                label="Student Full Name" 
                placeholder="e.g. Vikram Singh" 
                value={studentData.name}
                onChange={e => setStudentData({ ...studentData, name: e.target.value })}
                required 
              />

              {/* Email & Phone Number (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="College Email Address" 
                  type="email" 
                  placeholder="e.g. vikram.cs24@college.edu" 
                  value={studentData.email}
                  onChange={e => setStudentData({ ...studentData, email: e.target.value })}
                  required 
                />
                <Input 
                  label="Phone Number" 
                  type="tel" 
                  placeholder="e.g. +91 98765 43210" 
                  value={studentData.phone}
                  onChange={e => setStudentData({ ...studentData, phone: e.target.value })}
                  required 
                />
              </div>

              {/* Class Roll No & Univ Roll No (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Class Roll No." 
                  placeholder="e.g. CS-24 or 42" 
                  value={studentData.classRollNo}
                  onChange={e => setStudentData({ ...studentData, classRollNo: e.target.value })}
                  required 
                />
                <Input 
                  label="University Roll No." 
                  placeholder="e.g. 2401020088" 
                  value={studentData.universityRollNo}
                  onChange={e => setStudentData({ ...studentData, universityRollNo: e.target.value })}
                  required 
                />
              </div>

              {/* Course & Semester (Balanced 2-Column Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Course Select */}
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Course / Degree</label>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {currentCourseConfig.duration}
                    </span>
                  </div>
                  <div className="relative">
                    <select 
                      value={studentData.course}
                      onChange={e => handleCourseChange(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    >
                      {Object.keys(COURSE_CONFIGS).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Semester Select */}
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Current Semester</label>
                    <span className="text-[11px] text-gray-400">
                      {currentCourseConfig.semesters.length} Semesters Total
                    </span>
                  </div>
                  <div className="relative">
                    <select 
                      value={studentData.sem}
                      onChange={e => setStudentData({ ...studentData, sem: e.target.value })}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    >
                      {currentCourseConfig.semesters.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Conditional Branch / Specialization (Full Width Row when applicable) */}
              {currentCourseConfig.hasBranch && (
                <div className="w-full animate-in fade-in duration-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {currentCourseConfig.branchLabel || 'Branch / Department'}
                    </label>
                    <span className="text-[11px] text-gray-500">
                      {currentCourseConfig.branches.length} Options Available
                    </span>
                  </div>
                  <div className="relative">
                    <select 
                      value={studentData.branch}
                      onChange={e => setStudentData({ ...studentData, branch: e.target.value })}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                      required
                    >
                      {currentCourseConfig.branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Password & Confirm Password with Strength Indicator */}
              <PasswordFields
                password={studentData.password}
                confirmPassword={studentData.confirmPassword}
                onChangePassword={val => {
                  setError('');
                  setStudentData({ ...studentData, password: val });
                }}
                onChangeConfirmPassword={val => {
                  setError('');
                  setStudentData({ ...studentData, confirmPassword: val });
                }}
                passwordLabel="Create Password"
                confirmLabel="Confirm Password"
              />

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-sm font-bold shadow-md gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Registering Account...
                    </>
                  ) : (
                    <>
                      Complete Student Registration ({studentData.course}) <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* ======================================================== */
            /* REGISTER YOUR CLUB FORM                                 */
            /* ======================================================== */
            <form onSubmit={handleClubSubmit} className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Club Registration & Leadership</span>
                <button
                  type="button"
                  onClick={handleQuickFillClub}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-fill Sample Club
                </button>
              </div>

              {/* Higher Authority Governance Notice */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Institutional Clearance Required:</span>
                  <p className="text-amber-800 mt-0.5 text-[11px] leading-relaxed">
                    To maintain college accreditation and prevent unauthorized campus groups, all club registrations are routed to the <strong>Head of Department (HOD)</strong> and <strong>Dean of Student Welfare (DSW)</strong> for verification before portal access is activated.
                  </p>
                </div>
              </div>

              {/* Club Name */}
              <Input 
                label="Club Name" 
                placeholder="e.g. Byte Warriors / Robotics Society" 
                value={clubData.clubName}
                onChange={e => setClubData({ ...clubData, clubName: e.target.value })}
                required 
              />

              {/* Department & Category (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <div className="relative">
                    <select 
                      value={clubData.department}
                      onChange={e => setClubData({ ...clubData, department: e.target.value })}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    >
                      <option>Computer Science & Engineering</option>
                      <option>Information Technology</option>
                      <option>Electronics & Communication</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Student Affairs & Cultural</option>
                      <option>Management Studies</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="relative">
                    <select 
                      value={clubData.category}
                      onChange={e => setClubData({ ...clubData, category: e.target.value })}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    >
                      <option>Technical & Coding</option>
                      <option>Robotics & Hardware</option>
                      <option>Cultural & Fine Arts</option>
                      <option>Literary & Debating</option>
                      <option>Entrepreneurship & E-Cell</option>
                      <option>Sports & Fitness</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* HOD & Faculty Advisor (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Head of Department (HOD)" 
                  placeholder="e.g. Dr. R. K. Singhal" 
                  value={clubData.hod}
                  onChange={e => setClubData({ ...clubData, hod: e.target.value })}
                  required 
                />
                <Input 
                  label="Faculty Advisor" 
                  placeholder="e.g. Dr. Sharma / Dr. Neha Verma" 
                  value={clubData.coordinatorTeacher}
                  onChange={e => setClubData({ ...clubData, coordinatorTeacher: e.target.value })}
                  required 
                />
              </div>

              {/* Email & Phone (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Club / Coordinator Email" 
                  type="email" 
                  placeholder="e.g. club.cse@college.edu" 
                  value={clubData.email}
                  onChange={e => setClubData({ ...clubData, email: e.target.value })}
                  required 
                />
                <Input 
                  label="Coordinator Phone Number" 
                  type="tel" 
                  placeholder="e.g. +91 98101 23456" 
                  value={clubData.phone}
                  onChange={e => setClubData({ ...clubData, phone: e.target.value })}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Objective / Description</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm" 
                  rows="3" 
                  placeholder="Briefly state the mission of the club, intended activities, and benefits for students..."
                  value={clubData.description}
                  onChange={e => setClubData({ ...clubData, description: e.target.value })}
                ></textarea>
              </div>

              {/* Password & Confirm Password with Strength Indicator */}
              <PasswordFields
                password={clubData.password}
                confirmPassword={clubData.confirmPassword}
                onChangePassword={val => {
                  setError('');
                  setClubData({ ...clubData, password: val });
                }}
                onChangeConfirmPassword={val => {
                  setError('');
                  setClubData({ ...clubData, confirmPassword: val });
                }}
                passwordLabel="Create Portal Password"
                confirmLabel="Confirm Portal Password"
              />

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-sm font-bold shadow-md gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Registration...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Club Registration for Authority Approval
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Bottom link to login */}
          <div className="pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
