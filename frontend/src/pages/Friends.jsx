import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import './Friends.css';

/**
 * Friends Page
 * Professional Spreetail-inspired friends management
 */
function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsData, pendingData] = await Promise.all([
        api.getFriends(),
        api.getPendingRequests()
      ]);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setPendingRequests(Array.isArray(pendingData) ? pendingData : []);
    } catch (error) {
      console.error('Error loading friends data:', error);
      setError('Failed to load friends data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newFriendEmail || !newFriendEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(newFriendEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.sendFriendRequest(newFriendEmail.trim());
      setSuccess('Friend request sent successfully!');
      setNewFriendEmail('');
      setShowAddFriendModal(false);
      loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error.message || 'Failed to send friend request';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setError('');
    try {
      await api.acceptFriendRequest(requestId);
      setSuccess('Friend request accepted!');
      loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setError('');
    try {
      await api.declineFriendRequest(requestId);
      setSuccess('Friend request declined');
      loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to decline request');
    }
  };

  const getAvatarInitials = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  const getAvatarColor = (username) => {
    const colors = [
      'var(--primary-color)',
      'var(--secondary-color)',
      'var(--success-color)',
      'var(--warning-color)',
      'var(--info-color)',
      'var(--danger-color)'
    ];
    const index = username ? username.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading friends...</p>
      </div>
    );
  }

  return (
    <div className="friends-page">
      {/* Header */}
      <header className="page-header">
        <Logo size="small" />
        <div className="header-actions">
          <button onClick={() => setShowAddFriendModal(true)} className="btn btn-primary">
            + Add Friend
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="page-title-section">
          <h1>Friends</h1>
          <p className="page-subtitle">Manage your friendships and expense sharing connections</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="alert alert-success">
            <span>✓</span>
            {success}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Tabs */}
        <nav className="friends-tabs">
          <button
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <span className="tab-icon">👥</span>
            <span>My Friends</span>
            <span className="tab-count">{friends.length}</span>
          </button>
          <button
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span className="tab-icon">📩</span>
            <span>Pending Requests</span>
            <span className="tab-count">{pendingRequests.length}</span>
          </button>
        </nav>

        {/* Friends Section */}
        {activeTab === 'friends' && (
          <div className="friends-section">
            {friends.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h2>No friends yet</h2>
                <p>Send friend requests to start tracking shared expenses together!</p>
                <button onClick={() => setShowAddFriendModal(true)} className="btn btn-primary">
                  Add Your First Friend
                </button>
              </div>
            ) : (
              <div className="friends-grid">
                {friends.map(friend => (
                  <div key={friend.id} className="friend-card">
                    <div
                      className="friend-avatar"
                      style={{ backgroundColor: getAvatarColor(friend.friendUsername || friend.friendEmail) }}
                    >
                      {getAvatarInitials(friend.friendUsername)}
                    </div>
                    <div className="friend-info">
                      <h3>{friend.friendUsername || 'Unknown'}</h3>
                      <p>{friend.friendEmail}</p>
                      <span className="badge badge-success">Connected</span>
                    </div>
                    <div className="friend-actions">
                      <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm">
                        Create Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Requests Section */}
        {activeTab === 'requests' && (
          <div className="requests-section">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📩</div>
                <h2>No pending requests</h2>
                <p>You're all caught up!</p>
              </div>
            ) : (
              <div className="requests-list">
                {pendingRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div
                      className="request-avatar"
                      style={{ backgroundColor: getAvatarColor(request.friendUsername || request.friendEmail) }}
                    >
                      {getAvatarInitials(request.friendUsername)}
                    </div>
                    <div className="request-info">
                      <h3>{request.friendUsername || 'Unknown'}</h3>
                      <p>{request.friendEmail}</p>
                      <p className="request-date">
                        Sent {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <div className="request-actions">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="btn btn-success btn-sm"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="modal-overlay" onClick={() => setShowAddFriendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Friend</h2>
              <button className="modal-close" onClick={() => setShowAddFriendModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSendFriendRequest} className="modal-body">
              <div className="form-group">
                <label htmlFor="friendEmail">Friend's Email *</label>
                <input
                  type="email"
                  id="friendEmail"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  placeholder="friend@example.com"
                  disabled={submitting}
                  required
                  autoComplete="email"
                />
                <small className="form-help">
                  Your friend must have an account to receive your request
                </small>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddFriendModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;