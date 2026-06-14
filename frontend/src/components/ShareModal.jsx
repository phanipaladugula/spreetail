import React, { useState } from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import './ShareModal.css';

function ShareModal({ isOpen, onClose, type, entityId, entityName = '' }) {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const shareTypes = {
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    email: 'Email',
    link: 'Copy Link'
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/share/${type}/${entityId}`;
    setShareLink(link);
    return link;
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async (platform) => {
    const link = shareLink || generateShareLink();

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${entityName}: ${link}`)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Check out ${entityName}`)}&body=${encodeURIComponent(link)}`, '_blank');
        break;
      case 'link':
        handleCopyToClipboard();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share {type === 'group' ? 'Group' : type === 'expense' ? 'Expense' : 'Settlement'}</h2>
          <button className="share-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="share-modal-body">
          {entityName && (
            <div className="share-entity-name">
              {entityName}
            </div>
          )}

          <QRCodeGenerator
            value={shareLink || generateShareLink()}
            size={200}
          />

          <div className="share-options">
            <h3>Share via:</h3>
            <div className="share-buttons">
              <button
                className="share-btn share-btn-whatsapp"
                onClick={() => handleShare('whatsapp')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.097-.471-.148-.67.15-.197.297-.407.746-.746 1.33-.242.392-.86.9-1.173-1.41-.16-.237-.274-.385-.274-.385-.088-.123-.133-.264-.088-.388 0-.117.053-.233.153-.346.115-.14.297-.368.746-.64.054-.037.099-.086.133-.108.162-.112.088-.187.017-.256-.063-.063-.074-.086-.149-.063-.227 0-.071.063-.148.149-.148 1.615-1.478 2.413-2.672.859-1.128.852-2.353.852-3.469 0-1.688-.63-2.786-1.657-3.178C9.73 9.993 8.645 9.993 8.645 9.993c-1.657 0-3 .447-3 1v10c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V6c0-1.105-.895-2-2-2H9.993z"/>
                </svg>
                WhatsApp
              </button>

              <button
                className="share-btn share-btn-telegram"
                onClick={() => handleShare('telegram')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325l.926 1.58a.5.5 0 0 1-.106.632c-.812-.333-2.316-1.333-2.316-1.333a.5.5 0 0 1-.416-.13.5.5 0 0 1-.11-.588l.926-1.58a.5.5 0 0 1 .377-.197c.166-.004.5.16.95.478 1.233 1.033l.622-1.06a.5.5 0 0 1 .377-.198c.166-.004.5.16.95.478 2.838 2.383 4.088 1.228 4.088 1.228a.5.5 0 0 1 .416.13.5.5 0 0 1 .11.588l-.926 1.58a.5.5 0 0 1-.377.197c-.166.004-.5-.16-.95-.478-1.812-.333-2.316-1.333-2.316-1.333a.5.5 0 0 1-.106.632l-.926 1.58a.506.506 0 0 1-.171.325c-.144-.117-.365-.142-.465-.14l-.622 1.06a.5.5 0 0 1-.377.198c-.166.004-.5-.16-.95-.478-2.838-2.383-4.088-1.228-4.088-1.228z"/>
                </svg>
                Telegram
              </button>

              <button
                className="share-btn share-btn-email"
                onClick={() => handleShare('email')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                </svg>
                Email
              </button>

              <button
                className="share-btn share-btn-link"
                onClick={() => handleShare('link')}
              >
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;