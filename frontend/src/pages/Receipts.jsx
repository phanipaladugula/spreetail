import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import './Receipts.css';

function Receipts() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const receiptsData = await api.getMyReceipts();
      setReceipts(Array.isArray(receiptsData) ? receiptsData : []);
    } catch (error) {
      console.error('Error loading receipts:', error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedExpenseId) return;

    setUploading(true);
    try {
      await api.uploadReceipt(selectedExpenseId, selectedFile);
      alert('Receipt uploaded successfully!');
      setUploadModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedExpenseId(null);
      loadReceipts();
    } catch (error) {
      alert('Failed to upload receipt: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (receiptId) => {
    try {
      await api.downloadReceipt(receiptId);
    } catch (error) {
      alert('Failed to download receipt: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (receiptId) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) return;

    try {
      await api.deleteReceipt(receiptId);
      alert('Receipt deleted');
      loadReceipts();
    } catch (error) {
      alert('Failed to delete receipt: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading receipts...</p>
      </div>
    );
  }

  return (
    <div className="receipts-page">
      <header className="page-header">
        <Logo />
        <div className="page-title">
          <h1>Receipts</h1>
          <p>Manage expense receipts and documentation</p>
        </div>
        <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary">
          + Upload Receipt
        </button>
      </header>

      <div className="receipts-content">
        {receipts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧾</div>
            <h2>No receipts yet</h2>
            <p>Upload receipts to keep track of your expenses!</p>
            <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary">
              Upload First Receipt
            </button>
          </div>
        ) : (
          <div className="receipts-list">
            {receipts.map(receipt => (
              <div key={receipt.id} className="receipt-card">
                <div className="receipt-thumbnail">
                  {receipt.imageUrl ? (
                    <img
                      src={receipt.imageUrl}
                      alt="Receipt"
                      onClick={() => window.open(receipt.imageUrl, '_blank')}
                    />
                  ) : (
                    <div className="receipt-placeholder">🧾</div>
                  )}
                </div>
                <div className="receipt-info">
                  <h3>{receipt.fileName || 'Receipt'}</h3>
                  <p className="receipt-expense">
                    💰 {receipt.expenseDescription || 'Unknown expense'}
                  </p>
                  <span className="receipt-date">
                    {new Date(receipt.createdAt).toLocaleDateString()}
                  </span>
                  <span className="receipt-size">
                    {receipt.fileSize ? `${(receipt.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}
                  </span>
                </div>
                <div className="receipt-actions">
                  <button
                    onClick={() => handleDownload(receipt.id)}
                    className="btn btn-secondary btn-sm"
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => handleDelete(receipt.id)}
                    className="btn btn-danger btn-sm"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {uploadModalOpen && (
        <div className="modal-overlay" onClick={() => setUploadModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Receipt</h2>
              <button className="modal-close" onClick={() => setUploadModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpload} className="modal-body">
              <div className="form-group">
                <label htmlFor="expenseSelect">Select Expense *</label>
                <select
                  id="expenseSelect"
                  value={selectedExpenseId || ''}
                  onChange={(e) => setSelectedExpenseId(e.target.value ? parseInt(e.target.value) : null)}
                  required
                >
                  <option value="">Choose an expense...</option>
                  {receipts.length > 0 && receipts.map(r => (
                    <option key={r.expenseId} value={r.expenseId}>
                      {r.expenseDescription || `Expense #${r.expenseId}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="receiptFile">Receipt Image *</label>
                <input
                  type="file"
                  id="receiptFile"
                  accept="image/*"
                  onChange={handleFileSelect}
                  required
                />
                <small className="form-help">
                  Supports JPG, PNG, and other image formats
                </small>
              </div>

              {previewUrl && (
                <div className="receipt-preview">
                  <h4>Preview</h4>
                  <img src={previewUrl} alt="Receipt preview" />
                </div>
              )}
            </form>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setSelectedExpenseId(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receipts;