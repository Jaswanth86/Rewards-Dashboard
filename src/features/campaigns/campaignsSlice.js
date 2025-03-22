import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';

const campaignsAdapter = createEntityAdapter();

export const fetchCampaigns = createAsyncThunk('campaigns/fetchCampaigns', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('http://localhost:3001/campaigns');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createCampaign = createAsyncThunk('campaigns/createCampaign', async (campaign, { rejectWithValue }) => {
  try {
    const response = await fetch('http://localhost:3001/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    });
    return response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateCampaign = createAsyncThunk('campaigns/updateCampaign', async ({ id, ...campaignData }, { rejectWithValue }) => {
  try {
    const response = await fetch(`http://localhost:3001/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    });
    return response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteCampaign = createAsyncThunk('campaigns/deleteCampaign', async (campaignId, { rejectWithValue }) => {
  try {
    const response = await fetch(`http://localhost:3001/campaigns/${campaignId}`, {
      method: 'DELETE',
    });
    return campaignId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState: campaignsAdapter.getInitialState({ loading: false, error: null }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => { state.loading = true; })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        campaignsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch campaigns';
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        campaignsAdapter.addOne(state, action.payload);
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        campaignsAdapter.upsertOne(state, action.payload);
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        campaignsAdapter.removeOne(state, action.payload);
      });
  },
});

export const { selectAll: selectAllCampaigns } = campaignsAdapter.getSelectors(
  (state) => state.campaigns
);

export default campaignsSlice.reducer;