import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';

const rewardsAdapter = createEntityAdapter();

export const fetchRewards = createAsyncThunk('rewards/fetchRewards', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('http://localhost:3001/rewards');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createReward = createAsyncThunk('rewards/createReward', async (rewardData, { rejectWithValue }) => {
  try {
    const response = await fetch('http://localhost:3001/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rewardData),
    });
    return response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateReward = createAsyncThunk('rewards/updateReward', async ({ id, ...rewardData }, { rejectWithValue }) => {
  try {
    const response = await fetch(`http://localhost:3001/rewards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rewardData),
    });
    return response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteReward = createAsyncThunk('rewards/deleteReward', async (rewardId, { rejectWithValue }) => {
  try {
    const response = await fetch(`http://localhost:3001/rewards/${rewardId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return rewardId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const redeemReward = createAsyncThunk('rewards/redeemReward', async ({ rewardId, userId }, { rejectWithValue }) => {
  try {
    const response = await fetch(`http://localhost:3001/rewards/${rewardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redeemedBy: userId }),
    });
    return response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState: rewardsAdapter.getInitialState({ loading: false, error: null }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => { state.loading = true; })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        rewardsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch rewards';
      })
      .addCase(createReward.fulfilled, (state, action) => {
        rewardsAdapter.addOne(state, action.payload);
      })
      .addCase(updateReward.fulfilled, (state, action) => {
        rewardsAdapter.upsertOne(state, action.payload);
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        rewardsAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteReward.fulfilled, (state, action) => {
        rewardsAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteReward.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete reward';
      });
  },
});

export const { selectAll: selectAllRewards } = rewardsAdapter.getSelectors(
  (state) => state.rewards
);

export default rewardsSlice.reducer;