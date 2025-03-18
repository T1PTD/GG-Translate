// src/services/deeplTranslation.js
export async function translateFileWithDeepL(file, sourceLang, targetLang) {
  try {
    const formData = new FormData();
    
    // Add file with proper filename to ensure correct MIME type detection
    // This is crucial for DOCX files
    formData.append('file', file, file.name);
    
    // Convert language codes to DeepL format
    const deeplTargetLang = convertToDeepLFormat(targetLang);
    formData.append('target_lang', deeplTargetLang);
    
    if (sourceLang && sourceLang !== "Language detection") {
      const deeplSourceLang = convertToDeepLFormat(sourceLang);
      formData.append('source_lang', deeplSourceLang);
    }

    console.log('Sending translation request:', {
      file: file.name,
      sourceLanguage: sourceLang,
      deeplSourceLang: convertToDeepLFormat(sourceLang),
      targetLanguage: targetLang,
      deeplTargetLang: convertToDeepLFormat(targetLang),
      fileSize: file.size,
      fileType: file.type
    });

    // Log FormData contents for debugging
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? 
        `File: ${pair[1].name}, type: ${pair[1].type}, size: ${pair[1].size}` : 
        pair[1]));
    }

    // Use the proxy endpoint
    const response = await fetch('/api/deepl/v2/document', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API error response:', errorText);
      throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
    }

    const { document_id, document_key } = await response.json();
    console.log('Document uploaded successfully:', { document_id, document_key });

    // Poll for translation status
    let isComplete = false;
    let retries = 0;
    const maxRetries = 60; // Increase maximum number of retries (60 seconds)
    
    while (!isComplete && retries < maxRetries) {
      const statusResponse = await fetch(`/api/deepl/v2/document/${document_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'document_key': document_key
        })
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        throw new Error(`Status check failed: ${statusResponse.status} - ${errorText}`);
      }

      const status = await statusResponse.json();
      console.log('Translation status:', status);
      
      if (status.status === 'done') {
        isComplete = true;
      } else if (status.status === 'error') {
        throw new Error(`Translation error: ${status.message || 'Unknown error'}`);
      } else {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!isComplete) {
      throw new Error('Translation timed out after 60 seconds');
    }

    // Download translated file
    const downloadResponse = await fetch(`/api/deepl/v2/document/${document_id}/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'document_key': document_key
      })
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      throw new Error(`Download failed: ${downloadResponse.status} - ${errorText}`);
    }

    const blob = await downloadResponse.blob();
    console.log('Translation completed successfully');
    return blob;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// Helper function to convert language codes to DeepL format
function convertToDeepLFormat(langCode) {
  // DeepL uses lowercase language codes with specific formats
  const langMap = {
    // Source language codes
    'BG': 'bg', // Bulgarian
    'CS': 'cs', // Czech
    'DA': 'da', // Danish
    'DE': 'de', // German
    'EL': 'el', // Greek
    'EN': 'en', // English
    'ES': 'es', // Spanish
    'ET': 'et', // Estonian
    'FI': 'fi', // Finnish
    'FR': 'fr', // French
    'HU': 'hu', // Hungarian
    'ID': 'id', // Indonesian
    'IT': 'it', // Italian
    'JA': 'ja', // Japanese
    'KO': 'ko', // Korean
    'LT': 'lt', // Lithuanian
    'LV': 'lv', // Latvian
    'NB': 'nb', // Norwegian
    'NL': 'nl', // Dutch
    'PL': 'pl', // Polish
    'PT': 'pt', // Portuguese
    'RO': 'ro', // Romanian
    'RU': 'ru', // Russian
    'SK': 'sk', // Slovak
    'SL': 'sl', // Slovenian
    'SV': 'sv', // Swedish
    'TR': 'tr', // Turkish
    'UK': 'uk', // Ukrainian
    'ZH': 'zh', // Chinese
    'VI': 'vi', // Vietnamese
    
    // Target language codes with regional variants
    'EN-GB': 'en-GB', // British English
    'EN-US': 'en-US', // American English
    'PT-BR': 'pt-BR', // Brazilian Portuguese
    'PT-PT': 'pt-PT', // European Portuguese
  };
  
  return langMap[langCode] || langCode.toLowerCase();
}
