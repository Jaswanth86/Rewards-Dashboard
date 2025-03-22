import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import UserProfile from './features/users/UserProfile';
import RewardsList from './features/rewards/RewardsList';
import ActivityFeed from './features/activities/ActivityFeed';
import AdminDashboard from './features/admin/AdminDashboard';
import Login from './features/auth/Login';
import Leaderboard from './features/leaderboard/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-links">
            <Link to="/">Profile</Link>
            <Link to="/rewards">Rewards</Link>
            <Link to="/activity">Activity Feed</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            {user && user.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
          </div>
          <div className="auth-controls">
            {user ? (
              <>
                <span>Welcome, {user.name}</span>
                <button onClick={logout} className="logout-button">Logout</button>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </nav>
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <RewardsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <ActivityFeed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;