import React, { useState, useEffect } from "react";
import { TranslationTabs } from "./components/TranslationTabs";
import { LanguageControls } from "./components/LanguageControls";
import { TranslationPanel } from "./components/TranslationPanel";
import { ImageTranslation } from "./components/ImageTranslate";
import { DocumentTranslation } from "./components/DocumentTranslation";
import { translateWithGemini } from "./services/openaiTranslation";
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

  return (
    <div className="App">
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
              setSelectedSourceLang={setSelectedSourceLang}
              setSelectedTargetLang={setSelectedTargetLang}
              swapLanguages={swapLanguages}
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
          </>
        )}
        {activeTab === "document" && <DocumentTranslation />}
        {activeTab === "image" && <ImageTranslation />}
      </main>
    </div>
  );
}

export default App;
