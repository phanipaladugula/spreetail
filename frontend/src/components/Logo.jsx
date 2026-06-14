import React from 'react';
import spreetailLogo from '../assets/images/spreetail-logo.svg';
import './Logo.css';

/**
 * Spreetail Logo Component
 * Renders the official Spreetail logo with SVG support
 * @param {Object} props
 * @param {string} props.size - Size variant: 'small' | 'medium' | 'large'
 * @param {boolean} props.withText - Whether to show text alongside icon
 */
function Logo({ size = 'medium', withText = true }) {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  };

  return (
    <div className={`logo ${sizeClasses[size]}`}>
      <img src={spreetailLogo} alt="Spreetail" className="logo-image" />
      {withText && <span className="logo-text">Spreetail</span>}
    </div>
  );
}

export default Logo;