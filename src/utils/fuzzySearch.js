/**
 * Fuzzy search utilities
 */

/**
 * Calculate Levenshtein distance between two strings
 * (minimum number of edits needed to transform one string into another)
 */
export const levenshteinDistance = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
};

/**
 * Calculate similarity score (0-1, where 1 is perfect match)
 */
export const similarityScore = (str1, str2) => {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
};

/**
 * Check if text fuzzy matches the search term
 * @param {string} text - Text to search in
 * @param {string} searchTerm - Term to search for
 * @param {number} threshold - Similarity threshold (0-1, default 0.6)
 * @param {boolean} caseSensitive - Case sensitive matching
 * @returns {object|null} Match object with score and position, or null
 */
export const fuzzyMatch = (text, searchTerm, threshold = 0.6, caseSensitive = false) => {
  if (!text || !searchTerm) return null;

  const searchStr = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  const textStr = caseSensitive ? text : text.toLowerCase();
  
  // Quick exact match check first (optimization)
  if (textStr.includes(searchStr)) {
    return {
      matched: true,
      score: 1.0,
      matchIndex: textStr.indexOf(searchStr),
      exact: true
    };
  }

  const searchLen = searchStr.length;
  let bestMatch = null;
  let bestScore = 0;

  // First, try comparing the full text against search term (for similar length strings)
  if (Math.abs(textStr.length - searchLen) <= 3) {
    const score = similarityScore(searchStr, textStr);
    if (score >= threshold) {
      bestScore = score;
      bestMatch = {
        matched: true,
        score: score,
        matchIndex: 0,
        exact: false,
        matchedText: text
      };
    }
  }

  // Also check all possible substrings
  const minLen = Math.max(1, Math.floor(searchLen * 0.6));
  const maxLen = Math.min(textStr.length, Math.ceil(searchLen * 1.5));

  for (let len = minLen; len <= maxLen; len++) {
    for (let i = 0; i <= textStr.length - len; i++) {
      const substring = textStr.substring(i, i + len);
      const score = similarityScore(searchStr, substring);

      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = {
          matched: true,
          score: score,
          matchIndex: i,
          exact: false,
          matchedText: text.substring(i, i + len)
        };
      }
    }
  }

  return bestMatch;
};

/**
 * Find all fuzzy matches in text
 * @param {string} text - Text to search in
 * @param {string} searchTerm - Term to search for
 * @param {number} threshold - Similarity threshold (0-1)
 * @param {boolean} caseSensitive - Case sensitive matching
 * @returns {array} Array of match objects
 */
export const findAllFuzzyMatches = (text, searchTerm, threshold = 0.6, caseSensitive = false) => {
  const matches = [];
  const match = fuzzyMatch(text, searchTerm, threshold, caseSensitive);
  
  if (match) {
    matches.push(match);
  }
  
  return matches;
};

/**
 * Fuzzy search across multiple strings
 * @param {array} items - Array of strings to search
 * @param {string} searchTerm - Term to search for
 * @param {number} threshold - Similarity threshold
 * @param {boolean} caseSensitive - Case sensitive matching
 * @returns {array} Array of results with index and match info
 */
export const fuzzySearchArray = (items, searchTerm, threshold = 0.6, caseSensitive = false) => {
  const results = [];
  
  items.forEach((item, index) => {
    const match = fuzzyMatch(String(item), searchTerm, threshold, caseSensitive);
    if (match) {
      results.push({
        index,
        value: item,
        ...match
      });
    }
  });
  
  // Sort by score (best matches first)
  return results.sort((a, b) => b.score - a.score);
};
