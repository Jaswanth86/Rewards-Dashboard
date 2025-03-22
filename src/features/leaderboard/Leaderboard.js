import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchUsers, selectAllUsers } from '../users/usersSlice';

function Leaderboard() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const { loading, error } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Sort users by points in descending order
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      {sortedUsers.length > 0 ? (
        <div className="leaderboard-list">
          {sortedUsers.map((user, index) => (
            <div key={user.id} className="leaderboard-item">
              <span className="rank">{index + 1}.</span>
              <span className="name">{user.name}</span>
              <span className="points">{user.points} points</span>
            </div>
          ))}
        </div>
      ) : (
        <div>No users found</div>
      )}
    </div>
  );
}

export default Leaderboard;