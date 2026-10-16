import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function PublicLayout() {
  const { user, logout } = useAuth();
  const dashboardPath = user?.role === 'General Student' ? '/student' : '/club-dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-gray-900 tracking-tight">UniSphere</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/explore" className="text-gray-600 hover:text-blue-600 font-medium">Explore Clubs</Link>
              <Link to="/events" className="text-gray-600 hover:text-blue-600 font-medium">Events</Link>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to={dashboardPath}>
                    <Button variant="primary" size="sm" className="gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                    </Button>
                  </Link>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            &copy; 2026 UniSphere. The Official Campus Club Management & Engagement Platform.
          </div>
        </div>
      </footer>
    </div>
  );
}
