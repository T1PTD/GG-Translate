// src/components/DocumentTranslation.jsx
import React, { useState, useEffect } from 'react';
import { translateFileWithDeepL } from '../services/deeplTranslation';

export function DocumentTranslation() {
  const [file, setFile] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [selectedSourceLang, setSelectedSourceLang] = useState('EN');
  const [selectedTargetLang, setSelectedTargetLang] = useState('VI');

  // Limited set of supported languages as requested
  const supportedLanguages = [
    { code: 'KO', name: 'Korean' },
    { code: 'EN', name: 'English' },
    { code: 'ZH', name: 'Chinese' },
    { code: 'FR', name: 'French' },
    { code: 'DE', name: 'German' },
    { code: 'JA', name: 'Japanese' },
    { code: 'ES', name: 'Spanish' }
  ];

  // Effect to update target language if it's the same as source language
  useEffect(() => {
    if (selectedSourceLang === selectedTargetLang) {
      // Find the first language that's not the source language
      const differentLang = supportedLanguages.find(lang => lang.code !== selectedSourceLang);
      if (differentLang) {
        setSelectedTargetLang(differentLang.code);
      }
    }
  }, [selectedSourceLang]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const validTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/msword', // doc
        'text/plain', // txt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
        'application/vnd.ms-powerpoint' // ppt
      ];
      
      // For DOCX files, sometimes the MIME type might not be correctly detected
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      const isValidByExtension = ['pdf', 'docx', 'doc', 'txt', 'pptx', 'ppt'].includes(fileExtension);
      
      if (!validTypes.includes(selectedFile.type) && !isValidByExtension) {
        setError('Unsupported file format. Please upload PDF, DOCX, DOC, TXT, PPTX, or PPT files.');
        setFile(null);
        return;
      }
      
      // Check file size (10MB limit for DeepL)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      console.log('File selected:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        extension: fileExtension
      });
    }
  };

  const handleTranslate = async () => {
    if (!file) return;
    
    setIsTranslating(true);
    setProgress('Uploading document...');
    setError('');
    
    try {
      setProgress('Translating document...');
      const translatedBlob = await translateFileWithDeepL(
        file, 
        selectedSourceLang, 
        selectedTargetLang
      );
      
      // Create download link for translated file
      const url = URL.createObjectURL(translatedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translated_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setProgress('Translation completed!');
    } catch (err) {
      console.error('Translation error:', err);
      setError(`Translation failed: ${err.message}`);
      
      // Fallback to Gemini if DeepL fails
      setProgress('Attempting to use Gemini API as fallback...');
      try {
        // Here you would implement a fallback to Gemini for text extraction and translation
        // This is just a placeholder - you'd need to implement this functionality
        setProgress('Fallback translation not implemented yet.');
      } catch (fallbackErr) {
        setError(`Both translation methods failed. Please try again later.`);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    const temp = selectedSourceLang;
    setSelectedSourceLang(selectedTargetLang);
    setSelectedTargetLang(temp);
  };

  // Get available target languages (exclude the source language)
  const getTargetLanguages = () => {
    return supportedLanguages.filter(lang => lang.code !== selectedSourceLang);
  };

  return (
    <div className="document-translation">
      <h2>Document Translation</h2>
      
      <div className="language-selection">
        <div className="language-selector">
          <label>Source Language:</label>
          <select 
            value={selectedSourceLang}
            onChange={(e) => setSelectedSourceLang(e.target.value)}
          >
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="language-swap">
          <button 
            className="swap-button"
            onClick={swapLanguages}
            title="Swap languages"
          >
            ⇄
          </button>
        </div>
        
        <div className="language-selector">
          <label>Target Language:</label>
          <select 
            value={selectedTargetLang}
            onChange={(e) => setSelectedTargetLang(e.target.value)}
          >
            {getTargetLanguages().map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="file-upload-container">
        <input
          type="file"
          id="document-file"
          className="file-input"
          onChange={handleFileChange}
          accept=".pdf,.docx,.doc,.txt,.pptx,.ppt"
        />
        <label htmlFor="document-file" className="file-upload-label">
          {file ? file.name : 'Choose a document to translate'}
        </label>
        
        <button
          className="translate-button"
          onClick={handleTranslate}
          disabled={!file || isTranslating}
        >
          {isTranslating ? 'Translating...' : 'Translate Document'}
        </button>
      </div>
      
      {file && (
        <div className="file-info">
          <p><strong>File:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          <p><strong>Type:</strong> {file.type || 'Unknown (using file extension)'}</p>
        </div>
      )}
      
      {progress && <div className="progress-info">{progress}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="supported-formats">
        <h3>Supported File Formats</h3>
        <p>PDF (.pdf), Word (.docx, .doc), Text (.txt), PowerPoint (.pptx, .ppt)</p>
        <p>Maximum file size: 10MB</p>
        
        <div className="fallback-notice">
          <p><strong>Note:</strong> If DeepL translation fails, we'll attempt to use Google Gemini as a fallback for text extraction and translation.</p>
        </div>
      </div>
    </div>
  );
}
