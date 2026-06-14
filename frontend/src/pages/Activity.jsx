import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import './Activity.css';

function Activity() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal'); // personal, group
  const [activities, setActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    try {
      const groupsData = await api.getMyGroups();
      setGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  }, []);

  const loadActivities = useCallback(async (type, groupId = null) => {
    setLoading(true);
    try {
      let activitiesData;
      if (type === 'personal') {
        activitiesData = await api.getMyActivities();
      } else if (groupId) {
        activitiesData = await api.getGroupActivities(groupId);
      }

      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
    loadActivities('personal');
  }, [loadGroups, loadActivities]);

  const handleGroupChange = (groupId) => {
    setSelectedGroupId(groupId);
    loadActivities('group', groupId);
  };

  const getActivityIcon = (action, entityType) => {
    if (entityType === 'expense') {
      return '💰';
    } else if (entityType === 'settlement') {
      return '🤝';
    } else if (entityType === 'comment') {
      return '💬';
    } else if (entityType === 'group') {
      return '👥';
    }
    return '📌';
  };

  const getActivityDescription = (activity) => {
    const actionMap = {
      expense_created: 'added an expense',
      expense_updated: 'updated an expense',
      settlement_recorded: 'recorded a settlement',
      member_added: 'added a member',
      member_removed: 'removed a member',
      comment_added: 'added a comment'
    };

    return actionMap[activity.action] || activity.description || 'performed an action';
  };

  const getActivityTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading && activities.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="activity-page">
      <header className="page-header">
        <Logo />
        <div className="page-title">
          <h1>Activity Feed</h1>
          <p>Track all your expense activities</p>
        </div>
      </header>

      <nav className="activity-tabs">
        <button
          className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('personal');
            loadActivities('personal');
          }}
        >
          👤 Personal Activity
        </button>
        <button
          className={`tab ${activeTab === 'group' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('group');
            loadActivities('group', selectedGroupId || (groups.length > 0 ? groups[0].id : null));
          }}
        >
          👥 Group Activity
        </button>
      </nav>

      <div className="activity-content">
        {activeTab === 'group' && (
          <div className="group-selector">
            <label htmlFor="groupSelect">Select Group:</label>
            <select
              id="groupSelect"
              value={selectedGroupId || ''}
              onChange={(e) => handleGroupChange(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Choose a group...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No activities yet</h2>
            <p>Start adding expenses to see your activity feed!</p>
            {activeTab === 'personal' && (
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Go to Dashboard
              </button>
            )}
          </div>
        ) : (
          <div className="activities-list">
            {activities.map(activity => (
              <div key={activity.id} className="activity-card">
                <div className="activity-icon">
                  {getActivityIcon(activity.action, activity.entityType)}
                </div>
                <div className="activity-info">
                  <div className="activity-header">
                    <span className="activity-user">{activity.username}</span>
                    <span className="activity-action">{getActivityDescription(activity)}</span>
                  </div>
                  {activity.entityType === 'expense' && (
                    <p className="activity-entity">
                      💰 {activity.description}
                    </p>
                  )}
                  {activity.entityType === 'comment' && (
                    <p className="activity-entity">
                      💬 "{activity.description}"
                    </p>
                  )}
                  {activity.entityType === 'settlement' && (
                    <p className="activity-entity">
                      🤝 Settlement recorded
                    </p>
                  )}
                  <span className="activity-time">{getActivityTime(activity.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Activity;