import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchUsers, selectAllUsers } from './usersSlice';
import { debounce } from 'lodash';

function UserList() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const { loading, error } = useAppSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('points');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const debouncedSearch = debounce((value) => setSearchTerm(value), 300);

  const filteredUsers = users
    .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortBy === 'points' ? b.points - a.points : a.name.localeCompare(b.name));

  return (
    <div className="user-list">
      <h2>Leaderboard</h2>
      <div className="controls">
        <input
          type="text"
          placeholder="Search users..."
          onChange={(e) => debouncedSearch(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="points">Sort by Points</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {filteredUsers.length > 0 ? (
        <div className="list">
          {filteredUsers.map((user, index) => (
            <div key={user.id} className="user-item">
              <span>#{index + 1}</span>
              <span>{user.name}</span>
              <span>{user.points} points</span>
            </div>
          ))}
        </div>
      ) : (
        <div>No users found</div>
      )}
    </div>
  );
}

export default UserList;