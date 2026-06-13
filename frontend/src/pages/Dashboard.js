import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Dashboard.css';

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await api.getMyGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    const name = prompt('Enter group name:');
    if (name) {
      const description = prompt('Enter description (optional):') || '';
      api.createGroup({ name, description, memberIds: [] })
        .then(() => loadGroups())
        .catch(error => alert(error));
    }
  };

  const handleGroupClick = (groupId) => {
    navigate('/group/' + groupId);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Spreetail</h1>
        <div className="user-info">
          <span>Welcome, {user ? user.username : 'User'}</span>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="dashboard-header">
          <h2>My Groups</h2>
          <button onClick={handleCreateGroup} className="btn btn-primary">Create New Group</button>
        </div>

        {groups.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any groups yet.</p>
            <p>Click "Create New Group" to get started!</p>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map(group => (
              <div key={group.id} className="group-card" onClick={() => handleGroupClick(group.id)}>
                <h3>{group.name}</h3>
                <p>{group.description || 'No description'}</p>
                <p className="member-count">{group.members.length} members</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;