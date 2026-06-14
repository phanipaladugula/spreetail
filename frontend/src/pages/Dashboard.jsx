import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import NotificationBadge from '../components/NotificationBadge';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import api from '../api';
import './Dashboard.css';

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await api.getMyGroups();
      if (Array.isArray(data)) {
        setGroups(data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const data = await api.createGroup({
        name: groupName,
        description: groupDesc,
        memberIds: []
      });
      setGroups([...groups, data]);
      setShowCreateModal(false);
      setGroupName('');
      setGroupDesc('');
    } catch (error) {
      alert('Failed to create group: ' + (error.message || 'Unknown error'));
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
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-brand">
          <Logo size="small" />
        </div>
        <nav className="main-nav">
          <button
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-link ${location.pathname === '/friends' ? 'active' : ''}`}
            onClick={() => navigate('/friends')}
          >
            👥 Friends
          </button>
          <button
            className={`nav-link ${location.pathname === '/activity' ? 'active' : ''}`}
            onClick={() => navigate('/activity')}
          >
            📋 Activity
          </button>
          <button
            className={`nav-link ${location.pathname === '/currencies' ? 'active' : ''}`}
            onClick={() => navigate('/currencies')}
          >
            💱 Currencies
          </button>
          <button
            className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}
            onClick={() => navigate('/categories')}
          >
            🏷️ Categories
          </button>
          <button
            className={`nav-link ${location.pathname === '/receipts' ? 'active' : ''}`}
            onClick={() => navigate('/receipts')}
          >
            🧾 Receipts
          </button>
        </nav>
        <div className="header-nav">
          <NotificationBadge count={0} />
          <button
            className={`nav-link ${location.pathname === '/notifications' ? 'active' : ''}`}
            onClick={() => navigate('/notifications')}
          >
            🔔 Notifications
          </button>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>My Groups</h1>
            <p className="dashboard-subtitle">Manage your expense sharing groups</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <span>+</span> Create Group
          </button>
        </div>

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
                <p className="group-date">Created {new Date(group.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Group</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
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
                />
              </div>
            </form>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Group
              </button>
            </div>
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