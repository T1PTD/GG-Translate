import React, { useState } from 'react';

export const LanguageControls = ({
  selectedSourceLang,
  selectedTargetLang,
  setSelectedSourceLang,
  setSelectedTargetLang,
  swapLanguages,
}) => {
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);

  const commonLanguages = ["English", "Vietnamese", "Chinese", "French", "German", "Japanese", "Korean", "Spanish"];
  
  const handleSourceLanguageSelect = (lang) => {
    setSelectedSourceLang(lang);
    setSourceDropdownOpen(false);
  };

  const handleTargetLanguageSelect = (lang) => {
    setSelectedTargetLang(lang);
    setTargetDropdownOpen(false);
  };

  return (
    <div className="language-container">
      <div className="language-selection-area">
        {/* Source language */}
        <div className="language-section source-lang">
          <div 
            className="selected-language" 
            onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
          >
            {selectedSourceLang}
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {sourceDropdownOpen && (
            <div className="language-options">
              <div className="language-option" onClick={() => handleSourceLanguageSelect("Language detection")}>
                Auto detect
              </div>
              <div className="language-options-grid">
                {commonLanguages.map((lang) => (
                  <div 
                    key={lang} 
                    className={`language-option ${selectedSourceLang === lang ? "active" : ""}`}
                    onClick={() => handleSourceLanguageSelect(lang)}
                  >
                    {lang}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap button */}
        <button className="swap-button" onClick={swapLanguages}>
          <span className="swap-icon">⇄</span>
        </button>

        {/* Target language */}
        <div className="language-section target-lang">
          <div 
            className="selected-language" 
            onClick={() => setTargetDropdownOpen(!targetDropdownOpen)}
          >
            {selectedTargetLang}
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {targetDropdownOpen && (
            <div className="language-options">
              <div className="language-options-grid">
                {commonLanguages.map((lang) => (
                  <div 
                    key={lang} 
                    className={`language-option ${selectedTargetLang === lang ? "active" : ""}`}
                    onClick={() => handleTargetLanguageSelect(lang)}
                  >
                    {lang}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
