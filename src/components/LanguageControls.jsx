import React, { useState } from "react";

export function LanguageControls({
  selectedSourceLang,
  selectedTargetLang,
  setSelectedSourceLang,
  setSelectedTargetLang,
  swapLanguages,
  supportedLanguages,
  getTargetLanguages
}) {
  const [showSourceOptions, setShowSourceOptions] = useState(false);
  const [showTargetOptions, setShowTargetOptions] = useState(false);

  const handleSourceLanguageSelect = (lang) => {
    setSelectedSourceLang(lang);
    setShowSourceOptions(false);
  };

  const handleTargetLanguageSelect = (lang) => {
    setSelectedTargetLang(lang);
    setShowTargetOptions(false);
  };

  const getLanguageLabel = (value) => {
    const language = supportedLanguages.find(lang => lang.value === value);
    return language ? language.label : value;
  };

  return (
    <div className="language-container">
      <div className="language-selection-area">
        <div className="language-section">
          <div
            className="selected-language"
            onClick={() => setShowSourceOptions(!showSourceOptions)}
          >
            {getLanguageLabel(selectedSourceLang)}
            <span className="dropdown-arrow">▼</span>
          </div>
          {showSourceOptions && (
            <div className="language-options">
              <div className="language-options-grid">
                {supportedLanguages.map((lang) => (
                  <div
                    key={lang.value}
                    className={`language-option ${
                      selectedSourceLang === lang.value ? "active" : ""
                    }`}
                    onClick={() => handleSourceLanguageSelect(lang.value)}
                  >
                    {lang.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="swap-button" onClick={swapLanguages}>
          <span className="swap-icon">⇄</span>
        </button>

        <div className="language-section">
          <div
            className="selected-language"
            onClick={() => setShowTargetOptions(!showTargetOptions)}
          >
            {getLanguageLabel(selectedTargetLang)}
            <span className="dropdown-arrow">▼</span>
          </div>
          {showTargetOptions && (
            <div className="language-options">
              <div className="language-options-grid">
                {getTargetLanguages().map((lang) => (
                  <div
                    key={lang.value}
                    className={`language-option ${
                      selectedTargetLang === lang.value ? "active" : ""
                    }`}
                    onClick={() => handleTargetLanguageSelect(lang.value)}
                  >
                    {lang.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
