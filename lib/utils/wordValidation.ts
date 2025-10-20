/**
 * Validates that word indices are within the valid range
 * @param indices - 2D array of word indices (4 panels × up to 10 words)
 * @param maxIndex - Maximum valid word index (default: 99 for 100 daily words)
 * @returns true if all indices are valid
 */
export function validateWordIndices(indices: number[][], maxIndex: number = 99): boolean {
    // Check that we have exactly 4 panels
    if (indices.length !== 4) {
      return false;
    }
    
    // Check each panel
    for (const panel of indices) {
      // Check max words per panel
      if (panel.length > 10) {
        return false;
      }
      
      // Check each word index is valid
      for (const wordIndex of panel) {
        if (wordIndex < 0 || wordIndex > maxIndex || !Number.isInteger(wordIndex)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Checks if all 4 panels have at least one word
   * @param panelWords - 2D array of word indices
   * @returns true if all panels have ≥1 word
   */
  export function allPanelsHaveWords(panelWords: number[][]): boolean {
    if (panelWords.length !== 4) {
      return false;
    }
    
    return panelWords.every(panel => panel.length > 0);
  }
  
  /**
   * Validates word count for a single panel
   * @param panelWords - Array of word indices for one panel
   * @returns true if panel has 1-10 words
   */
  export function validatePanelWordCount(panelWords: number[]): boolean {
    return panelWords.length >= 1 && panelWords.length <= 10;
  }
  
  /**
   * Checks if a word can be added to a panel
   * @param currentWords - Current words in the panel
   * @param maxWords - Maximum words allowed per panel (default: 10)
   * @returns true if word can be added
   */
  export function canAddWord(currentWords: number[], maxWords: number = 10): boolean {
    return currentWords.length < maxWords;
  }
  
  /**
   * Converts word indices to actual word strings
   * @param indices - Array of word indices
   * @param wordList - Master word list
   * @returns Array of word strings
   */
  export function indicesToWords(indices: number[], wordList: string[]): string[] {
    return indices.map(index => wordList[index] || '');
  }
  
  /**
   * Converts 2D word indices to 2D word strings (all panels)
   * @param allIndices - 2D array of word indices (4 panels)
   * @param wordList - Master word list
   * @returns 2D array of word strings
   */
  export function allIndicesToWords(allIndices: number[][], wordList: string[]): string[][] {
    return allIndices.map(panelIndices => indicesToWords(panelIndices, wordList));
  }
  
  /**
   * Formats panel words into a single caption string
   * @param words - Array of words for a panel
   * @returns Space-separated string of words
   */
  export function formatPanelCaption(words: string[]): string {
    return words.join(' ');
  }