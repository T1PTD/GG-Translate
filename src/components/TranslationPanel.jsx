import React from "react";

export function TranslationPanel({
  text,
  translatedText,
  handleTextChange,
  charCount,
  clearText,
  handleTranslate,
  isTranslating,
  error,
  autoTranslate
}) {
  return (
    <div className="text-areas-container">
      {/* Source text area */}
      <div className="text-area-wrapper">
        <textarea
          className="source-text"
          placeholder="Nhập văn bản cần dịch"
          value={text}
          onChange={handleTextChange}
        ></textarea>
        <div className="text-controls">
          <span className="char-count">{charCount}/5000</span>
          <div className="text-buttons">
            {!autoTranslate && (
              <button 
                className="translate-button" 
                onClick={handleTranslate} 
                disabled={!text.trim() || isTranslating}
              >
                {isTranslating ? "Đang dịch..." : "Dịch"}
              </button>
            )}
            <button 
              className="clear-button" 
              onClick={clearText}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      
      {/* Target text area */}
      <div className="text-area-wrapper">
        <div className="target-header">
          Bản dịch {isTranslating && <span className="translating">(đang dịch...)</span>}
        </div>
        <textarea
          className="target-text"
          value={translatedText}
          readOnly
        ></textarea>
        <div className="text-controls">
          <div className="text-buttons">
            {translatedText && (
              <button 
                className="mic-button" 
                onClick={() => navigator.clipboard.writeText(translatedText)}
                title="Sao chép bản dịch"
              >
                📋
              </button>
            )}
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
