// src/services/wordAnalysis.js
export async function analyzeText(text, language) {
  try {
    // Nếu không có văn bản, trả về mảng rỗng
    if (!text || text.trim() === '') {
      return { words: [] };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;
    
    // Tạo prompt phù hợp với yêu cầu phân tích
    let prompt = "";
    if (language === "en") {
      prompt = `Analyze the following English text and identify important words (nouns, verbs, adjectives, adverbs):
      "${text}"
      
      Return a JSON object with the following structure:
      {
        "words": [
          {
            "word": "example",
            "phonetic": "ɪɡˈzæmpəl",
            "type": "noun/verb/adjective/adverb",
            "definition": "short definition"
          }
        ]
      }
      
      Only include content words and only return the JSON without any explanation.`;
    } else if (language === "vi") {
      prompt = `Phân tích văn bản tiếng Việt sau và xác định các từ quan trọng (danh từ, động từ, tính từ, trạng từ):
      "${text}"
      
      Trả về một đối tượng JSON với cấu trúc sau:
      {
        "words": [
          {
            "word": "ví dụ",
            "phonetic": "ví zụ",
            "type": "danh từ/động từ/tính từ/trạng từ",
            "definition": "định nghĩa ngắn gọn"
          }
        ]
      }
      
      Chỉ bao gồm các từ nội dung và chỉ trả về JSON mà không có bất kỳ giải thích nào.`;
    } else {
      // Ngôn ngữ khác
      prompt = `Analyze the following text in ${language} and identify important words:
      "${text}"
      
      Return a JSON object with the following structure:
      {
        "words": [
          {
            "word": "example",
            "phonetic": "pronunciation",
            "type": "word type",
            "definition": "short definition"
          }
        ]
      }
      
      Only include content words and only return the JSON without any explanation.`;
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Tìm và trích xuất phần JSON từ kết quả
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        return { words: [] };
      }
    }
    
    return { words: [] };
  } catch (error) {
    console.error("Word analysis error:", error);
    return { words: [] };
  }
}
