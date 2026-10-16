import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // Track registered events across prototype
  const [registeredEventIds, setRegisteredEventIds] = useState(() => {
    const saved = localStorage.getItem('mockUserRegisteredEvents');
    return saved ? JSON.parse(saved) : ['e1', 'e2'];
  });

  // Track joined clubs across prototype
  const [joinedClubIds, setJoinedClubIds] = useState(() => {
    const saved = localStorage.getItem('mockUserJoinedClubs');
    return saved ? JSON.parse(saved) : ['c1'];
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (roleType) => {
    const selectedUser = mockUsers[roleType] || mockUsers['general_student'];
    setUser(selectedUser);
    localStorage.setItem('mockUser', JSON.stringify(selectedUser));
  };

  const signup = (userData) => {
    setUser(userData);
    localStorage.setItem('mockUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  const registerForEvent = (eventId) => {
    setRegisteredEventIds(prev => {
      const next = prev.includes(eventId) ? prev : [...prev, eventId];
      localStorage.setItem('mockUserRegisteredEvents', JSON.stringify(next));
      return next;
    });
  };

  const unregisterFromEvent = (eventId) => {
    setRegisteredEventIds(prev => {
      const next = prev.filter(id => id !== eventId);
      localStorage.setItem('mockUserRegisteredEvents', JSON.stringify(next));
      return next;
    });
  };

  const isRegistered = (eventId) => registeredEventIds.includes(eventId);

  const toggleJoinClub = (clubId) => {
    setJoinedClubIds(prev => {
      const next = prev.includes(clubId) ? prev.filter(id => id !== clubId) : [...prev, clubId];
      localStorage.setItem('mockUserJoinedClubs', JSON.stringify(next));
      return next;
    });
  };

  const isClubJoined = (clubId) => joinedClubIds.includes(clubId);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup,
      logout,
      registeredEventIds,
      registerForEvent,
      unregisterFromEvent,
      isRegistered,
      joinedClubIds,
      toggleJoinClub,
      isClubJoined
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
