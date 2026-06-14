import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import './Friends.css';

function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [friendsData, pendingData] = await Promise.all([
        api.getFriends(),
        api.getPendingRequests()
      ]);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setPendingRequests(Array.isArray(pendingData) ? pendingData : []);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    try {
      await api.sendFriendRequest(newFriendEmail);
      setNewFriendEmail('');
      setShowAddFriendModal(false);
      alert('Friend request sent!');
      loadData();
    } catch (error) {
      alert('Failed to send friend request: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.acceptFriendRequest(requestId);
      alert('Friend request accepted!');
      loadData();
    } catch (error) {
      alert('Failed to accept request: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await api.declineFriendRequest(requestId);
      alert('Friend request declined');
      loadData();
    } catch (error) {
      alert('Failed to decline request: ' + (error.message || 'Unknown error'));
    }
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
      <header className="page-header">
        <Logo />
        <div className="page-title">
          <h1>Friends</h1>
          <p>Manage your friendships</p>
        </div>
        <button onClick={() => setShowAddFriendModal(true)} className="btn btn-primary">
          + Add Friend
        </button>
      </header>

      <nav className="friends-tabs">
        <button
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          👥 My Friends ({friends.length})
        </button>
        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📩 Pending Requests ({pendingRequests.length})
        </button>
      </nav>

      <div className="friends-content">
        {activeTab === 'friends' && (
          <div className="friends-section">
            {friends.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h2>No friends yet</h2>
                <p>Send friend requests to start tracking shared expenses!</p>
                <button onClick={() => setShowAddFriendModal(true)} className="btn btn-primary">
                  Add Your First Friend
                </button>
              </div>
            ) : (
              <div className="friends-list">
                {friends.map(friend => (
                  <div key={friend.id} className="friend-card">
                    <div className="friend-avatar">
                      {friend.friendUsername.charAt(0).toUpperCase()}
                    </div>
                    <div className="friend-info">
                      <h3>{friend.friendUsername}</h3>
                      <p>{friend.friendEmail}</p>
                      <span className={`badge badge-${friend.status === 'accepted' ? 'success' : 'secondary'}`}>
                        {friend.status}
                      </span>
                    </div>
                    <div className="friend-actions">
                      <button onClick={() => navigate('/groups')} className="btn btn-secondary btn-sm">
                        Create Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
                    <div className="request-info">
                      <h3>{request.friendUsername}</h3>
                      <p>{request.friendEmail}</p>
                      <p className="request-date">
                        Sent {new Date(request.createdAt).toLocaleDateString()}
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
                        className="btn btn-danger btn-sm"
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
                  required
                />
                <small className="form-help">
                  Your friend must have an account to receive your request
                </small>
              </div>
            </form>
            <div className="modal-footer">
              <button onClick={() => setShowAddFriendModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;