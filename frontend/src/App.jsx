import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ExploreClubs } from './pages/public/ExploreClubs';
import { ClubProfile } from './pages/public/ClubProfile';
import { EventDiscovery } from './pages/public/EventDiscovery';
import { EventDetails } from './pages/public/EventDetails';
import { Login } from './pages/public/Login';
import { Signup } from './pages/public/Signup';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyRegistrations } from './pages/student/MyRegistrations';
import { StudentProfile } from './pages/student/StudentProfile';

// Unified Club Coordinator Pages
import { ClubDashboard } from './pages/club/ClubDashboard';
import { ManageClub } from './pages/club/ManageClub';
import { ManageEvents } from './pages/club/ManageEvents';
import { CreateEvent } from './pages/club/CreateEvent';
import { ManageMembers } from './pages/club/ManageMembers';
import { Tasks } from './pages/club/Tasks';
import { Announcements } from './pages/club/Announcements';
import { Analytics } from './pages/club/Analytics';

// Separate Protected Admin Governance Console
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            fontSize: '13px',
            fontWeight: '600',
            padding: '12px 16px',
            zIndex: 99999,
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExploreClubs />} />
            <Route path="/explore/:id" element={<ClubProfile />} />
            <Route path="/events" element={<EventDiscovery />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected Routes (Using DashboardLayout) */}
          <Route element={<DashboardLayout />}>
            {/* General Student */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/registrations" element={<MyRegistrations />} />
            <Route path="/student/explore" element={<ExploreClubs />} />
            <Route path="/student/explore/:id" element={<ClubProfile />} />
            <Route path="/student/events" element={<EventDiscovery />} />
            <Route path="/student/events/:id" element={<EventDetails />} />
            
            {/* Unified Club Coordinator Dashboard */}
            <Route path="/club-dashboard" element={<ClubDashboard />} />
            <Route path="/club-dashboard/club" element={<ManageClub />} />
            <Route path="/club-dashboard/events" element={<ManageEvents />} />
            <Route path="/club-dashboard/events/create" element={<CreateEvent />} />
            <Route path="/club-dashboard/members" element={<ManageMembers />} />
            <Route path="/club-dashboard/tasks" element={<Tasks />} />
            <Route path="/club-dashboard/announcements" element={<Announcements />} />
            <Route path="/club-dashboard/analytics" element={<Analytics />} />

            {/* Legacy Role Redirects to Unified Dashboard */}
            <Route path="/teacher" element={<Navigate to="/club-dashboard" replace />} />
            <Route path="/teacher/events/create" element={<Navigate to="/club-dashboard/events/create" replace />} />
            <Route path="/teacher/*" element={<Navigate to="/club-dashboard" replace />} />
            <Route path="/club-student" element={<Navigate to="/club-dashboard" replace />} />
            <Route path="/club-student/*" element={<Navigate to="/club-dashboard" replace />} />
          </Route>

          {/* Completely Separate Protected Admin Governance Console */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
