/**
 * Dịch văn bản sử dụng Google Gemini API
 */
export async function translateWithGemini(text, sourceLang, targetLang) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Translate to ${targetLang}: "${text}". Only return the translated text without explanation.`,
          },
        ],
      },
    ],
  };
  

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API lỗi: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể dịch";
  } catch (error) {
    return `Error: ${error.message}`;
  }
}
