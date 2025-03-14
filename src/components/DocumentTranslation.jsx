import { useState } from "react";
import { translateFileWithDeepL } from "../services/deeplTranslation";
import { translateWithGemini } from "../services/openaiTranslation";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { pdfjs } from 'react-pdf';
import { jsPDF } from "jspdf";
import { parse } from 'node-html-parser';
import * as pptxgen from "pptxgenjs";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export function DocumentTranslation() {
  const [file, setFile] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [useFallback, setUseFallback] = useState(false);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("vi");

  const supportedFormats = ['.txt', '.docx', '.doc', '.pdf', '.pptx', '.ppt', '.html'];
  
  // Language options
  const languageOptions = [
    { code: "auto", name: "Tự động phát hiện" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "en", name: "Tiếng Anh" },
    { code: "zh", name: "Tiếng Trung" },
    { code: "ja", name: "Tiếng Nhật" },
    { code: "ko", name: "Tiếng Hàn" },
    { code: "fr", name: "Tiếng Pháp" },
    { code: "de", name: "Tiếng Đức" },
    { code: "ru", name: "Tiếng Nga" },
    { code: "es", name: "Tiếng Tây Ban Nha" },
    { code: "it", name: "Tiếng Ý" },
    { code: "pt", name: "Tiếng Bồ Đào Nha" },
    { code: "ar", name: "Tiếng Ả Rập" },
    { code: "hi", name: "Tiếng Hindi" },
    { code: "th", name: "Tiếng Thái" },
  ];
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      if (!supportedFormats.includes(fileExtension)) {
        setError(`Định dạng file không được hỗ trợ. Các định dạng hỗ trợ: ${supportedFormats.join(', ')}`);
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File không được vượt quá 5MB");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Read file content for text-based formats
      if (fileExtension === '.txt' || fileExtension === '.html') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFileContent(event.target.result);
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  // Extract text from DOCX files
  const extractTextFromDocx = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = await mammoth.extractRawText({
            arrayBuffer: event.target.result
          });
          resolve(result.value);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Extract text from PDF files
  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target.result);
          const pdf = await pdfjs.getDocument(typedArray).promise;
          
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
          }
          
          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Extract text from HTML files
  const extractTextFromHTML = (htmlContent) => {
    try {
      const root = parse(htmlContent);
      return root.textContent.trim();
    } catch (error) {
      throw new Error(`HTML parsing error: ${error.message}`);
    }
  };

  // Extract text from PowerPoint files (simplified - would need a specific library)
  const extractTextFromPowerPoint = async (file) => {
    // This is a placeholder - in a real implementation, you'd use a library
    // that can extract text from PowerPoint files
    throw new Error("PowerPoint extraction not implemented - using DeepL API instead");
  };

  // Extract text based on file type
  const extractTextFromFile = async (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    switch (fileExtension) {
      case '.txt':
        return fileContent;
      case '.html':
        return extractTextFromHTML(fileContent);
      case '.docx':
      case '.doc':
        return await extractTextFromDocx(file);
      case '.pdf':
        return await extractTextFromPDF(file);
      case '.pptx':
      case '.ppt':
        return await extractTextFromPowerPoint(file);
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`);
    }
  };

  // Create a DOCX file from translated text
  const createDocxFile = async (text) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: text.split('\n').filter(line => line.trim() !== '').map(paragraph => 
          new Paragraph({
            children: [new TextRun(paragraph)]
          })
        )
      }]
    });

    return await Packer.toBlob(doc);
  };

  // Create a PDF file from translated text
  const createPDFFile = (text) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180);
    
    let y = 10;
    for (let i = 0; i < splitText.length; i++) {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(splitText[i], 10, y);
      y += 7;
    }
    
    return doc.output('blob');
  };

  // Create an HTML file from translated text
  const createHTMLFile = (originalHTML, translatedText) => {
    try {
      // Parse the original HTML
      const root = parse(originalHTML);
      
      // Find text nodes and replace with translated content
      // This is a simplified approach - a real implementation would be more complex
      const paragraphs = translatedText.split('\n\n').filter(p => p.trim() !== '');
      let paragraphIndex = 0;
      
      const replaceTextInNode = (node) => {
        if (node.nodeType === 3 && node.text.trim()) { // Text node with content
          if (paragraphIndex < paragraphs.length) {
            node.text = paragraphs[paragraphIndex];
            paragraphIndex++;
          }
        } else if (node.childNodes) {
          node.childNodes.forEach(replaceTextInNode);
        }
      };
      
      replaceTextInNode(root);
      
      return new Blob([root.toString()], { type: 'text/html' });
    } catch (error) {
      console.error("Error creating HTML file:", error);
      // Fallback to simple HTML
      const html = `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Translated Document</title>
        </head>
        <body>
          ${translatedText.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('')}
        </body>
        </html>`;
      
      return new Blob([html], { type: 'text/html' });
    }
  };

  // Create a PowerPoint file from translated text
  const createPowerPointFile = (text) => {
    const pptx = new pptxgen();
    const slide = pptx.addSlide();
    
    // Split text into chunks for different slides
    const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');
    
    // Create slides with translated content
    for (let i = 0; i < paragraphs.length; i += 5) { // 5 paragraphs per slide
      const slideContent = paragraphs.slice(i, i + 5).join('\n\n');
      const slide = pptx.addSlide();
      
      slide.addText(slideContent, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: '90%',
        fontSize: 14,
        color: '363636'
      });
    }
    
    return pptx.writeFile({ outputType: 'blob' });
  };

  // Create file in original format with translated content
  const createFileInOriginalFormat = async (translatedText, originalFile) => {
    const fileExtension = '.' + originalFile.name.split('.').pop().toLowerCase();
    
    switch (fileExtension) {
      case '.txt':
        return new Blob([translatedText], { type: 'text/plain' });
        
      case '.docx':
      case '.doc':
        return await createDocxFile(translatedText);
        
      case '.pdf':
        return createPDFFile(translatedText);
        
      case '.html':
        return createHTMLFile(fileContent, translatedText);
        
      case '.pptx':
      case '.ppt':
        return await createPowerPointFile(translatedText);
        
      default:
        return new Blob([translatedText], { type: 'text/plain' });
    }
  };

  const handleTranslateFile = async () => {
    if (!file) {
      setError("Vui lòng chọn file để dịch");
      return;
    }

    if (targetLang === sourceLang && sourceLang !== "auto") {
      setError("Ngôn ngữ nguồn và đích không thể giống nhau");
      return;
    }

    try {
      setIsTranslating(true);
      setProgress("Đang xử lý file...");
      setError(null);
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      // First try DeepL for all supported formats (it handles formatting better)
      try {
        await handleDeepLTranslation();
        return; // If DeepL succeeds, we're done
      } catch (deepLError) {
        console.log("DeepL translation failed, falling back to text extraction:", deepLError);
        setProgress("DeepL API không khả dụng, đang thử phương pháp khác...");
        setUseFallback(true);
      }

      // If DeepL fails, try extracting text and using Gemini API
      try {
        setProgress("Đang trích xuất nội dung văn bản...");
        const extractedText = await extractTextFromFile(file);
        
        setProgress("Đang dịch nội dung văn bản...");
        const translatedContent = await translateWithGemini(
          extractedText,
          sourceLang,
          targetLang
        );

        if (translatedContent.startsWith("Error:")) {
          throw new Error(translatedContent.substring(7));
        }

        setProgress("Đang tạo file kết quả...");
        const translatedBlob = await createFileInOriginalFormat(translatedContent, file);
        
        setProgress("Đã hoàn thành dịch file!");
        downloadTranslatedFile(translatedBlob, getMimeType(fileExtension), fileExtension);
      } catch (extractionError) {
        throw new Error(`Không thể trích xuất nội dung: ${extractionError.message}`);
      }
    } catch (error) {
      setError(`Lỗi dịch file: ${error.message}`);
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDeepLTranslation = async () => {
    setProgress("Đang tải file lên DeepL...");
    const translatedBlob = await translateFileWithDeepL(
      file,
      sourceLang,
      targetLang
    );

    setProgress("Đã hoàn thành dịch file!");
    
    // Create download URL
    const downloadUrl = URL.createObjectURL(translatedBlob);
    const fileName = file.name.split(".");
    const fileExtension = fileName.pop();
    const fileNameWithoutExtension = fileName.join(".");
    const translatedFileName = `${fileNameWithoutExtension}_${targetLang}.${fileExtension}`;

    // Create download link and auto-click
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = translatedFileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Release URL
    URL.revokeObjectURL(downloadUrl);
  };

  const getMimeType = (fileExtension) => {
    switch (fileExtension) {
      case '.txt':
        return 'text/plain';
      case '.docx':
      case '.doc':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.pdf':
        return 'application/pdf';
      case '.html':
        return 'text/html';
      case '.pptx':
      case '.ppt':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      default:
        return 'text/plain';
    }
  };

  const downloadTranslatedFile = (blob, mimeType, fileExtension) => {
    const downloadUrl = URL.createObjectURL(blob);
    const fileName = file.name.split(".");
    fileName.pop(); // Remove extension
    const fileNameWithoutExtension = fileName.join(".");
    const translatedFileName = `${fileNameWithoutExtension}_${targetLang}${fileExtension}`;

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = translatedFileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="document-translation">
      <div className="language-selection">
        <div className="language-selector">
          <label htmlFor="source-language">Ngôn ngữ nguồn:</label>
          <select 
            id="source-language" 
            value={sourceLang} 
            onChange={(e) => setSourceLang(e.target.value)}
            disabled={isTranslating}
          >
            {languageOptions.map(lang => (
              <option key={`source-${lang.code}`} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="language-swap">
          <button 
            onClick={() => {
              if (sourceLang !== "auto") {
                const temp = sourceLang;
                setSourceLang(targetLang);
                setTargetLang(temp);
              }
            }}
            disabled={isTranslating || sourceLang === "auto"}
            title={sourceLang === "auto" ? "Không thể hoán đổi khi ngôn ngữ nguồn là tự động phát hiện" : "Hoán đổi ngôn ngữ"}
            className="swap-button"
          >
            ⇄
          </button>
        </div>
        
        <div className="language-selector">
          <label htmlFor="target-language">Ngôn ngữ đích:</label>
          <select 
            id="target-language" 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            disabled={isTranslating}
          >
            {languageOptions.filter(lang => lang.code !== "auto").map(lang => (
              <option key={`target-${lang.code}`} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="file-upload-container">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isTranslating}
          accept={supportedFormats.join(',')}
          className="file-input"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="file-upload-label">
          {file ? file.name : "Chọn file để dịch"}
        </label>
        <button
          onClick={handleTranslateFile}
          disabled={!file || isTranslating}
          className="translate-button"
        >
          {isTranslating ? "Đang dịch..." : "Dịch file"}
        </button>
      </div>

      {file && (
        <div className="file-info">
          <p>Tên file: {file.name}</p>
          <p>Kích thước: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {progress && <div className="progress-info">{progress}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="supported-formats">
        <p>Định dạng hỗ trợ: {supportedFormats.join(', ')}</p>
        <p>Kích thước tối đa: 5MB</p>
        <p>Lưu ý: Ưu tiên sử dụng DeepL API để giữ nguyên định dạng. Nếu không khả dụng, sẽ trích xuất văn bản và dịch bằng Gemini API.</p>
        {useFallback && (
          <p className="fallback-notice">
            <strong>Lưu ý:</strong> Đang sử dụng Gemini API để dịch file văn bản. Kết quả sẽ được lưu với định dạng tương tự file gốc.
          </p>
        )}
      </div>
    </div>
  );
}
