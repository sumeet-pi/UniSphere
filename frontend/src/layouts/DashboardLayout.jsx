import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/Card';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  Compass,
  CheckSquare,
  Megaphone,
  BarChart3,
  User
} from 'lucide-react';
import { isCoordinatorRole, isStudentRole } from '../services/roles';

export function DashboardLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ensure unknown roles are not granted access
  if (!isCoordinatorRole(user.role) && !isStudentRole(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-bold text-lg">!</div>
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-sm text-gray-500">
            Your account role (<span className="font-semibold text-gray-800">{user.role || 'Unknown'}</span>) does not have access permissions for this portal.
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Sign Out & Return Home
          </button>
        </div>
      </div>
    );
  }

  // Route-level role guards to prevent cross-dashboard access
  const isStudent = isStudentRole(user.role);
  const isCoordinator = isCoordinatorRole(user.role);

  // If a student tries to access coordinator routes
  if (isStudent && location.pathname.startsWith('/club-dashboard')) {
    return <Navigate to="/student" replace />;
  }

  // If a coordinator tries to access student routes
  if (isCoordinator && location.pathname.startsWith('/student')) {
    return <Navigate to="/club-dashboard" replace />;
  }

  // Define links based on verified user role
  let links = [];

  if (isStudent) {
    links = [
      { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
      { name: 'My Profile', href: '/student/profile', icon: User },
      { name: 'Explore Clubs', href: '/student/explore', icon: Compass },
      { name: 'Events', href: '/student/events', icon: Calendar },
      { name: 'My Registrations', href: '/student/registrations', icon: CheckSquare },
    ];
  } else {
    // Unified Club Coordinator / Admin (faculty & student coordinators)
    links = [
      { name: 'Dashboard', href: '/club-dashboard', icon: LayoutDashboard },
      { name: 'My Club', href: '/club-dashboard/club', icon: Users },
      { name: 'Events', href: '/club-dashboard/events', icon: Calendar },
      { name: 'Members', href: '/club-dashboard/members', icon: Users },
      { name: 'Tasks', href: '/club-dashboard/tasks', icon: CheckSquare },
      { name: 'Announcements', href: '/club-dashboard/announcements', icon: Megaphone },
      { name: 'Analytics', href: '/club-dashboard/analytics', icon: BarChart3 },
    ];
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Pinned & Non-scrollable with page */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col h-full flex-shrink-0 select-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-blue-600 tracking-tight">
            <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs">U</span>
            UniSphere
          </Link>
          <button className="lg:hidden p-1 rounded-lg text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Club Spotlight Banner for Club Coordinators */}
        {isCoordinator && (
          <div className="px-5 py-2.5 bg-blue-50/60 border-b border-blue-100/70 flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {(user.clubName || 'Byte Warriors').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{user.clubName || 'Byte Warriors'}</p>
              <p className="text-[10px] text-blue-700 font-medium truncate">{user.department || 'CSE Department'}</p>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isExact = location.pathname === link.href;
            const isNested = (link.href !== '/student' && link.href !== '/club-dashboard') && location.pathname.startsWith(link.href);
            const isActive = isExact || isNested;
            
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm",
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-semibold" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-700" : "text-gray-500")} />
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* Sidebar Footer with User Details */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <Link 
            to={user.role === 'General Student' ? '/student/profile' : '/club-dashboard/club'} 
            className="flex items-center gap-3 mb-3 p-1.5 -mx-1.5 rounded-xl hover:bg-gray-100 transition-colors group cursor-pointer"
            title="View Profile"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.clubRole || user.role}</p>
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <button 
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Portal Online
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
