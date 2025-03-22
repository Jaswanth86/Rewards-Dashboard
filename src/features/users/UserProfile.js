import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchUsers, selectUserById } from './usersSlice';
import { useAuth } from '../../context/AuthContext';

function UserProfile() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const userData = useAppSelector((state) => selectUserById(state, user?.id));
  const { loading, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!userData) return <div>User not found.</div>;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="user-info">
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Points:</strong> {userData.points}</p>
        <p><strong>Role:</strong> {userData.role}</p>
      </div>
      <div className="activity-history">
        <h3>Activity History</h3>
        {userData.activities && userData.activities.length > 0 ? (
          userData.activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <span>{activity.description}</span>
              <span className={activity.points >= 0 ? 'points-earned' : 'points-spent'}>
                {activity.points >= 0 ? '+' : ''}{activity.points} points
              </span>
              <span className="timestamp">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div>No activities yet.</div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;