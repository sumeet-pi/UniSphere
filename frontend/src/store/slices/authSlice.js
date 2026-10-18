import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, normalizeApiError } from '../../services/api';
import { normalizeRole } from '../../services/roles';
import { notify } from '../../services/notification';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('unisphere_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  return localStorage.getItem('unisphere_token') || null;
};

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const token = getStoredToken();
    if (!token) {
      return { user: null, token: null };
    }

    try {
      const userData = await api.getMe({ isRestoring: true, showToast: false });
      const canonicalRole = normalizeRole(userData.role);
      const normalizedUser = {
        ...userData,
        role: canonicalRole || userData.role,
      };
      localStorage.setItem('unisphere_user', JSON.stringify(normalizedUser));
      return { user: normalizedUser, token };
    } catch (err) {
      // If 401, session is definitively revoked/expired
      if (err.status === 401) {
        localStorage.removeItem('unisphere_token');
        localStorage.removeItem('unisphere_user');
        return rejectWithValue({ message: 'Session expired', status: 401 });
      }

      // If temporary network failure or server timeout, preserve stored user if available
      const cachedUser = getStoredUser();
      if (cachedUser) {
        return { user: cachedUser, token, isOffline: true };
      }

      return rejectWithValue({ message: normalizeApiError(err), status: err.status || 0 });
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.login(credentials);
      if (!res || !res.access_token || !res.user) {
        throw new Error('Invalid response structure received from authentication server.');
      }
      const canonicalRole = normalizeRole(res.user.role);
      const normalizedUser = {
        ...res.user,
        role: canonicalRole || res.user.role,
      };

      localStorage.setItem('unisphere_token', res.access_token);
      localStorage.setItem('unisphere_user', JSON.stringify(normalizedUser));
      notify.success(`Welcome back, ${normalizedUser.name}!`);
      return { user: normalizedUser, token: res.access_token };
    } catch (err) {
      const msg = normalizeApiError(err);
      notify.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (signupData, { rejectWithValue }) => {
    try {
      const res = await api.registerStudent(signupData);
      if (!res || !res.access_token || !res.user) {
        throw new Error('Invalid response structure received from registration server.');
      }
      const canonicalRole = normalizeRole(res.user.role);
      const normalizedUser = {
        ...res.user,
        role: canonicalRole || res.user.role,
      };

      localStorage.setItem('unisphere_token', res.access_token);
      localStorage.setItem('unisphere_user', JSON.stringify(normalizedUser));
      notify.success(`Account created successfully. Welcome, ${normalizedUser.name}!`);
      return { user: normalizedUser, token: res.access_token };
    } catch (err) {
      const msg = normalizeApiError(err);
      notify.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const registerCoordinatorAccount = createAsyncThunk(
  'auth/registerCoordinator',
  async (coordinatorData, { rejectWithValue }) => {
    try {
      const res = await api.registerCoordinator(coordinatorData);
      notify.success('Coordinator application submitted for administrative review.');
      return res;
    } catch (err) {
      const msg = normalizeApiError(err);
      notify.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: true, // true until restoreSession completes
  error: null,
  registeredEventIds: (() => {
    try {
      const saved = localStorage.getItem('mockUserRegisteredEvents');
      return saved ? JSON.parse(saved) : ['e1', 'e2'];
    } catch {
      return ['e1', 'e2'];
    }
  })(),
  joinedClubIds: (() => {
    try {
      const saved = localStorage.getItem('mockUserJoinedClubs');
      return saved ? JSON.parse(saved) : ['c1'];
    } catch {
      return ['c1'];
    }
  })(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('unisphere_token');
      localStorage.removeItem('unisphere_user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      notify.info('You have been signed out.');
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
        localStorage.setItem('unisphere_user', JSON.stringify(state.user));
      }
    },
    toggleRegisteredEvent: (state, action) => {
      const eventId = action.payload;
      if (state.registeredEventIds.includes(eventId)) {
        state.registeredEventIds = state.registeredEventIds.filter(id => id !== eventId);
      } else {
        state.registeredEventIds.push(eventId);
      }
      localStorage.setItem('mockUserRegisteredEvents', JSON.stringify(state.registeredEventIds));
    },
    toggleJoinedClub: (state, action) => {
      const clubId = action.payload;
      if (state.joinedClubIds.includes(clubId)) {
        state.joinedClubIds = state.joinedClubIds.filter(id => id !== clubId);
      } else {
        state.joinedClubIds.push(clubId);
      }
      localStorage.setItem('mockUserJoinedClubs', JSON.stringify(state.joinedClubIds));
    },
    setRegisteredEventIds: (state, action) => {
      state.registeredEventIds = action.payload;
      localStorage.setItem('mockUserRegisteredEvents', JSON.stringify(action.payload));
    },
    setJoinedClubIds: (state, action) => {
      state.joinedClubIds = action.payload;
      localStorage.setItem('mockUserJoinedClubs', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // restoreSession
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.user;
        state.error = null;
        if (action.payload.user?.registeredEventIds) {
          state.registeredEventIds = action.payload.user.registeredEventIds;
        }
        if (action.payload.user?.joinedClubIds) {
          state.joinedClubIds = action.payload.user.joinedClubIds;
        }
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.status === 401) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
        state.error = action.payload?.message || 'Session verification failed';
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        if (action.payload.user?.registeredEventIds) {
          state.registeredEventIds = action.payload.user.registeredEventIds;
        }
        if (action.payload.user?.joinedClubIds) {
          state.joinedClubIds = action.payload.user.joinedClubIds;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // signupUser
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  logout, 
  updateUser, 
  toggleRegisteredEvent, 
  toggleJoinedClub, 
  setRegisteredEventIds, 
  setJoinedClubIds 
} = authSlice.actions;

export default authSlice.reducer;
