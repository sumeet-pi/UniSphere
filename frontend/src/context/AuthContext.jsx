import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  restoreSession, 
  loginUser, 
  signupUser, 
  registerCoordinatorAccount, 
  logout as logoutAction, 
  toggleRegisteredEvent, 
  toggleJoinedClub, 
  updateUser,
  updateUserProfile 
} from '../store/slices/authSlice';


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { 
    user, 
    token, 
    loading, 
    registeredEventIds, 
    joinedClubIds 
  } = useSelector((state) => state.auth);

  // Restore authenticated session on startup via Redux Toolkit thunk
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  const loginWithCredentials = async (email, password) => {
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      return resultAction.payload.user;
    }
    throw new Error(resultAction.payload || 'Invalid response from server.');
  };

  const signupWithCredentials = async (signupData) => {
    const resultAction = await dispatch(signupUser(signupData));
    if (signupUser.fulfilled.match(resultAction)) {
      return resultAction.payload.user;
    }
    throw new Error(resultAction.payload || 'Invalid response from server.');
  };

  const registerCoordinator = async (coordinatorData) => {
    const resultAction = await dispatch(registerCoordinatorAccount(coordinatorData));
    if (registerCoordinatorAccount.fulfilled.match(resultAction)) {
      return resultAction.payload;
    }
    throw new Error(resultAction.payload || 'Registration failed.');
  };

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const registerForEvent = (eventId) => {
    if (!registeredEventIds.includes(eventId)) {
      dispatch(toggleRegisteredEvent(eventId));
    }
  };

  const unregisterFromEvent = (eventId) => {
    if (registeredEventIds.includes(eventId)) {
      dispatch(toggleRegisteredEvent(eventId));
    }
  };

  const isRegistered = (eventId) => registeredEventIds.includes(eventId);

  const toggleJoinClub = (clubId) => {
    dispatch(toggleJoinedClub(clubId));
  };

  const isClubJoined = (clubId) => joinedClubIds.includes(clubId);

  const updateProfileUser = (updatedData) => {
    dispatch(updateUser(updatedData));
  };

  const updateProfile = async (updatedData) => {
    const resultAction = await dispatch(updateUserProfile(updatedData));
    if (updateUserProfile.fulfilled.match(resultAction)) {
      return resultAction.payload;
    }
    throw new Error(resultAction.payload || 'Failed to update profile.');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      loginWithCredentials, 
      signupWithCredentials, 
      registerCoordinator, 
      logout, 
      updateUser: updateProfileUser,
      updateProfile,
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
