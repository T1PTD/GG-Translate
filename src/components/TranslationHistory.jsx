// src/components/TranslationHistoryView.jsx
import React, { useState, useEffect } from "react";
import { 
  getTranslationHistory, 
  clearTranslationHistory, 
  deleteTranslationEntry,
  saveToFavorites
} from "../services/translationHistory";

export function TranslationHistoryView({ onSelectHistoryItem }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = getTranslationHistory();
    setHistory(historyData);
  };

  const handleDeleteHistoryItem = (id, event) => {
    event.stopPropagation(); // Prevent triggering the parent click
    deleteTranslationEntry(id);
    loadHistory();
  };

  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử dịch?")) {
      clearTranslationHistory();
      loadHistory();
    }
  };

  const handleAddToFavorites = (entry, event) => {
    event.stopPropagation(); // Prevent triggering the parent click
    saveToFavorites(entry);
    // Optional: show a confirmation message
  };

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

  // Filter items based on search term
  const filteredHistory = history.filter(item => 
    item.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="translation-history-view">
      <div className="history-header">
        <h2>Lịch sử dịch</h2>
        <div className="history-controls">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm trong lịch sử..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
          {history.length > 0 && (
            <button className="clear-history-btn" onClick={handleClearHistory}>
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="empty-history">
            {searchTerm 
              ? "Không tìm thấy kết quả nào."
              : "Chưa có lịch sử dịch nào."}
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div 
              key={item.id} 
              className="history-item"
              onClick={() => onSelectHistoryItem(item)}
            >
              <div className="history-item-content">
                <div className="history-item-text">
                  <div className="history-source-text">{item.sourceText}</div>
                  <div className="history-translated-text">{item.translatedText}</div>
                </div>
                <div className="history-item-info">
                  <div className="history-item-langs">
                    {item.sourceLang} → {item.targetLang}
                  </div>
                  <div className="history-item-time">{formatDate(item.timestamp)}</div>
                </div>
              </div>
              <div className="history-item-actions">
                <button 
                  className="favorite-btn"
                  onClick={(e) => handleAddToFavorites(item, e)}
                  title="Lưu vào mục yêu thích"
                >
                  <span className="action-icon">⭐</span>
                </button>
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                  title="Xóa khỏi lịch sử"
                >
                  <span className="action-icon">🗑️</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
