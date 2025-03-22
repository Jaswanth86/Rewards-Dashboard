import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchActivities, selectAllActivities } from './activitiesSlice';
import { fetchUsers, selectAllUsers } from '../users/usersSlice';
import { useAuth } from '../../context/AuthContext';

function ActivityFeed() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const activities = useAppSelector(selectAllActivities);
  const users = useAppSelector(selectAllUsers);
  const { loading, error } = useAppSelector((state) => state.activities);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(fetchUsers());
  }, [dispatch]);

  // For normal users, show only their own activities
  // For admins, show their own activities by default, with an option to select another user
  const filteredActivities = user.role === 'admin'
    ? selectedUserId
      ? activities.filter(activity => activity.userId === Number(selectedUserId))
      : activities.filter(activity => activity.userId === user.id)
    : activities.filter(activity => activity.userId === user.id && activity.type !== 'admin_adjustment');

  return (
    <div className="activity-feed">
      <h2>Activity Feed</h2>
      {user.role === 'admin' && (
        <div className="user-select">
          <label>Select User: </label>
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">My Activities</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && filteredActivities.length > 0 ? (
        filteredActivities.map(activity => (
          <div key={activity.id} className="activity-item">
            <span>User {activity.userId}</span>
            <span>{activity.type}</span>
            <span>{activity.points} points</span>
            <span>{new Date(activity.timestamp).toLocaleString()}</span>
            {activity.adminId && <span>(Adjusted by Admin {activity.adminId})</span>}
          </div>
        ))
      ) : (
        <div>No activities found</div>
      )}
    </div>
  );
}

export default ActivityFeed;