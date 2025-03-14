// services/grammarChecker.js
export async function checkGrammarWithGemini(text, language) {
    try {
      console.log(`Đang kiểm tra ngữ pháp cho: "${text}" (${language})`);
      
      // Mô phỏng gọi API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const errors = [];
      
      // Các quy tắc kiểm tra lỗi không thay đổi
      if (language === "Vietnamese") {
        const words = text.split(/\s+/);
        words.forEach((word, index) => {
          if (word === "nguoi" || word === "Nguoi") {
            errors.push({
              index,
              word,
              suggestion: "Từ thiếu dấu, nên là 'người'",
              position: text.indexOf(word)
            });
          }
          
          if (word === "tieng" || word === "Tieng") {
            errors.push({
              index,
              word,
              suggestion: "Từ thiếu dấu, nên là 'tiếng'",
              position: text.indexOf(word)
            });
          }
        });
      } 
      else if (language === "English") {
        const words = text.split(/\s+/);
        words.forEach((word, index) => {
          // Kiểm tra một số lỗi tiếng Anh phổ biến
          if (word.toLowerCase() === "mi") {
            errors.push({
              index,
              word,
              suggestion: "Sai chính tả, nên là 'my'",
              position: text.indexOf(word)
            });
          }
          
          if (word.toLowerCase() === "nem") {
            errors.push({
              index,
              word,
              suggestion: "Sai chính tả, nên là 'name'",
              position: text.indexOf(word)
            });
          }
          
          if (word.toLowerCase() === "teh") {
            errors.push({
              index,
              word,
              suggestion: "Sai chính tả, nên là 'the'",
              position: text.indexOf(word)
            });
          }
          
          // Kiểm tra lỗi ngữ pháp
          if (word.toLowerCase() === "is" && index > 0) {
            const prevWord = words[index-1].toLowerCase();
            if (prevWord === "i") {
              errors.push({
                index,
                word: prevWord + " " + word,
                suggestion: "Sai ngữ pháp: 'I am' thay vì 'I is'",
                position: text.indexOf(prevWord + " " + word)
              });
            }
          }
        });
      }
      
      // Luôn trả về một đối tượng có cấu trúc nhất quán
      return {
        errorCount: errors.length,
        errors,
        checked: true  // Thêm flag để biết đã kiểm tra xong
      };
    } catch (error) {
      console.error("Lỗi kiểm tra ngữ pháp:", error);
      return {
        errorCount: 0,
        errors: [],
        checked: false  // Đánh dấu kiểm tra không thành công
      };
    }
  }