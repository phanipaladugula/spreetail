import React from 'react';
import './Avatar.css';

function Avatar({ name, size = 'medium', imageUrl = null, className = '' }) {
  const initials = name
    .split(' ')
    .map(n => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium',
    large: 'avatar-large'
  };

  const backgroundColor = imageUrl ? 'transparent' : stringToColor(name);

  return (
    <div
      className={`avatar ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  return colors[Math.abs(hash) % colors.length];
}

export default Avatar;