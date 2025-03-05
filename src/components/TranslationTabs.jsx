import React from 'react';

export const TranslationTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === "text" ? "active" : ""}`}
        onClick={() => setActiveTab("text")}
      >
        <span className="tab-icon">📝</span>
        Văn bản
      </button>
      <button
        className={`tab ${activeTab === "image" ? "active" : ""}`}
        onClick={() => setActiveTab("image")}
      >
        <span className="tab-icon">🖼️</span>
        Hình ảnh
      </button>
      <button
        className={`tab ${activeTab === "document" ? "active" : ""}`}
        onClick={() => setActiveTab("document")}
      >
        <span className="tab-icon">📄</span>
        Tài liệu
      </button>
    </div>
  );
};
