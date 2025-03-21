// src/components/TranslationHistory.jsx
import React, { useState, useEffect } from 'react';
import { getTranslationHistory, clearTranslationHistory, deleteTranslationEntry } from '../services/translationHistory';

export function TranslationHistory({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Load history when sidebar opens
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    const translationHistory = getTranslationHistory();
    setHistory(translationHistory);
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử dịch?')) {
      clearTranslationHistory();
      setHistory([]);
    }
  };

  const handleDeleteEntry = (id) => {
    deleteTranslationEntry(id);
    loadHistory(); // Reload history after deletion
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`history-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="history-header">
        <h2>Lịch sử dịch</h2>
        <div className="history-actions">
          <button className="clear-history-btn" onClick={handleClearHistory}>
            Xóa tất cả
          </button>
          <button className="close-history-btn" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className="history-content">
        {history.length === 0 ? (
          <div className="empty-history">
            <p>Không có lịch sử dịch nào.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div className="history-entry" key={entry.id}>
                <div className="history-entry-header">
                  <div className="history-languages">
                    {entry.sourceLang} → {entry.targetLang}
                  </div>
                  <div className="history-entry-actions">
                    <span className="history-date">{formatDate(entry.timestamp)}</span>
                    <button 
                      className="delete-entry-btn" 
                      onClick={() => handleDeleteEntry(entry.id)}
                      title="Xóa mục này"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="history-texts">
                  <div className="history-source-text">{entry.sourceText}</div>
                  <div className="history-translated-text">{entry.translatedText}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
