// src/services/deeplTranslation.js
export async function translateFileWithDeepL(file, sourceLang, targetLang) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_lang', targetLang);
    if (sourceLang) {
      formData.append('source_lang', sourceLang);
    }

    console.log('Sending translation request:', {
      file: file.name,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang
    });

    const response = await fetch('https://api-free.deepl.com/v2/document', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${import.meta.env.VITE_DEEPL_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
    }

    const { document_id, document_key } = await response.json();

    // Poll for translation status
    let isComplete = false;
    while (!isComplete) {
      const statusResponse = await fetch(`https://api-free.deepl.com/v2/document/${document_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${import.meta.env.VITE_DEEPL_API_KEY}`
        },
        body: new URLSearchParams({
          'document_key': document_key
        })
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const status = await statusResponse.json();
      if (status.status === 'done') {
        isComplete = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Download translated file
    const downloadResponse = await fetch(`https://api-free.deepl.com/v2/document/${document_id}/result`, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${import.meta.env.VITE_DEEPL_API_KEY}`
      },
      body: new URLSearchParams({
        'document_key': document_key
      })
    });

    if (!downloadResponse.ok) {
      throw new Error(`Download failed: ${downloadResponse.status}`);
    }

    return await downloadResponse.blob();
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}
