import React, { useState, useRef } from "react";

export const ImageTranslation = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], "pasted-image.png", { type });
            setSelectedImage(file);
            const imageUrl = URL.createObjectURL(blob);
            setPreviewUrl(imageUrl);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      alert("Please use Ctrl+V to paste image from clipboard");
    }
  };

  return (
    <>
      <div className="image-translation-container">
        {!previewUrl ? (
          <div
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-cloud-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
            </div>
            <div className="upload-text">Drag and Drop</div>
            <div className="upload-options">
              <div className="upload-title">Or select a file</div>
              <button className="upload-btn" onClick={handleBrowseClick}>
                Browse files
              </button>
              <button
                className="clipboard-btn"
                onClick={handlePasteFromClipboard}
              >
                <span className="clipboard-icon">📋</span>
                Paste file from clipboard
              </button>
              <div className="supported-formats">
                  Supported file types: .jpg, .jpeg, .png
                <a href="#" className="learn-more-link">
                  Learn more
                </a>
              </div>
            </div>
            <input
              type="file"
              accept="image/jpeg, image/png"
              className="hidden-file-input"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
          </div>
        ) : (
          <div className="preview-container">
            <div className="preview-toolbar">
              <button className="preview-action-btn" onClick={handleClearImage}>
                <span className="preview-action-icon">🗑️</span>
                Delete
              </button>
            </div>
            <img src={previewUrl} alt="Preview" className="image-preview" />
          </div>
        )}
      </div>

      {/* Thêm phần lịch sử và đã lưu */}
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

      <div className="feedback-text">Send feedback</div>
    </>
  );
};
