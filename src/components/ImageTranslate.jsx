import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { translateWithGemini } from "../services/openaiTranslation";

export function ImageTranslation() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSourceLang, setSelectedSourceLang] = useState("English");
  const [selectedTargetLang, setSelectedTargetLang] = useState("Vietnamese");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("original"); // "original" or "translated"
  
  const fileInputRef = useRef(null);
  const pasteAreaRef = useRef(null);

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

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Handle paste from clipboard
  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        processImageFile(blob);
        break;
      }
    }
  };

  // Process the selected image file
  const processImageFile = (file) => {
    if (!file) return;
    
    // Check file format
    if (!file.type.match('image.*')) {
      setError("Vui lòng chọn file hình ảnh");
      return;
    }
    
    // Create URL for preview
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
    setSelectedImage(file);
    setExtractedText("");
    setTranslatedText("");
    setError(null);
  };

  // Extract text from image using OCR
  const extractTextFromImage = async () => {
    if (!previewUrl) return;
    
    setIsProcessing(true);
    setOcrProgress(0);
    setError(null);
    
    try {
      // Determine OCR language based on source language
      const langMap = {
        'English': 'eng',
        'Vietnamese': 'vie',
        'Chinese': 'chi_sim',
        'Japanese': 'jpn',
        'Korean': 'kor',
        'French': 'fra',
        'German': 'deu',
        'Spanish': 'spa'
      };
      
      const ocrLang = langMap[selectedSourceLang] || 'eng';
      
      // Use Tesseract.recognize
      const result = await Tesseract.recognize(
        previewUrl,
        ocrLang,
        {
          logger: info => {
            if (info.status === 'recognizing text') {
              setOcrProgress(Math.round(info.progress * 100));
            }
          }
        }
      );
      
      // Get extracted text
      const text = result.data.text;
      setExtractedText(text);
      
      // Translate extracted text
      if (text.trim()) {
        try {
          const translated = await translateWithGemini(
            text,
            selectedSourceLang,
            selectedTargetLang
          );
          setTranslatedText(translated);
        } catch (translationError) {
          console.error("Translation error:", translationError);
          setError(`Lỗi khi dịch văn bản: ${translationError.message}`);
        }
      }
      
    } catch (err) {
      console.error("OCR error:", err);
      setError(`Lỗi khi xử lý ảnh: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle source language change
  const handleSourceLanguageChange = (e) => {
    setSelectedSourceLang(e.target.value);
  };

  // Handle target language change
  const handleTargetLanguageChange = (e) => {
    setSelectedTargetLang(e.target.value);
  };

  // Get available target languages (exclude the source language)
  const getTargetLanguages = () => {
    return supportedLanguages.filter(lang => lang.value !== selectedSourceLang);
  };

  // Handle browse button click
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Handle clipboard button click
  const handleClipboardClick = () => {
    if (pasteAreaRef.current) {
      pasteAreaRef.current.focus();
    }
  };

  // Handle clear image button click
  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setExtractedText("");
    setTranslatedText("");
    setError(null);
  };

  // Handle copy text button click
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép văn bản vào clipboard!");
  };

  // Prevent default behavior for drag and drop
  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Swap languages
  const swapLanguages = () => {
    const temp = selectedSourceLang;
    setSelectedSourceLang(selectedTargetLang);
    setSelectedTargetLang(temp);
  };

  return (
    <div className="image-translation">
      {!previewUrl ? (
        <div 
          className="upload-area" 
          onDrop={handleDrop}
          onDragOver={preventDefault}
          onDragEnter={preventDefault}
          onPaste={handlePaste}
          ref={pasteAreaRef}
          tabIndex="0"
        >
          <div className="upload-cloud-icon">
            <span role="img" aria-label="upload">🖼️</span>
          </div>
          <div className="upload-text">Kéo thả hoặc dán ảnh vào đây</div>
          <div className="upload-options">
            <button className="upload-btn" onClick={handleBrowseClick}>
              Chọn ảnh từ thiết bị
            </button>
            <button className="clipboard-btn" onClick={handleClipboardClick}>
              <span className="clipboard-icon">📋</span>
              Dán ảnh từ clipboard
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden-file-input"
            />
            <div className="supported-formats">
              Hỗ trợ: JPG, PNG, GIF, BMP, WEBP
              <a href="#" className="learn-more-link">Tìm hiểu thêm</a>
            </div>
          </div>
        </div>
      ) : (
        <div className="image-translation-result">
          <div className="image-translation-header">
            <div className="language-selection">
              <div className="language-selector">
                <label>Ngôn ngữ trong ảnh:</label>
                <select value={selectedSourceLang} onChange={handleSourceLanguageChange}>
                  {supportedLanguages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="language-swap">
                <button className="swap-button" onClick={swapLanguages}>
                  ⇄
                </button>
              </div>
              <div className="language-selector">
                <label>Dịch sang:</label>
                <select value={selectedTargetLang} onChange={handleTargetLanguageChange}>
                  {getTargetLanguages().map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="image-actions">
              <button 
                className="translate-button" 
                onClick={extractTextFromImage}
                disabled={isProcessing || !selectedImage}
              >
                {isProcessing ? `Đang xử lý... ${ocrProgress}%` : "Trích xuất & Dịch"}
              </button>
              <button className="clear-button" onClick={handleClearImage}>
                Xóa ảnh
              </button>
            </div>
          </div>

          <div className="image-translation-content">
            <div className="image-preview-container">
              <img src={previewUrl} alt="Preview" className="image-preview" />
            </div>
            
            <div className="text-result-container">
              <div className="text-result-tabs">
                <button 
                  className={`tab-button ${activeTab === 'original' ? 'active' : ''}`}
                  onClick={() => setActiveTab('original')}
                >
                  Văn bản gốc
                </button>
                <button 
                  className={`tab-button ${activeTab === 'translated' ? 'active' : ''}`}
                  onClick={() => setActiveTab('translated')}
                >
                  Bản dịch
                </button>
              </div>
              
              <div className="text-result-content">
                {activeTab === 'original' ? (
                  <div className="text-result">
                    <textarea 
                      value={extractedText} 
                      readOnly 
                      placeholder="Văn bản trích xuất từ ảnh sẽ hiển thị ở đây..."
                      className="text-result-area"
                    />
                    {extractedText && (
                      <button 
                        className="copy-button" 
                        onClick={() => handleCopyText(extractedText)}
                      >
                        📋 Sao chép văn bản gốc
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-result">
                    <textarea 
                      value={translatedText} 
                      readOnly 
                      placeholder="Bản dịch sẽ hiển thị ở đây..."
                      className="text-result-area"
                    />
                    {translatedText && (
                      <button 
                        className="copy-button" 
                        onClick={() => handleCopyText(translatedText)}
                      >
                        📋 Sao chép bản dịch
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
}
