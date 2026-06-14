import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import './Notifications.css';

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    emailExpenseAdded: true,
    emailSettlement: true,
    emailFriendRequest: true,
    emailInvitation: true,
    dailyDigest: false,
    pushEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const notificationsData = await api.getNotifications();
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      for (const notification of notifications.filter(n => !n.read)) {
        await api.markNotificationAsRead(notification.id);
      }
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await api.updateNotificationSettings(settings);
      alert('Notification settings updated!');
    } catch (error) {
      alert('Failed to update settings: ' + (error.message || 'Unknown error'));
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      expense: '💰',
      settlement: '🤝',
      friend_request: '👋',
      invitation: '📧',
      group: '👥',
      comment: '💬'
    };
    return icons[type] || '🔔';
  };

  const getNotificationTitle = (type) => {
    const titles = {
      expense: 'New Expense',
      settlement: 'Settlement Update',
      friend_request: 'Friend Request',
      invitation: 'Group Invitation',
      group: 'Group Update',
      comment: 'New Comment'
    };
    return titles[type] || 'Notification';
  };

  const getNotificationTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <header className="page-header">
        <Logo />
        <div className="page-title">
          <h1>Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
            Mark All as Read
          </button>
        )}
      </header>

      <div className="notifications-content">
        <section className="notifications-section">
          <h2>Recent Notifications</h2>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h2>No notifications yet</h2>
              <p>You'll see updates about expenses, settlements, and more here!</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-info">
                    <div className="notification-header">
                      <span className="notification-title">
                        {getNotificationTitle(notification.type)}
                      </span>
                      {!notification.read && <span className="unread-badge">•</span>}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {getNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.read && (
                    <button
                      className="mark-read-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="settings-section">
          <h2>Notification Settings</h2>
          <div className="settings-card">
            <div className="settings-group">
              <h3>Email Notifications</h3>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.emailExpenseAdded}
                    onChange={(e) => setSettings({ ...settings, emailExpenseAdded: e.target.checked })}
                  />
                  <span>New expenses added</span>
                </label>
                <small>Get notified when someone adds an expense</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.emailSettlement}
                    onChange={(e) => setSettings({ ...settings, emailSettlement: e.target.checked })}
                  />
                  <span>Settlement updates</span>
                </label>
                <small>Get notified about payment requests and settlements</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.emailFriendRequest}
                    onChange={(e) => setSettings({ ...settings, emailFriendRequest: e.target.checked })}
                  />
                  <span>Friend requests</span>
                </label>
                <small>Get notified when someone sends a friend request</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.emailInvitation}
                    onChange={(e) => setSettings({ ...settings, emailInvitation: e.target.checked })}
                  />
                  <span>Group invitations</span>
                </label>
                <small>Get notified when someone invites you to a group</small>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.dailyDigest}
                    onChange={(e) => setSettings({ ...settings, dailyDigest: e.target.checked })}
                  />
                  <span>Daily digest</span>
                </label>
                <small>Receive a daily summary of your expenses and balances</small>
              </div>
            </div>

            <div className="settings-group">
              <h3>Push Notifications</h3>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.pushEnabled}
                    onChange={(e) => setSettings({ ...settings, pushEnabled: e.target.checked })}
                  />
                  <span>Enable push notifications</span>
                </label>
                <small>Receive real-time notifications on your device</small>
              </div>
            </div>

            <div className="settings-actions">
              <button onClick={handleUpdateSettings} className="btn btn-primary">
                Save Settings
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Notifications;