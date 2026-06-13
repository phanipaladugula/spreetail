import React from 'react';
import './Logo.css';

function Logo({ size = 'medium' }) {
  return (
    <div className={`logo logo-${size}`}>
      <div className="logo-icon">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* S shape */}
          <path d="M20 20 C10 20 10 30 10 40 C10 55 15 70 25 80 L40 95 C45 90 50 85 55 80 L75 60 C85 50 90 35 80 20 C70 10 50 5 35 5 C30 5 25 10 20 20 Z" fill="currentColor"/>
          {/* Pay arrow */}
          <path d="M70 30 L90 50 L70 70" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M75 50 L90 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Dollar sign */}
          <circle cx="50" cy="50" r="12" fill="currentColor" opacity="0.3"/>
        </svg>
      </div>
      <span className="logo-text">Spreetail</span>
    </div>
  );
}

export default Logo;