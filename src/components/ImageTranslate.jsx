import React, { useState, useRef } from "react";
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
  const [activeTab, setActiveTab] = useState("original"); // "original" hoặc "translated"
  
  const fileInputRef = useRef(null);
  const pasteAreaRef = useRef(null);

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Xử lý khi người dùng kéo thả file
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Xử lý khi người dùng paste ảnh
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

  // Xử lý file ảnh đã chọn
  const processImageFile = (file) => {
    if (!file) return;
    
    // Kiểm tra định dạng file
    if (!file.type.match('image.*')) {
      setError("Vui lòng chọn file hình ảnh");
      return;
    }
    
    // Tạo URL để hiển thị preview
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
    setSelectedImage(file);
    setExtractedText("");
    setTranslatedText("");
    setError(null);
  };

  // Xử lý OCR để trích xuất văn bản từ ảnh
  const extractTextFromImage = async () => {
    if (!previewUrl) return;
    
    setIsProcessing(true);
    setOcrProgress(0);
    setError(null);
    
    try {
      // Xác định ngôn ngữ OCR dựa trên ngôn ngữ nguồn
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
      
      // Sử dụng Tesseract.recognize thay vì createWorker
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
      
      // Lấy văn bản đã trích xuất
      const text = result.data.text;
      setExtractedText(text);
      
      // Dịch văn bản đã trích xuất
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

  // Xử lý khi người dùng thay đổi ngôn ngữ nguồn
  const handleSourceLanguageChange = (e) => {
    setSelectedSourceLang(e.target.value);
  };

  // Xử lý khi người dùng thay đổi ngôn ngữ đích
  const handleTargetLanguageChange = (e) => {
    setSelectedTargetLang(e.target.value);
  };

  // Xử lý khi người dùng nhấn nút "Chọn ảnh từ thiết bị"
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Xử lý khi người dùng nhấn nút "Dán ảnh từ clipboard"
  const handleClipboardClick = () => {
    if (pasteAreaRef.current) {
      pasteAreaRef.current.focus();
    }
  };

  // Xử lý khi người dùng nhấn nút "Xóa ảnh"
  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setExtractedText("");
    setTranslatedText("");
    setError(null);
  };

  // Xử lý khi người dùng nhấn nút "Copy văn bản"
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép văn bản vào clipboard!");
  };

  // Ngăn chặn hành vi mặc định khi kéo thả
  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
                  <option value="English">Tiếng Anh</option>
                  <option value="Vietnamese">Tiếng Việt</option>
                  <option value="Chinese">Tiếng Trung</option>
                  <option value="Japanese">Tiếng Nhật</option>
                  <option value="Korean">Tiếng Hàn</option>
                  <option value="French">Tiếng Pháp</option>
                  <option value="German">Tiếng Đức</option>
                  <option value="Spanish">Tiếng Tây Ban Nha</option>
                </select>
              </div>
              <div className="language-swap">
                <button className="swap-button" onClick={() => {
                  const temp = selectedSourceLang;
                  setSelectedSourceLang(selectedTargetLang);
                  setSelectedTargetLang(temp);
                }}>
                  ⇄
                </button>
              </div>
              <div className="language-selector">
                <label>Dịch sang:</label>
                <select value={selectedTargetLang} onChange={handleTargetLanguageChange}>
                  <option value="Vietnamese">Tiếng Việt</option>
                  <option value="English">Tiếng Anh</option>
                  <option value="Chinese">Tiếng Trung</option>
                  <option value="Japanese">Tiếng Nhật</option>
                  <option value="Korean">Tiếng Hàn</option>
                  <option value="French">Tiếng Pháp</option>
                  <option value="German">Tiếng Đức</option>
                  <option value="Spanish">Tiếng Tây Ban Nha</option>
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
