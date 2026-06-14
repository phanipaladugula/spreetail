import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LogoutConfirmModal.css';

function LogoutConfirmModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-header">
          <h2>Confirm Logout</h2>
        </div>

        <div className="logout-modal-body">
          <div className="logout-icon">👋</div>
          <p>Are you sure you want to log out?</p>
        </div>

        <div className="logout-modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmModal;