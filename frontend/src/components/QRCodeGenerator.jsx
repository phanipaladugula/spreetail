import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QRCodeGenerator.css';

function QRCodeGenerator({ value, size = 200, onGenerate = null }) {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const svg = document.querySelector('.qr-code svg');

    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'qr-code.png';
        downloadLink.click();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <div className="qr-code-generator">
      <div className="qr-code">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>

      <div className="qr-actions">
        <button
          className="qr-action-btn"
          onClick={handleCopyToClipboard}
          title="Copy link"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>

        <button
          className="qr-action-btn"
          onClick={handleDownload}
          title="Download QR code"
        >
          💾 Download
        </button>

        {onGenerate && (
          <button
            className="qr-action-btn"
            onClick={onGenerate}
            title="Generate new code"
          >
            🔄 Generate New
          </button>
        )}
      </div>

      {value && (
        <div className="qr-link">
          <small>Share link:</small>
          <code>{value}</code>
        </div>
      )}
    </div>
  );
}

export default QRCodeGenerator;