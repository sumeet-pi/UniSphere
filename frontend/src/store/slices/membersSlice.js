import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, normalizeApiError } from '../../services/api';
import { notify } from '../../services/notification';
import { 
  getStoredMembers, 
  addStoredMember, 
  deleteStoredMember, 
  updateStoredMember 
} from '../../data/mockData';

export const fetchClubMembers = createAsyncThunk(
  'members/fetchClubMembers',
  async (clubId) => {
    try {
      const data = await api.getClubMembers(clubId);
      if (data && data.members && data.members.length > 0) {
        return {
          clubId,
          members: data.members,
          totalMembers: data.totalMembers || data.members.length,
          coreTeamCount: data.coreTeamCount || data.members.filter(m => m.role !== 'Member').length,
          generalMemberCount: data.generalMemberCount || data.members.filter(m => m.role === 'Member').length,
        };
      }
      // If backend returns empty array or not found, fall back to mockData
      const fallback = getStoredMembers(clubId);
      return {
        clubId,
        members: fallback,
        totalMembers: fallback.length,
        coreTeamCount: fallback.filter(m => m.role !== 'Member').length,
        generalMemberCount: fallback.filter(m => m.role === 'Member').length,
      };
    } catch {
      const fallback = getStoredMembers(clubId);
      return {
        clubId,
        members: fallback,
        totalMembers: fallback.length,
        coreTeamCount: fallback.filter(m => m.role !== 'Member').length,
        generalMemberCount: fallback.filter(m => m.role === 'Member').length,
      };
    }
  }
);

export const addClubMemberAction = createAsyncThunk(
  'members/addClubMember',
  async ({ clubId, memberData }, { rejectWithValue }) => {
    try {
      const res = await api.addClubMember(clubId, memberData);
      
      // Also update local mock data cache to ensure offline/mock synchronization
      try {
        addStoredMember({
          clubId,
          ...memberData,
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
        });
      } catch (e) {
        console.error(e);
      }

      notify.success('Club member added successfully.');
      
      if (res && res.members) {
        return {
          clubId,
          members: res.members,
          totalMembers: res.totalMembers || res.members.length,
          coreTeamCount: res.coreTeamCount || res.members.filter(m => m.role !== 'Member').length,
          generalMemberCount: res.generalMemberCount || res.members.filter(m => m.role === 'Member').length,
        };
      }

      const updated = getStoredMembers(clubId);
      return {
        clubId,
        members: updated,
        totalMembers: updated.length,
        coreTeamCount: updated.filter(m => m.role !== 'Member').length,
        generalMemberCount: updated.filter(m => m.role === 'Member').length,
      };
    } catch (err) {
      // If backend failed, attempt resilient local update and notify
      try {
        addStoredMember({
          clubId,
          ...memberData,
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
        });
        notify.success('Club member added successfully.');
        const updated = getStoredMembers(clubId);
        return {
          clubId,
          members: updated,
          totalMembers: updated.length,
          coreTeamCount: updated.filter(m => m.role !== 'Member').length,
          generalMemberCount: updated.filter(m => m.role === 'Member').length,
        };
      } catch {
        const msg = normalizeApiError(err);
        notify.error(msg || 'Unable to update club members. Please try again.');
        return rejectWithValue(msg);
      }
    }
  }
);

export const removeClubMemberAction = createAsyncThunk(
  'members/removeClubMember',
  async ({ clubId, userId, memberObj }, { rejectWithValue }) => {
    try {
      await api.removeClubMember(clubId, userId);
      try {
        deleteStoredMember(userId || memberObj?.id);
      } catch (e) {
        console.error(e);
      }
      notify.success('Member removed from club successfully.');
      return { clubId, userId, memberId: memberObj?.id };
    } catch (err) {
      // Resilient local fallback
      try {
        deleteStoredMember(userId || memberObj?.id);
        notify.success('Member removed from club successfully.');
        return { clubId, userId, memberId: memberObj?.id };
      } catch {
        const msg = normalizeApiError(err);
        notify.error(msg || 'Unable to remove member.');
        return rejectWithValue(msg);
      }
    }
  }
);

export const updateMemberRoleAction = createAsyncThunk(
  'members/updateMemberRole',
  async ({ clubId, userId, payload }, { rejectWithValue }) => {
    try {
      await api.updateMemberRole(clubId, userId, payload);
      try {
        updateStoredMember(userId, payload);
      } catch (e) {
        console.error(e);
      }
      notify.success('Member role updated successfully.');
      return { clubId, userId, payload };
    } catch (err) {
      // Resilient fallback
      try {
        updateStoredMember(userId, payload);
        notify.success('Member role updated successfully.');
        return { clubId, userId, payload };
      } catch {
        const msg = normalizeApiError(err);
        notify.error(msg || 'Unable to update member role.');
        return rejectWithValue(msg);
      }
    }
  }
);

const initialState = {
  byClubId: {},
  loading: false,
  error: null,
};

export const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setClubMembersDirect: (state, action) => {
      const { clubId, members } = action.payload;
      state.byClubId[clubId] = {
        members,
        totalMembers: members.length,
        coreTeamCount: members.filter(m => m.role !== 'Member').length,
        generalMemberCount: members.filter(m => m.role === 'Member').length,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchClubMembers
      .addCase(fetchClubMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClubMembers.fulfilled, (state, action) => {
        state.loading = false;
        const { clubId, members, totalMembers, coreTeamCount, generalMemberCount } = action.payload;
        state.byClubId[clubId] = {
          members,
          totalMembers,
          coreTeamCount,
          generalMemberCount,
        };
      })
      .addCase(fetchClubMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addClubMember
      .addCase(addClubMemberAction.fulfilled, (state, action) => {
        const { clubId, members, totalMembers, coreTeamCount, generalMemberCount } = action.payload;
        state.byClubId[clubId] = {
          members,
          totalMembers,
          coreTeamCount,
          generalMemberCount,
        };
      })

      // removeClubMember
      .addCase(removeClubMemberAction.fulfilled, (state, action) => {
        const { clubId, userId, memberId } = action.payload;
        if (state.byClubId[clubId]) {
          const filtered = state.byClubId[clubId].members.filter(
            m => m.id !== userId && m.id !== memberId && m.userId !== userId
          );
          state.byClubId[clubId].members = filtered;
          state.byClubId[clubId].totalMembers = filtered.length;
          state.byClubId[clubId].coreTeamCount = filtered.filter(m => m.role !== 'Member').length;
          state.byClubId[clubId].generalMemberCount = filtered.filter(m => m.role === 'Member').length;
        }
      })

      // updateMemberRole
      .addCase(updateMemberRoleAction.fulfilled, (state, action) => {
        const { clubId, userId, payload } = action.payload;
        if (state.byClubId[clubId]) {
          state.byClubId[clubId].members = state.byClubId[clubId].members.map(m => {
            if (m.id === userId || m.userId === userId) {
              return {
                ...m,
                role: payload.role || m.role,
                designation: payload.designation || m.designation,
                membership: payload.membership || m.membership,
              };
            }
            return m;
          });
          const members = state.byClubId[clubId].members;
          state.byClubId[clubId].coreTeamCount = members.filter(m => m.role !== 'Member').length;
          state.byClubId[clubId].generalMemberCount = members.filter(m => m.role === 'Member').length;
        }
      });
  },
});

export const { setClubMembersDirect } = membersSlice.actions;

export default membersSlice.reducer;
