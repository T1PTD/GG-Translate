import React from "react";

export const TranslationPanel = ({
  text,
  translatedText,
  handleTextChange,
  charCount,
  clearText,
  handleTranslate,
}) => {
  return (
    <>
      <div className="text-areas-container">
        <div className="text-area-wrapper">
          <textarea
            className="source-text"
            placeholder="Enter text"
            value={text}
            onChange={handleTextChange}
            onKeyUp={handleTranslate}
          ></textarea>
          <div className="text-controls">
            <div className="char-count">{charCount}/5,000</div>
            <div className="text-buttons">
              <button className="mic-button">🎤</button>
              <button className="clear-button" onClick={clearText}>
                ✕
              </button>
            </div>
          </div>
        </div>
        <div className="text-area-wrapper">
          <div className="target-header">Translation</div>
          <div className="target-text">{translatedText}</div>
        </div>
      </div>

      {/* Thêm phần lịch sử và đã lưu */}
      <div className="translation-history">
        <div className="history-item">
          <div className="history-icon">
            <span>🕒</span>
          </div>
          <div className="history-text">Translations done</div>
        </div>
        <div className="history-item">
          <div className="history-icon">
            <span>⭐</span>
          </div>
          <div className="history-text">Saved</div>
        </div>
      </div>

      <div className="feedback-text">Send feedback</div>
    </>
  );
};
