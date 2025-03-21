// src/services/translationHistory.js
export const saveTranslation = (sourceText, translatedText, sourceLang, targetLang) => {
  try {
    // Get existing history or initialize empty array
    const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
    
    // Create new history entry
    const newEntry = {
      id: Date.now(), // Use timestamp as unique ID
      sourceText,
      translatedText,
      sourceLang,
      targetLang,
      timestamp: new Date().toISOString()
    };
    
    // Add to beginning of array (most recent first)
    history.unshift(newEntry);
    
    // Limit history to 50 items to prevent localStorage from getting too large
    const limitedHistory = history.slice(0, 50);
    
    // Save back to localStorage
    localStorage.setItem('translationHistory', JSON.stringify(limitedHistory));
    
    return newEntry;
  } catch (error) {
    console.error('Error saving translation history:', error);
    return null;
  }
};

export const getTranslationHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('translationHistory') || '[]');
  } catch (error) {
    console.error('Error retrieving translation history:', error);
    return [];
  }
};

export const clearTranslationHistory = () => {
  try {
    localStorage.removeItem('translationHistory');
    return true;
  } catch (error) {
    console.error('Error clearing translation history:', error);
    return false;
  }
};

export const deleteTranslationEntry = (id) => {
  try {
    const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
    const updatedHistory = history.filter(entry => entry.id !== id);
    localStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error deleting translation entry:', error);
    return false;
  }
};

export const saveToFavorites = (entry) => {
  try {
    // Get existing favorites or initialize empty array
    const favorites = JSON.parse(localStorage.getItem('translationFavorites') || '[]');
    
    // Check if already in favorites
    if (!favorites.some(fav => fav.id === entry.id)) {
      // Add to favorites with favorite flag
      const favoriteEntry = { ...entry, isFavorite: true };
      favorites.unshift(favoriteEntry);
      localStorage.setItem('translationFavorites', JSON.stringify(favorites));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving to favorites:', error);
    return false;
  }
};

export const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('translationFavorites') || '[]');
  } catch (error) {
    console.error('Error retrieving favorites:', error);
    return [];
  }
};

export const removeFromFavorites = (id) => {
  try {
    const favorites = JSON.parse(localStorage.getItem('translationFavorites') || '[]');
    const updatedFavorites = favorites.filter(entry => entry.id !== id);
    localStorage.setItem('translationFavorites', JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};
