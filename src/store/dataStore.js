import { create } from 'zustand';
import { fuzzyMatch } from '../utils/fuzzySearch';

const useDataStore = create((set, get) => ({
  // Core data
  data: [],
  columns: [],
  originalData: [],
  
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
  
  // Actions
  setData: (newData) => {
    set({ 
      data: newData, 
      originalData: JSON.parse(JSON.stringify(newData)) 
    });
  },
  
  setColumns: (cols) => set({ columns: cols }),
  
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
    
    console.log('🔍 Search Debug:', {
      searchTerm,
      fuzzySearch,
      fuzzyThreshold,
      caseSensitive,
      selectedColumns: selectedColumns.length > 0 ? selectedColumns : 'ALL',
      totalRows: data.length,
      totalColumns: columns.length
    });
    
    if (!searchTerm) {
      set({ searchResults: [], isSearching: false, searchProgress: 0 });
      return [];
    }
    
    // Start search with progress
    console.log('🚀 Setting isSearching to TRUE, searchProgress to 0');
    set({ isSearching: true, searchProgress: 0 });
    
    // Small delay to ensure UI updates
    console.log('⏳ Waiting 10ms for UI to update...');
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('✅ Starting search loop...');
    
    const results = [];
    const columnsToSearch = selectedColumns.length > 0 
      ? selectedColumns 
      : columns.map(col => col.id);
    
    console.log('📋 Columns to search:', columnsToSearch);
    
    const totalRows = data.length;
    // Make updates MORE frequent for better visibility
    const updateInterval = Math.max(1, Math.floor(totalRows / 100)); // Update progress 100 times
    const uiUpdateInterval = Math.max(5, Math.floor(totalRows / 50)); // UI refresh 50 times
    
    console.log('📊 Progress update intervals:', { 
      updateInterval, 
      uiUpdateInterval, 
      totalRows,
      expectedUpdates: Math.ceil(totalRows / updateInterval)
    });
    
    if (fuzzySearch) {
      console.log('✨ Using FUZZY search mode');
      console.log(`🔄 Starting loop through ${totalRows} rows...`);
      
      // Fuzzy search mode with progress
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        // Debug: Log first few iterations
        if (rowIndex < 5) {
          console.log(`  → Processing row ${rowIndex}...`);
        }
        
        const row = data[rowIndex];
        
        for (const columnId of columnsToSearch) {
          const cellValue = String(row[columnId] || '');
          const match = fuzzyMatch(cellValue, searchTerm, fuzzyThreshold, caseSensitive);
          
          if (match && match.matched) {
            results.push({
              rowIndex,
              columnId,
              value: cellValue,
              matchIndex: match.matchIndex,
              score: match.score,
              exact: match.exact,
              matchedText: match.matchedText
            });
          }
        }
        
        // Update progress more frequently
        if (rowIndex % updateInterval === 0 || rowIndex === totalRows - 1) {
          const progress = Math.min(99, Math.round(((rowIndex + 1) / totalRows) * 100));
          console.log(`📊 Progress update (FUZZY): ${progress}% (row ${rowIndex + 1}/${totalRows})`);
          set({ searchProgress: progress });
        }
        
        // Allow UI to update more often
        if (rowIndex % uiUpdateInterval === 0) {
          console.log(`⏸️ UI refresh at row ${rowIndex} (FUZZY mode)`);
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      // Sort by score (best matches first)
      results.sort((a, b) => b.score - a.score);
    } else {
      console.log('📝 Using EXACT search mode');
      console.log(`🔄 Starting loop through ${totalRows} rows...`);
      
      // Exact search mode with progress
      const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();
      
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        // Debug: Log first few iterations
        if (rowIndex < 5) {
          console.log(`  → Processing row ${rowIndex}...`);
        }
        
        const row = data[rowIndex];
        
        for (const columnId of columnsToSearch) {
          const cellValue = String(row[columnId] || '');
          const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase();
          
          if (compareValue.includes(searchValue)) {
            results.push({
              rowIndex,
              columnId,
              value: cellValue,
              matchIndex: compareValue.indexOf(searchValue),
              score: 1.0,
              exact: true
            });
          }
        }
        
        // Update progress more frequently
        if (rowIndex % updateInterval === 0 || rowIndex === totalRows - 1) {
          const progress = Math.min(99, Math.round(((rowIndex + 1) / totalRows) * 100));
          console.log(`📊 Progress update: ${progress}% (row ${rowIndex + 1}/${totalRows})`);
          set({ searchProgress: progress });
        }
        
        // Allow UI to update more often
        if (rowIndex % uiUpdateInterval === 0) {
          console.log(`⏸️ UI refresh at row ${rowIndex}`);
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
    }
    
    console.log(`🎯 Total matches found: ${results.length}`);
    if (results.length > 0) {
      console.log('First 3 matches:', results.slice(0, 3));
    }
    
    console.log('✅ Setting isSearching to FALSE and searchProgress to 100');
    set({ searchResults: results, isSearching: false, searchProgress: 100 });
    return results;
  },
  
  replaceAll: (searchTerm, replaceTerm) => {
    const { data, caseSensitive, selectedColumns, columns, fuzzySearch, fuzzyThreshold } = get();
    const updates = [];
    
    const columnsToSearch = selectedColumns.length > 0 
      ? selectedColumns 
      : columns.map(col => col.id);
    
    console.log('🔄 Replace All Debug:', {
      searchTerm,
      replaceTerm,
      fuzzySearch,
      fuzzyThreshold
    });
    
    if (fuzzySearch) {
      console.log('✨ Using FUZZY replace mode');
      // Fuzzy replace mode
      data.forEach((row, rowIndex) => {
        columnsToSearch.forEach((columnId) => {
          const cellValue = String(row[columnId] || '');
          const match = fuzzyMatch(cellValue, searchTerm, fuzzyThreshold, caseSensitive);
          
          if (match && match.matched) {
            // Replace the matched text (which might differ from search term)
            const beforeMatch = cellValue.substring(0, match.matchIndex);
            const afterMatch = cellValue.substring(match.matchIndex + match.matchedText.length);
            const newValue = beforeMatch + replaceTerm + afterMatch;
            
            console.log('🔄 Fuzzy replace:', {
              original: cellValue,
              matched: match.matchedText,
              newValue,
              rowIndex,
              columnId
            });
            
            updates.push({
              rowIndex,
              columnId,
              value: newValue
            });
          }
        });
      });
    } else {
      console.log('📝 Using EXACT replace mode');
      // Exact replace mode
      const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();
      
      data.forEach((row, rowIndex) => {
        columnsToSearch.forEach((columnId) => {
          const cellValue = String(row[columnId] || '');
          const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase();
          
          if (compareValue.includes(searchValue)) {
            // Preserve case if not case-sensitive
            let newValue;
            if (caseSensitive) {
              newValue = cellValue.replaceAll(searchTerm, replaceTerm);
            } else {
              // Case-insensitive replace
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
    
    console.log(`🎯 Total replacements: ${updates.length}`);
    
    get().bulkUpdate(updates);
    return updates.length;
  },
  
  reset: () => set({ 
    data: [], 
    columns: [], 
    originalData: [],
    searchResults: [],
    searchTerm: '',
    replaceTerm: ''
  }),
  
  setIsLoading: (value) => set({ isLoading: value })
}));

export default useDataStore;
