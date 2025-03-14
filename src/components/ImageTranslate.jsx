
import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { translateWithGemini } from "../services/openaiTranslation";

export const ImageTranslation = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("Vietnamese"); // Ngôn ngữ đích mặc định
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      processImageText(file);
    }
  };

  const processImageText = async (imageFile) => {
    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(imageFile, "eng");
      setExtractedText(text);
    } catch (error) {
      console.error("OCR error:", error);
    }
    setIsProcessing(false);
  };

  const handleTranslate = async () => {
    if (!extractedText) return;
    setIsProcessing(true);
    try {
      const translated = await translateWithGemini(extractedText, "English", targetLanguage);
      setTranslatedText(translated);
    } catch (error) {
      console.error("Translation error:", error);
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Dịch Văn Bản Từ Hình Ảnh</h2>

      {/* Chọn ảnh */}
      <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
        Chọn hình ảnh
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageSelect}
        />
      </label>

      {/* Hiển thị ảnh đã chọn */}
      {previewUrl && (
        <img src={previewUrl} alt="Preview" className="mt-4 w-full rounded-lg shadow-md" />
      )}

      {/* Xử lý OCR */}
      {isProcessing ? (
        <p className="text-blue-600 mt-4">Đang xử lý...</p>
      ) : (
        <>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="Văn bản trích xuất..."
            className="mt-4 w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />

          {/* Chọn ngôn ngữ đích */}
          <label className="block mt-4 font-semibold">Chọn ngôn ngữ dịch:</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="mt-2 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Vietnamese">Tiếng Việt</option>
            <option value="French">Tiếng Pháp</option>
            <option value="Spanish">Tiếng Tây Ban Nha</option>
            <option value="Japanese">Tiếng Nhật</option>
            <option value="Chinese">Tiếng Trung</option>
            <option value="Korean">Tiếng Hàn</option>
          </select>

          {/* Nút dịch */}
          <button
            onClick={handleTranslate}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            Dịch
          </button>
        </>
      )}

      {/* Kết quả dịch */}
      {translatedText && (
        <div className="mt-4 p-4 bg-gray-100 border rounded-md">
          <h3 className="text-lg font-semibold text-gray-700">Bản dịch:</h3>
          <p className="text-gray-800 mt-2">{translatedText}</p>
        </div>
      )}
    </div>
  );
};