// src/services/grammarChecker.js
export async function checkGrammar(text, language) {
  console.log("Checking grammar for:", text, "in language:", language);
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Please check the following text for grammar and spelling errors in ${language}. 
            If there are errors, list each error with a correction suggestion. 
            If there are no errors, respond with "No errors found."
            
            Text: "${text}"
            
            Format your response as follows:
            1. Error: [incorrect text] -> Correction: [corrected text] - Explanation: [brief explanation]
            2. Error: [incorrect text] -> Correction: [corrected text] - Explanation: [brief explanation]
            ...and so on.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    },
  };

  try {
    console.log("Sending request to Gemini API");
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
    console.log("Grammar check response:", data);
    
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể kiểm tra ngữ pháp";
    return result;
  } catch (error) {
    console.error("Grammar check error:", error);
    throw error;
  }
}
