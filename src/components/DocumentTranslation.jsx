import React, { useState, useRef } from "react";

export const DocumentTranslation = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // For simplicity, we're just storing the file name
      // In a real app, you'd want to process/preview the document
      setFilePreview({
        name: file.name,
        type: file.type,
        size: file.size,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview({
        name: file.name,
        type: file.type,
        size: file.size,
      });
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return "📊";
    if (fileType.includes("presentation") || fileType.includes("powerpoint"))
      return "📊";
    return "📄";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      {!filePreview ? (
        <div
          className="document-translation-container"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="document-upload-options">
            <div className="document-title">Or select a file</div>
            <button className="browse-files-btn" onClick={handleBrowseClick}>
              Browse files
            </button>
            <div className="supported-document-formats">
                Supported file types: .docx, .pdf, .pptx, .xlsx
              <a href="#" className="document-learn-more">
                Learn more
              </a>
            </div>
          </div>
          <input
            type="file"
            accept=".docx,.pdf,.pptx,.xlsx"
            className="hidden-document-input"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="document-preview-container">
          <div className="document-preview-toolbar">
            <button className="document-action-btn" onClick={handleClearFile}>
              <span className="document-action-icon">🗑️</span>
              delete
            </button>
          </div>
          <div className="document-preview">
            <div style={{ padding: "20px" }}>
              <h3>
                <span style={{ marginRight: "10px" }}>
                  {getFileIcon(selectedFile.type)}
                </span>
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </h3>
              <p style={{ marginTop: "20px" }}>Processing document...</p>
            </div>
          </div>
        </div>
      )}

      {/* Phần lịch sử và đã lưu */}
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

      <div className="document-feedback-text">Send feedback</div>
    </>
  );
};
