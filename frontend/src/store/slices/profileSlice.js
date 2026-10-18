import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, normalizeApiError } from '../../services/api';
import { updateUser } from './authSlice';
import { notify } from '../../services/notification';
import { getStoredStudentProfile } from '../../data/mockData';

export const fetchStudentProfile = createAsyncThunk(
  'profile/fetchStudentProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getStudentProfile();
      return data;
    } catch (err) {
      // Fallback gracefully to stored mock profile if backend profile not created yet
      const fallback = getStoredStudentProfile();
      if (fallback) return fallback;
      return rejectWithValue(normalizeApiError(err));
    }
  }
);

export const updateStudentProfile = createAsyncThunk(
  'profile/updateStudentProfile',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      const data = await api.updateStudentProfile(profileData);
      
      // Immediately synchronize canonical auth user identity for sidebars, headers, dashboards
      dispatch(updateUser({
        name: data.name || profileData.name,
        phone: data.phone || profileData.phone,
        avatar: data.avatar || profileData.avatar,
        avatarUrl: data.avatar || profileData.avatar,
        department: data.department || profileData.department,
      }));

      // Cache locally for instant preview
      try {
        localStorage.setItem('mockStudentProfile', JSON.stringify(data));
      } catch (e) {
        console.error(e);
      }

      notify.success('Profile updated successfully.');
      return data;
    } catch (err) {
      const msg = normalizeApiError(err);
      notify.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const fetchStudentIdCard = createAsyncThunk(
  'profile/fetchStudentIdCard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getStudentIdCard();
      return data;
    } catch (err) {
      return rejectWithValue(normalizeApiError(err));
    }
  }
);

const initialState = {
  data: (() => {
    try {
      const saved = localStorage.getItem('mockStudentProfile');
      return saved ? JSON.parse(saved) : getStoredStudentProfile();
    } catch {
      return getStoredStudentProfile();
    }
  })(),
  idCard: null,
  loading: false,
  saving: false,
  error: null,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStudentProfile
      .addCase(fetchStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateStudentProfile
      .addCase(updateStudentProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // fetchStudentIdCard
      .addCase(fetchStudentIdCard.fulfilled, (state, action) => {
        state.idCard = action.payload;
      });
  },
});

export const { setProfileData } = profileSlice.actions;

export default profileSlice.reducer;
