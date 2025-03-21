import React, { useState, useEffect } from "react";

export function TranslationPanel({
  text,
  translatedText,
  handleTextChange,
  charCount,
  clearText,
  handleTranslate,
  isTranslating,
  error,
  autoTranslate,
  selectedSourceLang,
  selectedTargetLang
}) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSpeakingSource, setIsSpeakingSource] = useState(false);
  const [isSpeakingTarget, setIsSpeakingTarget] = useState(false);

  // Define language mapping for speech synthesis
  const langMap = {
    'Vietnamese': 'vi-VN',
    'English': 'en-US',
    'Chinese': 'zh-CN',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Japanese': 'ja-JP',
    'Korean': 'ko-KR',
    'Spanish': 'es-ES'
  };

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      // Set recognition language based on source language
      recognitionInstance.lang = langMap[selectedSourceLang] || 'vi-VN';
      
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        // Update the text by combining existing text with new transcript
        const updatedText = text + ' ' + transcript;
        // Call the parent component's text change handler
        handleTextChange({ target: { value: updatedText.trim() } });
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    // Cleanup function
    return () => {
      if (recognition) {
        recognition.stop();
      }
      // Stop speech synthesis when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedSourceLang]); // Re-initialize when source language changes

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Function to speak source text
  const speakSourceText = () => {
    if (!text || isSpeakingSource || isSpeakingTarget) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set speech language based on source language
      utterance.lang = langMap[selectedSourceLang] || 'en-US';
      
      // Find appropriate voice for the language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes(utterance.lang.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.onstart = () => setIsSpeakingSource(true);
      utterance.onend = () => setIsSpeakingSource(false);
      utterance.onerror = () => setIsSpeakingSource(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Trình duyệt không hỗ trợ phát âm');
    }
  };

  // Function to speak translated text
  const speakTargetText = () => {
    if (!translatedText || isSpeakingSource || isSpeakingTarget) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      
      // Set speech language based on target language
      utterance.lang = langMap[selectedTargetLang] || 'en-US';
      
      // Find appropriate voice for the language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes(utterance.lang.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.onstart = () => setIsSpeakingTarget(true);
      utterance.onend = () => setIsSpeakingTarget(false);
      utterance.onerror = () => setIsSpeakingTarget(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Trình duyệt không hỗ trợ phát âm');
    }
  };

  return (
    <div className="text-areas-container">
      {/* Source text area */}
      <div className="text-area-wrapper">
        <textarea
          className="source-text"
          placeholder="Nhập văn bản cần dịch"
          value={text}
          onChange={handleTextChange}
        ></textarea>
        <div className="text-controls">
          <span className="char-count">{charCount}/5000</span>
          <div className="text-buttons">
            {/* Source text speech button */}
            {text && (
              <button 
                className={`speak-button ${isSpeakingSource ? 'speaking' : ''}`} 
                onClick={speakSourceText}
                title="Phát âm văn bản gốc"
                disabled={isSpeakingSource || isSpeakingTarget}
              >
                {isSpeakingSource ? '🔊' : '🔈'}
              </button>
            )}
            
            {/* Microphone button */}
            <button
              className={`mic-button ${isListening ? 'mic-active' : ''}`}
              onClick={toggleListening}
              title={isListening ? "Dừng ghi âm" : "Nhập bằng giọng nói"}
            >
              {isListening ? '🔴 🎤' : '🎤'}
            </button>
            
            {!autoTranslate && (
              <button 
                className="translate-button" 
                onClick={handleTranslate} 
                disabled={!text.trim() || isTranslating}
              >
                {isTranslating ? "Đang dịch..." : "Dịch"}
              </button>
            )}
            <button 
              className="clear-button" 
              onClick={clearText}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      
      {/* Target text area */}
      <div className="text-area-wrapper">
        <div className="target-header">
          Bản dịch {isTranslating && <span className="translating">(đang dịch...)</span>}
        </div>
        <textarea
          className="target-text"
          value={translatedText}
          readOnly
        ></textarea>
        <div className="text-controls">
          <div className="text-buttons">
            {/* Target text speech button */}
            {translatedText && (
              <button 
                className={`speak-button ${isSpeakingTarget ? 'speaking' : ''}`} 
                onClick={speakTargetText}
                title="Phát âm bản dịch"
                disabled={isSpeakingSource || isSpeakingTarget}
              >
                {isSpeakingTarget ? '🔊' : '🔈'}
              </button>
            )}
            {translatedText && (
              <button 
                className="copy-button" 
                onClick={() => navigator.clipboard.writeText(translatedText)}
                title="Sao chép bản dịch"
              >
                📋
              </button>
            )}
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
