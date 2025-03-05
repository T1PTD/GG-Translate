/**
 * Module xử lý dịch văn bản với DeepSeek AI thông qua OpenRouter API
 */

// Hàm kiểm tra API key
export function checkAPIKey() {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    console.log("API key check:", !!apiKey);
    return {
      exists: !!apiKey,
      valid: !!apiKey && apiKey.length > 20
    };
  } catch (error) {
    console.error("Error checking API key:", error);
    return { exists: false, valid: false };
  }
}

/**
 * Dịch văn bản sử dụng Deepseek AI thông qua OpenRouter API
 */
export async function translateWithOpenAI(text, sourceLang, targetLang) {
  // Trả về chuỗi trống nếu không có văn bản
  if (!text || text.trim() === '') {
    return '';
  }
  
  try {
    // Lấy API key từ biến môi trường
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("API key không có sẵn");
      return "Error: API key không tồn tại. Vui lòng kiểm tra file .env của bạn.";
    }
    
    // Xác định ngôn ngữ nguồn
    const sourceLanguage = sourceLang === "Language detection" 
      ? "the source language" 
      : sourceLang;
    
    // Gửi yêu cầu dịch đến OpenRouter API với model Deepseek
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'DeepSeek Translator'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a pure translation tool that ONLY outputs translated text. NEVER introduce yourself. NEVER add any explanations before or after the translation. NEVER use phrases like "Here's the translation" or "Translation:". NEVER comment about your translation. JUST translate from ${sourceLanguage} to ${targetLang} directly.
            
FORMAT:
<translation>
[translated text goes here with absolutely no additional text]
</translation>

Example input: "Hello world"
Example correct output: <translation>Xin chào thế giới</translation>

Example input: "I love programming"
Example correct output: <translation>Tôi yêu lập trình</translation>

ONLY output the translated text enclosed in the translation tags. NOTHING ELSE.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.01, // Nhiệt độ rất thấp để buộc model làm đúng một việc
        max_tokens: 4000
      })
    });
    
    // Xử lý lỗi HTTP
    if (!response.ok) {
      let errorText = "";
      try {
        const errorData = await response.json();
        errorText = errorData?.error?.message || "";
        console.error("API error response:", errorData);
      } catch (e) {
        console.error("Cannot parse error response:", e);
      }
      
      if (response.status === 401) {
        return "Error: API key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.";
      } else if (response.status === 429) {
        return "Error: Đã vượt quá giới hạn API. Vui lòng thử lại sau.";
      } else {
        return `Error: ${response.status} - ${errorText || response.statusText}`;
      }
    }
    
    // Xử lý kết quả thành công
    const data = await response.json();
    console.log("API response:", data);
    
    // Trích xuất và làm sạch văn bản đã dịch
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      let result = data.choices[0].message.content.trim();
      
      // Trích xuất nội dung trong thẻ <translation>
      const translationPattern = /<translation>([\s\S]*?)<\/translation>/i;
      const match = result.match(translationPattern);
      
      if (match && match[1]) {
        // Lấy nội dung trong thẻ translation
        result = match[1].trim();
      } else {
        // Nếu không tìm thấy thẻ, áp dụng các bộ lọc
        // Loại bỏ các tiền tố phổ biến
        const prefixesToRemove = [
          "Translation:", "Translated:", "Here's the translation:", 
          "The translation is:", "In Vietnamese:", "In English:",
          "Translated text:", "Bản dịch:", "Dịch:", "Vietnamese:", "English:",
          "Here is the", "Here's the", "This is the", "Here is your"
        ];
        
        // Loại bỏ tiền tố ở đầu câu
        for (const prefix of prefixesToRemove) {
          if (result.toLowerCase().startsWith(prefix.toLowerCase())) {
            result = result.substring(prefix.length).trim();
            break;
          }
        }
        
        // Loại bỏ các hậu tố phổ biến
        const suffixesToRemove = [
          "This is the translation.", "Hope this helps.", "I've translated the text.",
          "I've translated it for you.", "That's the translation.",
          "Hope that helps!", "Let me know if you need anything else."
        ];
        
        for (const suffix of suffixesToRemove) {
          if (result.toLowerCase().endsWith(suffix.toLowerCase())) {
            result = result.substring(0, result.length - suffix.length).trim();
            break;
          }
        }
      }
      
      return result;
    } else {
      console.error("Unexpected API response format:", data);
      return "Error: Định dạng phản hồi API không như mong đợi.";
    }
  } catch (error) {
    console.error("Translation error:", error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return "Error: Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.";
    }
    return `Error: ${error.message || "Đã xảy ra lỗi không xác định"}`;
  }
}

/**
 * Kiểm tra xem API có khả dụng không
 */
export async function testOpenAIAvailability() {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) return false;
    
    // Test OpenRouter API connection
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error("API availability test failed:", error);
    return false;
  }
}
