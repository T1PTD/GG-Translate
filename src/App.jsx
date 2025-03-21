import React, { useState, useEffect } from "react";
import { TranslationTabs } from "./components/TranslationTabs";
import { LanguageControls } from "./components/LanguageControls";
import { TranslationPanel } from "./components/TranslationPanel";
import { ImageTranslation } from "./components/ImageTranslate";
import { DocumentTranslation } from "./components/DocumentTranslation";
import { translateWithGemini } from "./services/openaiTranslation";
import { saveTranslation } from "./services/translationHistory";
import { RecentTranslations } from "./components/RecentTranslations";
import { TranslationHistory } from "./components/TranslationHistory";
import debounce from "lodash.debounce";

function App() {
  const [activeTab, setActiveTab] = useState("text");
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedSourceLang, setSelectedSourceLang] = useState("English");
  const [selectedTargetLang, setSelectedTargetLang] = useState("Vietnamese");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [recentTranslation, setRecentTranslation] = useState(null);
  const [savedTranslation, setSavedTranslation] = useState(null);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  // Supported languages
  const supportedLanguages = [
    { value: "English", label: "Tiếng Anh" },
    { value: "Vietnamese", label: "Tiếng Việt" },
    { value: "Chinese", label: "Tiếng Trung" },
    { value: "Japanese", label: "Tiếng Nhật" },
    { value: "Korean", label: "Tiếng Hàn" },
    { value: "French", label: "Tiếng Pháp" },
    { value: "German", label: "Tiếng Đức" },
    { value: "Spanish", label: "Tiếng Tây Ban Nha" }
  ];

  // Effect to update target language if it's the same as source language
  useEffect(() => {
    if (selectedSourceLang === selectedTargetLang) {
      // Find the first language that's not the source language
      const differentLang = supportedLanguages.find(lang => lang.value !== selectedSourceLang);
      if (differentLang) {
        setSelectedTargetLang(differentLang.value);
      }
    }
  }, [selectedSourceLang]);

  // Debounce the translation function
  const debouncedTranslate = debounce(async (text) => {
    if (!text.trim()) {
      setTranslatedText("");
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateWithGemini(
        text,
        selectedSourceLang,
        selectedTargetLang
      );
      setTranslatedText(result);
      
      // Save to translation history
      const savedEntry = saveTranslation(
        text, 
        result, 
        selectedSourceLang, 
        selectedTargetLang
      );
      
      if (savedEntry) {
        setRecentTranslation(savedEntry);
      }
      
      setError(null);
    } catch (err) {
      setError("Translation failed: " + err.message);
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  }, 1000);

  // Effect to trigger translation when text or languages change
  useEffect(() => {
    if (autoTranslate && text.trim()) {
      debouncedTranslate(text);
    } else if (!text.trim()) {
      // Nếu văn bản trống, xóa luôn bản dịch
      setTranslatedText("");
    }
    
    return () => {
      debouncedTranslate.cancel();
    };
  }, [text, selectedSourceLang, selectedTargetLang, autoTranslate]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    // Nếu người dùng xóa hết văn bản, xóa luôn bản dịch
    if (!newText.trim()) {
      setTranslatedText("");
    }
  };

  const handleTranslate = () => {
    debouncedTranslate.cancel();
    debouncedTranslate(text);
  };

  const clearText = () => {
    setText("");
    setTranslatedText("");
  };

  // Get available target languages (exclude the source language)
  const getTargetLanguages = () => {
    return supportedLanguages.filter(lang => lang.value !== selectedSourceLang);
  };

  // Updated swapLanguages function
  const swapLanguages = () => {
    // Don't swap if source is auto-detect
    if (selectedSourceLang === "Language detection") return;

    setSelectedSourceLang(selectedTargetLang);
    setSelectedTargetLang(selectedSourceLang);

    // Also swap the text if there's translated content
    if (translatedText) {
      setText(translatedText);
      setTranslatedText(text);
    }
  };

  // Handle source language change
  const handleSourceLanguageChange = (newLang) => {
    setSelectedSourceLang(newLang);
    // Target language will be updated by the useEffect if needed
  };

  // Handle target language change
  const handleTargetLanguageChange = (newLang) => {
    setSelectedTargetLang(newLang);
  };

  // Toggle history sidebar
  const toggleHistorySidebar = () => {
    setIsHistorySidebarOpen(!isHistorySidebarOpen);
  };

  return (
    <div className={`App ${isHistorySidebarOpen ? 'sidebar-open' : ''}`}>
      <header className="App-header">
        <div className="header-left">
          <button className="menu-button">☰</button>
          <div className="logo">
            <span className="google-logo">Google</span>
            <span className="translate-text">Translate</span>
          </div>
        </div>
        <div className="header-right">
          <button className="settings-button">⚙️</button>
          <div className="profile-circle"></div>
        </div>
      </header>

      <TranslationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="translation-section">
        {activeTab === "text" && (
          <>
            <div className="auto-translate-toggle">
              <label className="auto-translate-label">
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={() => setAutoTranslate(!autoTranslate)}
                />
                <span className="toggle-text">Tự động dịch</span>
              </label>
            </div>
            <LanguageControls
              selectedSourceLang={selectedSourceLang}
              selectedTargetLang={selectedTargetLang}
              setSelectedSourceLang={handleSourceLanguageChange}
              setSelectedTargetLang={handleTargetLanguageChange}
              swapLanguages={swapLanguages}
              supportedLanguages={supportedLanguages}
              getTargetLanguages={getTargetLanguages}
            />
            <TranslationPanel
              text={text}
              translatedText={translatedText}
              handleTextChange={handleTextChange}
              charCount={text.length}
              clearText={clearText}
              handleTranslate={handleTranslate}
              isTranslating={isTranslating}
              error={error}
              autoTranslate={autoTranslate}
              selectedSourceLang={selectedSourceLang}
              selectedTargetLang={selectedTargetLang} 
            />
            
            {/* Add translation history and feedback */}
            <RecentTranslations 
              recentTranslation={recentTranslation}
              savedTranslation={savedTranslation}
              onViewHistory={toggleHistorySidebar}
            />
            <div className="feedback-text">Send feedback</div>
          </>
        )}
        {activeTab === "document" && <DocumentTranslation />}
        {activeTab === "image" && <ImageTranslation />}
      </main>

      {/* Translation History Sidebar */}
      <TranslationHistory 
        isOpen={isHistorySidebarOpen} 
        onClose={() => setIsHistorySidebarOpen(false)} 
      />
    </div>
  );
}

export default App;
