import React from 'react';
import './Logo.css';

function Logo({ size = 'medium' }) {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  };

  return (
    <div className={`logo ${sizeClasses[size]}`}>
      <img
        src="https://www.builtin.com/files/2022-06-02/files/2022-06-02/FIcon2520Spreetail2520Large2520.png"
        alt="Spreetail"
        className="logo-image"
      />
      <span className="logo-text">Spreetail</span>
    </div>
  );
}

export default Logo;