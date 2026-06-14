import React from 'react';
import './EmptyState.css';

function EmptyState({ icon = '📭', title = 'Nothing here', message = '', action = null }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

export default EmptyState;