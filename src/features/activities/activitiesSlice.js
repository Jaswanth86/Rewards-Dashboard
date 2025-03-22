import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';

const activitiesAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.timestamp - a.timestamp,
});

export const fetchActivities = createAsyncThunk('activities/fetchActivities', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('http://localhost:3001/activities');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const logActivity = createAsyncThunk('activities/logActivity', async ({ userId, type, points, adminId }) => {
  const newActivity = { userId, type, points, timestamp: Date.now(), adminId };
  const response = await fetch('http://localhost:3001/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newActivity),
  });
  return response.json();
});

export const updateActivity = createAsyncThunk('activities/updateActivity', async ({ id, ...activityData }, { rejectWithValue }) => {
  try {
    const response = await fetch(`http://localhost:3001/activities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    });
    return response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteActivity = createAsyncThunk('activities/deleteActivity', async (activityId, { rejectWithValue }) => {
  try {
    const response = await fetch(`http://localhost:3001/activities/${activityId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return activityId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const activitiesSlice = createSlice({
  name: 'activities',
  initialState: activitiesAdapter.getInitialState({ loading: false, error: null }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => { state.loading = true; })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        activitiesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch activities';
      })
      .addCase(logActivity.fulfilled, (state, action) => {
        activitiesAdapter.addOne(state, action.payload);
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        activitiesAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        activitiesAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete activity';
      });
  },
});

export const { selectAll: selectAllActivities } = activitiesAdapter.getSelectors(
  (state) => state.activities
);

export default activitiesSlice.reducer;