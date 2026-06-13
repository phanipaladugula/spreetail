import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import './Dashboard.css';

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <div className="header-nav">
          <span className="header-welcome">
            Welcome, <strong>{user?.username || 'User'}</strong>
          </span>
          <button onClick={logout} className="btn btn-secondary btn-sm">
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
              <button onClick={handleCreateGroup} className="btn btn-primary">
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;