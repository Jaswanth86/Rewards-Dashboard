import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchUsers, createUser, updateUser, deleteUser, adjustPoints, selectAllUsers } from '../users/usersSlice';
import { fetchRewards, createReward, updateReward, deleteReward, selectAllRewards } from '../rewards/rewardsSlice';
import { fetchActivities, logActivity, updateActivity, deleteActivity, selectAllActivities } from '../activities/activitiesSlice';
import { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign, selectAllCampaigns } from '../campaigns/campaignsSlice';
import { useAuth } from '../../context/AuthContext';

// Validation schemas
const userSchema = yup.object({
  name: yup.string().required('Name is required'),
  points: yup.number().required('Points are required').min(0, 'Points must be non-negative'),
});

const rewardSchema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  cost: yup.number().required('Cost is required').positive('Cost must be positive'),
  image: yup.string().url('Must be a valid URL').required('Image URL is required'),
  campaignId: yup.number().required('Campaign ID is required').positive('Campaign ID must be positive'),
});

const activitySchema = yup.object({
  userId: yup.number().required('User ID is required').positive('User ID must be positive'),
  type: yup.string().required('Type is required').oneOf(['task', 'login', 'content', 'engagement'], 'Invalid type'),
  points: yup.number().required('Points are required').positive('Points must be positive'),
});

const pointsAdjustSchema = yup.object({
  userId: yup.number().required('User ID is required').positive('User ID must be positive'),
  points: yup.number().required('Points adjustment is required'),
  reason: yup.string().required('Reason is required'),
});

const campaignSchema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required')
    .test('is-after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent;
      return new Date(value) > new Date(startDate);
    }),
});

function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const users = useAppSelector(selectAllUsers);
  const rewards = useAppSelector(selectAllRewards);
  const activities = useAppSelector(selectAllActivities);
  const campaigns = useAppSelector(selectAllCampaigns);
  const { loading: usersLoading, error: usersError } = useAppSelector((state) => state.users);
  const { loading: rewardsLoading, error: rewardsError } = useAppSelector((state) => state.rewards);
  const { loading: activitiesLoading, error: activitiesError } = useAppSelector((state) => state.activities);
  const { loading: campaignsLoading, error: campaignsError } = useAppSelector((state) => state.campaigns);

  const [editingUser, setEditingUser] = useState(null);
  const [editingReward, setEditingReward] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const userForm = useForm({ resolver: yupResolver(userSchema) });
  const rewardForm = useForm({ resolver: yupResolver(rewardSchema) });
  const activityForm = useForm({ resolver: yupResolver(activitySchema) });
  const pointsAdjustForm = useForm({ resolver: yupResolver(pointsAdjustSchema) });
  const campaignForm = useForm({ resolver: yupResolver(campaignSchema) });

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRewards());
    dispatch(fetchActivities());
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const onUserSubmit = (data) => {
    if (editingUser) {
      dispatch(updateUser({ id: editingUser.id, ...data }));
      setEditingUser(null);
    } else {
      dispatch(createUser(data));
    }
    userForm.reset();
  };

  const onEditUser = (user) => {
    setEditingUser(user);
    userForm.reset(user);
  };

  const onDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId));
    }
  };

  const onRewardSubmit = (data) => {
    if (editingReward) {
      dispatch(updateReward({ id: editingReward.id, ...data }));
      setEditingReward(null);
    } else {
      dispatch(createReward(data));
    }
    rewardForm.reset();
  };

  const onEditReward = (reward) => {
    setEditingReward(reward);
    rewardForm.reset(reward);
  };

  const onDeleteReward = (rewardId) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      dispatch(deleteReward(rewardId));
    }
  };

  const onActivitySubmit = (data) => {
    if (editingActivity) {
      dispatch(updateActivity({ id: editingActivity.id, ...data }));
      setEditingActivity(null);
    } else {
      dispatch(logActivity(data));
    }
    activityForm.reset();
  };

  const onEditActivity = (activity) => {
    setEditingActivity(activity);
    activityForm.reset(activity);
  };

  const onDeleteActivity = (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      dispatch(deleteActivity(activityId));
    }
  };

  const onCampaignSubmit = (data) => {
    if (editingCampaign) {
      dispatch(updateCampaign({ id: editingCampaign.id, ...data }));
      setEditingCampaign(null);
    } else {
      dispatch(createCampaign(data));
    }
    campaignForm.reset();
  };

  const onEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    campaignForm.reset({
      ...campaign,
      startDate: new Date(campaign.startDate).toISOString().slice(0, 16),
      endDate: new Date(campaign.endDate).toISOString().slice(0, 16),
    });
  };

  const onDeleteCampaign = (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign? This will not delete associated rewards.')) {
      dispatch(deleteCampaign(campaignId));
    }
  };

  const onPointsAdjustSubmit = (data) => {
    dispatch(adjustPoints(data));
    dispatch(logActivity({
      userId: data.userId,
      type: 'admin_adjustment',
      points: data.points,
      adminId: user.id, // Log the admin who made the adjustment
    }));
    pointsAdjustForm.reset();
  };

  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
  const averagePoints = users.length > 0 ? (totalPoints / users.length).toFixed(2) : 0;
  const maxPoints = users.length > 0 ? Math.max(...users.map(user => user.points)) : 0;
  const redeemedRewards = rewards.filter(reward => reward.redeemedBy).length;
  const redemptionBreakdown = rewards.reduce((acc, reward) => {
    if (reward.redeemedBy) {
      acc[reward.name] = (acc[reward.name] || 0) + 1;
    }
    return acc;
  }, {});

  if (usersLoading || rewardsLoading || activitiesLoading || campaignsLoading) return <div className="loading">Loading...</div>;
  if (usersError) return <div className="error">{usersError}</div>;
  if (rewardsError) return <div className="error">{rewardsError}</div>;
  if (activitiesError) return <div className="error">{activitiesError}</div>;
  if (campaignsError) return <div className="error">{campaignsError}</div>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <section>
        <h3>Manage Users</h3>
        <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="admin-form">
          <div>
            <input {...userForm.register('name')} placeholder="User Name" />
            {userForm.formState.errors.name && <span>{userForm.formState.errors.name.message}</span>}
          </div>
          <div>
            <input {...userForm.register('points')} type="number" placeholder="Points" />
            {userForm.formState.errors.points && <span>{userForm.formState.errors.points.message}</span>}
          </div>
          <button type="submit">{editingUser ? 'Update User' : 'Add User'}</button>
          {editingUser && <button type="button" onClick={() => { setEditingUser(null); userForm.reset(); }}>Cancel</button>}
        </form>
        <div className="entity-list">
          <h4>Existing Users</h4>
          {users.map(user => (
            <div key={user.id} className="entity-item">
              <span>{user.name} - {user.points} points</span>
              <div>
                <button onClick={() => onEditUser(user)}>Edit</button>
                <button onClick={() => onDeleteUser(user.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3>Manage Reward Campaigns</h3>
        <form onSubmit={campaignForm.handleSubmit(onCampaignSubmit)} className="admin-form">
          <div>
            <input {...campaignForm.register('name')} placeholder="Campaign Name" />
            {campaignForm.formState.errors.name && <span>{campaignForm.formState.errors.name.message}</span>}
          </div>
          <div>
            <input {...campaignForm.register('description')} placeholder="Description" />
            {campaignForm.formState.errors.description && <span>{campaignForm.formState.errors.description.message}</span>}
          </div>
          <div>
            <input {...campaignForm.register('startDate')} type="datetime-local" placeholder="Start Date" />
            {campaignForm.formState.errors.startDate && <span>{campaignForm.formState.errors.startDate.message}</span>}
          </div>
          <div>
            <input {...campaignForm.register('endDate')} type="datetime-local" placeholder="End Date" />
            {campaignForm.formState.errors.endDate && <span>{campaignForm.formState.errors.endDate.message}</span>}
          </div>
          <button type="submit">{editingCampaign ? 'Update Campaign' : 'Add Campaign'}</button>
          {editingCampaign && <button type="button" onClick={() => { setEditingCampaign(null); campaignForm.reset(); }}>Cancel</button>}
        </form>
        <div className="entity-list">
          <h4>Existing Campaigns</h4>
          {campaigns.map(campaign => (
            <div key={campaign.id} className="entity-item">
              <span>{campaign.name} - {campaign.description} (From {new Date(campaign.startDate).toLocaleString()} to {new Date(campaign.endDate).toLocaleString()})</span>
              <div>
                <button onClick={() => onEditCampaign(campaign)}>Edit</button>
                <button onClick={() => onDeleteCampaign(campaign.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3>Manage Rewards</h3>
        <form onSubmit={rewardForm.handleSubmit(onRewardSubmit)} className="admin-form">
          <div>
            <input {...rewardForm.register('name')} placeholder="Reward Name" />
            {rewardForm.formState.errors.name && <span>{rewardForm.formState.errors.name.message}</span>}
          </div>
          <div>
            <input {...rewardForm.register('description')} placeholder="Description" />
            {rewardForm.formState.errors.description && <span>{rewardForm.formState.errors.description.message}</span>}
          </div>
          <div>
            <input {...rewardForm.register('cost')} type="number" placeholder="Cost in Points" />
            {rewardForm.formState.errors.cost && <span>{rewardForm.formState.errors.cost.message}</span>}
          </div>
          <div>
            <input {...rewardForm.register('image')} placeholder="Image URL" />
            {rewardForm.formState.errors.image && <span>{rewardForm.formState.errors.image.message}</span>}
          </div>
          <div>
            <select {...rewardForm.register('campaignId')}>
              <option value="">Select Campaign</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
            {rewardForm.formState.errors.campaignId && <span>{rewardForm.formState.errors.campaignId.message}</span>}
          </div>
          <button type="submit">{editingReward ? 'Update Reward' : 'Add Reward'}</button>
          {editingReward && <button type="button" onClick={() => { setEditingReward(null); rewardForm.reset(); }}>Cancel</button>}
        </form>
        <div className="entity-list">
          <h4>Existing Rewards</h4>
          {rewards.map(reward => (
            <div key={reward.id} className="entity-item">
              <span>{reward.name} - {reward.cost} points {reward.redeemedBy ? `(Redeemed by User ${reward.redeemedBy})` : ''} (Campaign ID: {reward.campaignId})</span>
              <div>
                <button onClick={() => onEditReward(reward)}>Edit</button>
                <button onClick={() => onDeleteReward(reward.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3>Manage Activities</h3>
        <form onSubmit={activityForm.handleSubmit(onActivitySubmit)} className="admin-form">
          <div>
            <input {...activityForm.register('userId')} type="number" placeholder="User ID" />
            {activityForm.formState.errors.userId && <span>{activityForm.formState.errors.userId.message}</span>}
          </div>
          <div>
            <select {...activityForm.register('type')}>
              <option value="">Select Type</option>
              <option value="task">Task</option>
              <option value="login">Login</option>
              <option value="content">Content</option>
              <option value="engagement">Engagement</option>
            </select>
            {activityForm.formState.errors.type && <span>{activityForm.formState.errors.type.message}</span>}
          </div>
          <div>
            <input {...activityForm.register('points')} type="number" placeholder="Points" />
            {activityForm.formState.errors.points && <span>{activityForm.formState.errors.points.message}</span>}
          </div>
          <button type="submit">{editingActivity ? 'Update Activity' : 'Add Activity'}</button>
          {editingActivity && <button type="button" onClick={() => { setEditingActivity(null); activityForm.reset(); }}>Cancel</button>}
        </form>
        <div className="entity-list">
          <h4>Existing Activities</h4>
          {activities.map(activity => (
            <div key={activity.id} className="entity-item">
              <span>User {activity.userId} - {activity.type} - {activity.points} points - {new Date(activity.timestamp).toLocaleString()}</span>
              <div>
                <button onClick={() => onEditActivity(activity)}>Edit</button>
                <button onClick={() => onDeleteActivity(activity.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3>Adjust Points</h3>
        <form onSubmit={pointsAdjustForm.handleSubmit(onPointsAdjustSubmit)} className="admin-form">
          <div>
            <select {...pointsAdjustForm.register('userId')}>
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {pointsAdjustForm.formState.errors.userId && <span>{pointsAdjustForm.formState.errors.userId.message}</span>}
          </div>
          <div>
            <input {...pointsAdjustForm.register('points')} type="number" placeholder="Points Adjustment (e.g., 10 or -10)" />
            {pointsAdjustForm.formState.errors.points && <span>{pointsAdjustForm.formState.errors.points.message}</span>}
          </div>
          <div>
            <input {...pointsAdjustForm.register('reason')} placeholder="Reason for Adjustment" />
            {pointsAdjustForm.formState.errors.reason && <span>{pointsAdjustForm.formState.errors.reason.message}</span>}
          </div>
          <button type="submit">Adjust Points</button>
        </form>
      </section>
      <section>
        <h3>Analytics</h3>
        <div className="analytics-section">
          <h4>Point Distribution</h4>
          <p>Total Points: {totalPoints}</p>
          <p>Average Points per User: {averagePoints}</p>
          <div className="points-chart">
            {users.map(user => (
              <div key={user.id} className="chart-bar">
                <span>{user.name}: {user.points} points</span>
                <div
                  className="bar"
                  style={{ width: `${(user.points / maxPoints) * 100}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>
        <div className="analytics-section">
          <h4>Redemption Trends</h4>
          <p>Total Redeemed Rewards: {redeemedRewards}</p>
          <div className="redemption-breakdown">
            {Object.entries(redemptionBreakdown).map(([rewardName, count]) => (
              <div key={rewardName}>
                {rewardName}: {count} redemption{count > 1 ? 's' : ''}
              </div>
            ))}
            {redeemedRewards === 0 && <div>No rewards redeemed yet.</div>}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard