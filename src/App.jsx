import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { Header } from "./components/Header";
import { TranslationTabs } from "./components/TranslationTabs";
import { LanguageControls } from "./components/LanguageControls";
import { TranslationPanel } from "./components/TranslationPanel";
import { translateWithOpenAI, checkAPIKey } from "./services/openaiTranslation";
import debounce from "lodash.debounce";

function App() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedSourceLang, setSelectedSourceLang] = useState("English");
  const [selectedTargetLang, setSelectedTargetLang] = useState("Vietnamese");
  const [activeTab, setActiveTab] = useState("text");
  const [charCount, setCharCount] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState({ checked: false, valid: false });
  const [error, setError] = useState(null);
  const [autoTranslate, setAutoTranslate] = useState(true); // Thêm state cho chế độ tự động dịch

  // Tạo hàm dịch sử dụng debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedTranslate = useCallback(
    debounce(async (currentText, sourceLang, targetLang) => {
      if (!currentText || currentText.trim() === '') {
        setTranslatedText('');
        return;
      }
      
      try {
        setIsTranslating(true);
        setError(null);
        
        // Gọi API dịch
        const result = await translateWithOpenAI(
          currentText,
          sourceLang,
          targetLang
        );
        
        // Xử lý kết quả
        if (result && result.startsWith("Error:")) {
          setError(result);
          setTranslatedText("");
        } else {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error("Auto translation failed:", error);
        setError(`Lỗi dịch tự động: ${error.message || "Lỗi không xác định"}`);
        setTranslatedText("");
      } finally {
        setIsTranslating(false);
      }
    }, 1000), // Đợi 1 giây sau khi người dùng ngừng gõ
    []
  );

 // Trong hàm useEffect kiểm tra API
useEffect(() => {
  const status = checkAPIKey();
  setApiKeyStatus({ checked: true, valid: status.exists && status.valid });
  
  if (!status.exists) {
    setError("OpenRouter API key không tìm thấy. Vui lòng kiểm tra file .env của bạn.");
  } else if (!status.valid) {
    setError("API key không hợp lệ. API key phải đủ dài.");
  }
}, []);

// Trong phần hiển thị thông báo lỗi
// Trong phần hiển thị thông báo lỗi API
if (apiKeyStatus.checked && !apiKeyStatus.valid) {
  return (
    <div className="App">
      <Header />
      <div className="api-error-container" style={{ 
        padding: "20px", 
        margin: "20px", 
        backgroundColor: "#FEF2F2", 
        border: "1px solid #F87171",
        borderRadius: "5px"
      }}>
        <h2>Lỗi cấu hình API</h2>
        <p>{error}</p>
        <p>Vui lòng thêm OpenRouter API key hợp lệ vào file .env của bạn:</p>
        <pre>VITE_OPENROUTER_API_KEY=your_api_key_here</pre>
        <p>Sau đó khởi động lại server.</p>
      </div>
    </div>
  );
}


  // Theo dõi thay đổi văn bản và dịch tự động
  useEffect(() => {
    if (autoTranslate && text.trim() !== '') {
      debouncedTranslate(text, selectedSourceLang, selectedTargetLang);
    }
    
    return () => {
      // Hủy translate nếu component unmount hoặc text thay đổi trước khi debounce time
      debouncedTranslate.cancel();
    };
  }, [text, selectedSourceLang, selectedTargetLang, autoTranslate, debouncedTranslate]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
    
    // Nếu xóa hết văn bản, xóa luôn bản dịch
    if (!newText || newText.trim() === '') {
      setTranslatedText('');
      setError(null);
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) return;
    
    try {
      setError(null);
      setIsTranslating(true);
      setTranslatedText("Đang dịch...");
      
      // Gọi service dịch
      const result = await translateWithOpenAI(
        text,
        selectedSourceLang,
        selectedTargetLang
      );
      
      // Xử lý kết quả
      if (result && result.startsWith("Error:")) {
        setError(result);
        setTranslatedText("");
      } else {
        setTranslatedText(result);
      }
    } catch (error) {
      console.error("Translation failed:", error);
      setError(`Lỗi dịch: ${error.message || "Lỗi không xác định"}`);
      setTranslatedText("");
    } finally {
      setIsTranslating(false);
    }
  };

  const clearText = () => {
    setText("");
    setTranslatedText("");
    setCharCount(0);
    setError(null);
  };
  
  // Các hàm và JSX còn lại giữ nguyên
  
  const swapLanguages = async () => {
    // Không swap nếu ngôn ngữ nguồn là auto detect
    if (selectedSourceLang === "Language detection") {
      return;
    }
  
    // Lưu các giá trị trước khi swap
    const newSourceLang = selectedTargetLang;
    const newTargetLang = selectedSourceLang;
    const previousText = text;
    const previousTranslation = translatedText;
  
    // Cập nhật state các ngôn ngữ
    setSelectedSourceLang(newSourceLang);
    setSelectedTargetLang(newTargetLang);
  
    // Nếu có cả text nguồn và bản dịch
    if (previousText && previousTranslation) {
      // Đặt bản dịch cũ vào ô text nguồn
      setText(previousTranslation);
      setCharCount(previousTranslation.length);
      
      // Tự động bắt đầu dịch ngược lại
      try {
        setError(null);
        setIsTranslating(true);
        setTranslatedText("Đang dịch..."); // Hiện thông báo đang dịch
        
        // Dịch bản dịch trước đó ngược lại ngôn ngữ gốc ban đầu
        const result = await translateWithOpenAI(
          previousTranslation, // Text đang ở ô dịch
          newSourceLang,       // Ngôn ngữ nguồn mới (trước đây là đích)
          newTargetLang        // Ngôn ngữ đích mới (trước đây là nguồn)
        );
        
        // Xử lý kết quả
        if (result && result.startsWith("Error:")) {
          setError(result);
          setTranslatedText("");
        } else {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error("Translation after swap failed:", error);
        setError(`Lỗi dịch sau khi hoán đổi: ${error.message || "Lỗi không xác định"}`);
        setTranslatedText("");
      } finally {
        setIsTranslating(false);
      }
    }
  };
  

  // Hiển thị thông báo lỗi API key
  if (apiKeyStatus.checked && !apiKeyStatus.valid) {
    return (
      <div className="App">
        <Header />
        <div className="api-error-container" style={{ 
          padding: "20px", 
          margin: "20px", 
          backgroundColor: "#FEF2F2", 
          border: "1px solid #F87171",
          borderRadius: "5px"
        }}>
          <h2>Lỗi cấu hình API</h2>
          <p>{error}</p>
          <p>Vui lòng thêm OpenAI API key hợp lệ vào file .env của bạn:</p>
          <pre>VITE_OPENAI_API_KEY=your_api_key_here</pre>
          <p>Sau đó khởi động lại server.</p>
        </div>
      </div>
    );
  }

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
                <label className="auto-translate-label">
                  <input
                    type="checkbox"
                    checked={autoTranslate}
                    onChange={() => setAutoTranslate(!autoTranslate)}
                  />
                  <span className="toggle-text">Tự động dịch khi gõ</span>
                </label>
              </div>
              <TranslationPanel
                text={text}
                translatedText={translatedText}
                handleTextChange={handleTextChange}
                charCount={charCount}
                clearText={clearText}
                handleTranslate={handleTranslate}
                isTranslating={isTranslating}
                error={error}
                autoTranslate={autoTranslate}
              />
            </>
          )}
          {activeTab === "image" && (
            <div className="coming-soon">Image translation coming soon</div>
          )}
          {activeTab === "document" && (
            <div className="coming-soon">Document translation coming soon</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
