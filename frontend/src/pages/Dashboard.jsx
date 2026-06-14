import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import NotificationBadge from '../components/NotificationBadge';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import api from '../api';
import './Dashboard.css';

/**
 * Dashboard Page
 * Professional Spreetail-inspired main dashboard
 */
function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await api.getMyGroups();
      if (Array.isArray(data)) {
        setGroups(data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName || !groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.createGroup({
        name: groupName.trim(),
        description: groupDesc.trim(),
        memberIds: []
      });
      setGroups([...groups, data]);
      setShowCreateModal(false);
      setGroupName('');
      setGroupDesc('');
      setError('');
    } catch (error) {
      const errorMessage = error.message || 'Failed to create group';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate('/group/' + groupId);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <Logo size="medium" />
        </div>
        <nav className="main-nav">
          <button
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-link ${location.pathname === '/friends' ? 'active' : ''}`}
            onClick={() => navigate('/friends')}
          >
            <span className="nav-icon">👥</span>
            <span>Friends</span>
          </button>
          <button
            className={`nav-link ${location.pathname === '/activity' ? 'active' : ''}`}
            onClick={() => navigate('/activity')}
          >
            <span className="nav-icon">📋</span>
            <span>Activity</span>
          </button>
        </nav>
        <div className="header-nav">
          <NotificationBadge count={0} />
          <button
            className={`nav-link ${location.pathname === '/notifications' ? 'active' : ''}`}
            onClick={() => navigate('/notifications')}
          >
            <span className="nav-icon">🔔</span>
          </button>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Page Header */}
        <div className="content-header">
          <div>
            <h1>My Groups</h1>
            <p className="content-subtitle">Manage your expense sharing groups</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <span>+</span> Create Group
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Empty State */}
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h2>No groups yet</h2>
            <p>Create your first expense sharing group to get started!</p>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              Create Your First Group
            </button>
          </div>
        ) : (
          /* Groups Grid */
          <div className="groups-grid">
            {groups.map(group => (
              <div key={group.id} className="group-card" onClick={() => handleGroupClick(group.id)}>
                <div className="group-card-header">
                  <div className="group-icon">👥</div>
                  <span className="group-badge badge-primary">
                    {group.members?.length || 0} members
                  </span>
                </div>
                <h3>{group.name}</h3>
                <p className="group-description">{group.description || 'No description'}</p>
                <p className="group-date">
                  Created {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Group</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="modal-body">
              <div className="form-group">
                <label htmlFor="groupName">Group Name *</label>
                <input
                  type="text"
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Apartment Expenses"
                  required
                  disabled={submitting}
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label htmlFor="groupDesc">Description</label>
                <textarea
                  id="groupDesc"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="What is this group for?"
                  rows="3"
                  disabled={submitting}
                  maxLength={500}
                />
                <small className="form-help">
                  {groupDesc.length}/500 characters
                </small>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}

export default Dashboard;