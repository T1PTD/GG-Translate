// src/components/RecentTranslations.jsx
import React from 'react';
import { saveToFavorites } from '../services/translationHistory';

export function RecentTranslations({ recentTranslation, savedTranslation, onViewHistory }) {
  const handleSaveToFavorites = () => {
    if (recentTranslation) {
      const saved = saveToFavorites(recentTranslation);
      if (saved) {
        alert('Translation saved to favorites!');
      }
    } else {
      alert('No recent translation to save');
    }
  };

  const handleViewHistory = () => {
    // Call the parent component's function to open the history sidebar
    onViewHistory();
  };

  return (
    <div className="translation-history">
      <div className="history-item" onClick={handleViewHistory}>
        <div className="history-icon">
          <span>🕒</span>
        </div>
        <div className="history-text">
          {recentTranslation ? 'Translation done' : 'No recent translations'}
        </div>
      </div>
      
      <div className="history-item" onClick={handleSaveToFavorites}>
        <div className="history-icon">
          <span>⭐</span>
        </div>
        <div className="history-text">
          {savedTranslation ? 'Saved' : 'Save translation'}
        </div>
      </div>
    </div>
  );
}
