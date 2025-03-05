import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import "./App.css";
import { Header } from "./components/Header";
import { TranslationTabs } from "./components/TranslationTabs";
import { LanguageControls } from "./components/LanguageControls";
import { TranslationPanel } from "./components/TranslationPanel";
import { translateWithGemini } from "./services/openaiTranslation";

function App() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedSourceLang, setSelectedSourceLang] = useState("English");
  const [selectedTargetLang, setSelectedTargetLang] = useState("Vietnamese");
  const [activeTab, setActiveTab] = useState("text");
  const [charCount, setCharCount] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [autoTranslate, setAutoTranslate] = useState(true);

  const debouncedTranslate = useCallback(
    debounce(async (currentText, sourceLang, targetLang) => {
      if (!currentText.trim()) {
        setTranslatedText("");
        return;
      }
    
      try {
        setIsTranslating(true);
        setError(null);
        const result = await translateWithGemini(currentText, sourceLang, targetLang);
        setTranslatedText(result.startsWith("Error:") ? "" : result);
      } catch (error) {
        setError(`Lỗi dịch: ${error.message || "Lỗi không xác định"}`);
      } finally {
        setIsTranslating(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    if (autoTranslate && text.trim()) {
      debouncedTranslate(text, selectedSourceLang, selectedTargetLang);
    }
    return () => debouncedTranslate.cancel();
  }, [text, selectedSourceLang, selectedTargetLang, autoTranslate, debouncedTranslate]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
    if (!newText.trim()) setTranslatedText("");
  };

  const handleTranslate = async () => {
 
    try {
      setIsTranslating(true);
      setTranslatedText("Đang dịch...");
      const result = await translateWithGemini(text, selectedSourceLang, selectedTargetLang);
      setTranslatedText(result.startsWith("Error:") ? "" : result);
    } catch (error) {
      setError(`Lỗi dịch: ${error.message || "Lỗi không xác định"}`);
    } finally {
      setIsTranslating(false);
    }
  };
  

  const swapLanguages = async () => {
    if (selectedSourceLang === "Language detection") return;
    const newSourceLang = selectedTargetLang;
    const newTargetLang = selectedSourceLang;
    setSelectedSourceLang(newSourceLang);
    setSelectedTargetLang(newTargetLang);
    if (text && translatedText) {
      setText(translatedText);
      setCharCount(translatedText.length);
      await handleTranslate();
    }
  };

  return (
    <div className="App">
      <Header />
      <div className="translation-section">
        <TranslationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="translate-container">
          <LanguageControls
            selectedSourceLang={selectedSourceLang}
            selectedTargetLang={selectedTargetLang}
            setSelectedSourceLang={setSelectedSourceLang}
            setSelectedTargetLang={setSelectedTargetLang}
            swapLanguages={swapLanguages}
          />
          {activeTab === "text" && (
            <>
              <div className="auto-translate-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={autoTranslate}
                    onChange={() => setAutoTranslate(!autoTranslate)}
                  />
                  Tự động dịch khi gõ
                </label>
              </div>
              <TranslationPanel
                text={text}
                translatedText={translatedText}
                handleTextChange={handleTextChange}
                charCount={charCount}
                handleTranslate={handleTranslate}
                isTranslating={isTranslating}
                error={error}
              />
            </>
          )}
          {activeTab === "image" && <div className="coming-soon">Image translation coming soon</div>}
          {activeTab === "document" && <div className="coming-soon">Document translation coming soon</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
