import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, normalizeApiError } from '../../services/api';
import { updateUser, toggleJoinedClub } from './authSlice';
import { notify } from '../../services/notification';
import { clubs as fallbackClubs } from '../../data/mockData';

export const fetchClubs = createAsyncThunk(
  'clubs/fetchClubs',
  async (params) => {
    try {
      const data = await api.getClubs(params);
      return data || fallbackClubs;
    } catch {
      return fallbackClubs;
    }
  }
);

export const fetchClubById = createAsyncThunk(
  'clubs/fetchClubById',
  async (clubId) => {
    try {
      const data = await api.getClubById(clubId);
      return data;
    } catch {
      const fallback = fallbackClubs.find(c => c.id === clubId) || fallbackClubs[0];
      return fallback;
    }
  }
);

export const updateClubProfile = createAsyncThunk(
  'clubs/updateClubProfile',
  async ({ clubId, clubData }, { dispatch, rejectWithValue }) => {
    try {
      const data = await api.updateClub(clubId, clubData);
      
      // Update coordinator's user club spotlight if applicable
      dispatch(updateUser({
        clubName: data.name || clubData.name,
        department: data.department || clubData.department,
      }));

      // Cache locally for backward compatibility with mock views
      try {
        localStorage.setItem(`mockClubProfile_${clubId}`, JSON.stringify(data));
      } catch (e) {
        console.error(e);
      }

      notify.success('Club profile updated successfully.');
      return data;
    } catch (err) {
      const msg = normalizeApiError(err);
      notify.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const joinClubAction = createAsyncThunk(
  'clubs/joinClub',
  async (clubId, { dispatch, rejectWithValue }) => {
    try {
      const data = await api.joinClub(clubId);
      dispatch(toggleJoinedClub(clubId));
      notify.success('Enrolled in club successfully!');
      return { clubId, data };
    } catch (err) {
      const msg = normalizeApiError(err);
      notify.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const leaveClubAction = createAsyncThunk(
  'clubs/leaveClub',
  async (clubId, { dispatch, rejectWithValue }) => {
    try {
      await api.leaveClub(clubId);
      dispatch(toggleJoinedClub(clubId));
      notify.info('You have left the club.');
      return { clubId };
    } catch (err) {
      const msg = normalizeApiError(err);
      notify.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  catalog: fallbackClubs,
  currentClub: null,
  loading: false,
  saving: false,
  error: null,
};

export const clubsSlice = createSlice({
  name: 'clubs',
  initialState,
  reducers: {
    setCurrentClub: (state, action) => {
      state.currentClub = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchClubs
      .addCase(fetchClubs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClubs.fulfilled, (state, action) => {
        state.loading = false;
        state.catalog = action.payload;
      })
      .addCase(fetchClubs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchClubById
      .addCase(fetchClubById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClubById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClub = action.payload;
      })
      .addCase(fetchClubById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateClubProfile
      .addCase(updateClubProfile.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateClubProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.currentClub = action.payload;
        // Also update catalog item
        const idx = state.catalog.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) {
          state.catalog[idx] = { ...state.catalog[idx], ...action.payload };
        }
      })
      .addCase(updateClubProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentClub } = clubsSlice.actions;

export default clubsSlice.reducer;
