import { create } from 'zustand';
import Fuse from 'fuse.js';
import { similarityScore } from '../utils/fuzzySearch';

const useDataStore = create((set, get) => ({
  // Core data
  data: [],
  columns: [],
  originalData: [],

  // Column visibility
  hiddenColumns: [],

  // Search state
  searchTerm: '',
  replaceTerm: '',
  searchResults: [],
  caseSensitive: false,
  selectedColumns: [],
  fuzzySearch: false,
  fuzzyThreshold: 0.6, // 0-1, where 1 is exact match (0.6 = 60% similarity)

  // UI state
  isSearchOpen: false,
  isLoading: false,
  isSearching: false,
  searchProgress: 0,

  // Selection state
  selectedCells: new Set(), // Set of "rowIndex-columnId" strings
  lastSelectedCell: null, // { rowIndex, columnId } for shift-click range selection
  isSelecting: false, // Track if user is dragging to select

  // Actions
  setData: (newData) => {
    set({
      data: newData,
      originalData: JSON.parse(JSON.stringify(newData))
    });
  },

  setColumns: (cols) => set({ columns: cols }),

  setHiddenColumns: (cols) => set({ hiddenColumns: cols }),

  updateCell: (rowIndex, columnId, value) => {
    set((state) => {
      const newData = [...state.data];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [columnId]: value
      };
      return { data: newData };
    });
  },

  updateRow: (rowIndex, rowData) => {
    set((state) => {
      const newData = [...state.data];
      newData[rowIndex] = { ...newData[rowIndex], ...rowData };
      return { data: newData };
    });
  },

  bulkUpdate: (updates) => {
    // updates: Array of { rowIndex, columnId, value }
    set((state) => {
      const newData = [...state.data];
      updates.forEach(({ rowIndex, columnId, value }) => {
        if (newData[rowIndex]) {
          newData[rowIndex] = {
            ...newData[rowIndex],
            [columnId]: value
          };
        }
      });
      return { data: newData };
    });
  },

  // Search & Replace
  setSearchTerm: (term) => set({ searchTerm: term }),
  setReplaceTerm: (term) => set({ replaceTerm: term }),
  setCaseSensitive: (value) => set({ caseSensitive: value }),
  setSelectedColumns: (cols) => set({ selectedColumns: cols }),
  setIsSearchOpen: (value) => set({ isSearchOpen: value }),
  setFuzzySearch: (value) => set({ fuzzySearch: value }),
  setFuzzyThreshold: (value) => set({ fuzzyThreshold: value }),

  findMatches: async () => {
    const { data, searchTerm, caseSensitive, selectedColumns, columns, fuzzySearch, fuzzyThreshold } = get();

    if (!searchTerm) {
      set({ searchResults: [], isSearching: false, searchProgress: 0 });
      return [];
    }

    set({ isSearching: true, searchProgress: 0 });
    await new Promise(resolve => setTimeout(resolve, 10));

    const results = [];
    const columnsToSearch = selectedColumns.length > 0
      ? selectedColumns
      : columns.map(col => col.id);

    if (fuzzySearch) {
      // Search each cell individually
      const totalCells = data.length * columnsToSearch.length;
      let processedCells = 0;
      const updateInterval = Math.max(1, Math.floor(totalCells / 50));

      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];

        for (const columnId of columnsToSearch) {
          const cellValue = String(row[columnId] || '');
          processedCells++;

          if (!cellValue) {
            // Update progress for empty cells too
            if (processedCells % updateInterval === 0) {
              const progress = Math.min(99, Math.round((processedCells / totalCells) * 100));
              set({ searchProgress: progress });
            }
            continue;
          }

          // Create Fuse instance for this single cell
          const fuse = new Fuse([cellValue], {
            includeScore: true,
            includeMatches: true,
            threshold: Math.min(0.3, 1 - fuzzyThreshold),
            ignoreLocation: true,
            isCaseSensitive: caseSensitive,
            minMatchCharLength: 1
          });

          const cellResults = fuse.search(searchTerm);

          if (cellResults.length > 0) {
            const result = cellResults[0];
            const fuseScore = 1 - (result.score || 0);

            // Fuse.js found a match, now find the best matching substring
            const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase();
            const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();

            let matchIndex, matchedText, finalScore;

            // First try exact substring match
            if (compareValue.includes(searchValue)) {
              matchIndex = compareValue.indexOf(searchValue);
              matchedText = cellValue.substring(matchIndex, matchIndex + searchValue.length);
              finalScore = 1.0;
            } else {
              // Optimized sliding window - coarser steps for speed
              const searchLen = searchTerm.length;
              let bestScore = 0;
              let bestStart = 0;
              let bestLength = searchLen;

              // Reduced window range and use step size for speed
              const minLen = Math.floor(searchLen * 0.7);
              const maxLen = Math.min(cellValue.length, Math.ceil(searchLen * 1.5));
              const stepSize = Math.max(1, Math.floor(searchLen * 0.1)); // Skip some positions

              for (let len = minLen; len <= maxLen; len += stepSize) {
                for (let i = 0; i <= cellValue.length - len; i += stepSize) {
                  const substring = cellValue.substring(i, i + len);
                  const subLower = caseSensitive ? substring : substring.toLowerCase();
                  const score = similarityScore(subLower, searchValue);

                  if (score > bestScore) {
                    bestScore = score;
                    bestStart = i;
                    bestLength = len;
                  }

                  // Early exit if we found a very good match
                  if (score > 0.95) break;
                }
                if (bestScore > 0.95) break;
              }

              matchIndex = bestStart;
              matchedText = cellValue.substring(bestStart, bestStart + bestLength);
              finalScore = Math.max(bestScore, fuseScore);
            }

            results.push({
              rowIndex,
              columnId,
              value: cellValue,
              matchIndex,
              score: finalScore,
              exact: false,
              matchedText
            });
          }

          // Update progress per cell
          if (processedCells % updateInterval === 0 || processedCells === totalCells) {
            const progress = Math.min(99, Math.round((processedCells / totalCells) * 100));
            set({ searchProgress: progress });
          }
        }
      }

      results.sort((a, b) => b.score - a.score);
    } else {
      // Exact search mode
      const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();
      const updateInterval = Math.max(1, Math.floor(data.length / 100));

      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];

        for (const columnId of columnsToSearch) {
          const cellValue = String(row[columnId] || '');
          const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase();

          if (compareValue.includes(searchValue)) {
            const matchIndex = compareValue.indexOf(searchValue);
            const matchedText = cellValue.substring(matchIndex, matchIndex + searchValue.length);

            results.push({
              rowIndex,
              columnId,
              value: cellValue,
              matchIndex,
              score: 1.0,
              exact: true,
              matchedText
            });
          }
        }

        if (rowIndex % updateInterval === 0 || rowIndex === data.length - 1) {
          const progress = Math.min(99, Math.round(((rowIndex + 1) / data.length) * 100));
          set({ searchProgress: progress });
        }
      }
    }

    set({ searchResults: results, isSearching: false, searchProgress: 100 });
    return results;
  },

  replaceAll: (searchTerm, replaceTerm) => {
    const { data, caseSensitive, selectedColumns, columns, fuzzySearch, fuzzyThreshold } = get();
    const updates = [];

    const columnsToSearch = selectedColumns.length > 0
      ? selectedColumns
      : columns.map(col => col.id);
    
    // Clear search results before replacing since data will change
    set({ searchResults: [] });

    if (fuzzySearch) {
      // Search and replace in each cell individually
      data.forEach((row, rowIndex) => {
        columnsToSearch.forEach((columnId) => {
          const cellValue = String(row[columnId] || '');
          if (!cellValue) return;

          // Create Fuse instance for this single cell
          const fuse = new Fuse([cellValue], {
            includeScore: true,
            includeMatches: true,
            threshold: Math.min(0.3, 1 - fuzzyThreshold),
            ignoreLocation: true,
            isCaseSensitive: caseSensitive,
            minMatchCharLength: 1
          });

          const cellResults = fuse.search(searchTerm);

          if (cellResults.length > 0) {
            // Fuse.js found a match, now find the best matching substring
            const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase();
            const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();

            let startPos, endPos;

            // First try exact substring match
            if (compareValue.includes(searchValue)) {
              startPos = compareValue.indexOf(searchValue);
              endPos = startPos + searchValue.length - 1;
            } else {
              // Find best matching substring
              const searchLen = searchTerm.length;
              let bestScore = 0;
              let bestStart = 0;
              let bestLength = searchLen;

              for (let len = Math.floor(searchLen * 0.5); len <= Math.min(cellValue.length, searchLen * 2); len++) {
                for (let i = 0; i <= cellValue.length - len; i++) {
                  const substring = cellValue.substring(i, i + len);
                  const subLower = caseSensitive ? substring : substring.toLowerCase();
                  const score = similarityScore(subLower, searchValue);

                  if (score > bestScore) {
                    bestScore = score;
                    bestStart = i;
                    bestLength = len;
                  }
                }
              }

              startPos = bestStart;
              endPos = bestStart + bestLength - 1;
            }

            const beforeMatch = cellValue.substring(0, startPos);
            const afterMatch = cellValue.substring(endPos + 1);
            const newValue = beforeMatch + replaceTerm + afterMatch;

            updates.push({
              rowIndex,
              columnId,
              value: newValue
            });
          }
        });
      });
    } else {
      // Exact replace mode
      const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();

      data.forEach((row, rowIndex) => {
        columnsToSearch.forEach((columnId) => {
          const cellValue = String(row[columnId] || '');
          const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase();

          if (compareValue.includes(searchValue)) {
            let newValue;
            if (caseSensitive) {
              newValue = cellValue.replaceAll(searchTerm, replaceTerm);
            } else {
              const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              newValue = cellValue.replace(regex, replaceTerm);
            }

            updates.push({
              rowIndex,
              columnId,
              value: newValue
            });
          }
        });
      });
    }

    get().bulkUpdate(updates);
    return updates.length;
  },

  reset: () => set({
    data: [],
    columns: [],
    originalData: [],
    searchResults: [],
    searchTerm: '',
    replaceTerm: '',
    selectedCells: new Set(),
    lastSelectedCell: null,
    isSelecting: false
  }),

  setIsLoading: (value) => set({ isLoading: value }),

  // Selection actions
  selectCell: (rowIndex, columnId, isMulti = false, isRange = false) => {
    set((state) => {
      const cellKey = `${rowIndex}-${columnId}`;
      const newSelectedCells = new Set(state.selectedCells);

      if (isRange && state.lastSelectedCell) {
        // Shift-click: select range from last selected cell to current cell
        const startRow = Math.min(state.lastSelectedCell.rowIndex, rowIndex);
        const endRow = Math.max(state.lastSelectedCell.rowIndex, rowIndex);
        
        const columns = state.columns.map(col => col.id);
        const startColIdx = columns.indexOf(state.lastSelectedCell.columnId);
        const endColIdx = columns.indexOf(columnId);
        const startCol = Math.min(startColIdx, endColIdx);
        const endCol = Math.max(startColIdx, endColIdx);

        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            newSelectedCells.add(`${r}-${columns[c]}`);
          }
        }
      } else if (isMulti) {
        // Ctrl/Cmd-click: toggle cell in selection
        if (newSelectedCells.has(cellKey)) {
          newSelectedCells.delete(cellKey);
        } else {
          newSelectedCells.add(cellKey);
        }
      } else {
        // Normal click: select only this cell
        newSelectedCells.clear();
        newSelectedCells.add(cellKey);
      }

      return {
        selectedCells: newSelectedCells,
        lastSelectedCell: { rowIndex, columnId }
      };
    });
  },

  addCellToSelection: (rowIndex, columnId) => {
    set((state) => {
      const cellKey = `${rowIndex}-${columnId}`;
      const newSelectedCells = new Set(state.selectedCells);
      newSelectedCells.add(cellKey);
      return { selectedCells: newSelectedCells };
    });
  },

  clearSelection: () => {
    set({ selectedCells: new Set(), lastSelectedCell: null });
  },

  setIsSelecting: (value) => set({ isSelecting: value })
}));

export default useDataStore;
