import { create } from 'zustand';

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
  
  // UI state
  isSearchOpen: false,
  isLoading: false,
  
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
  
  findMatches: () => {
    const { data, searchTerm, caseSensitive, selectedColumns, columns } = get();
    
    if (!searchTerm) {
      set({ searchResults: [] });
      return [];
    }
    
    const results = [];
    const columnsToSearch = selectedColumns.length > 0 
      ? selectedColumns 
      : columns.map(col => col.id);
    
    const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    
    data.forEach((row, rowIndex) => {
      columnsToSearch.forEach((columnId) => {
        const cellValue = String(row[columnId] || '');
        const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase();
        
        if (compareValue.includes(searchValue)) {
          results.push({
            rowIndex,
            columnId,
            value: cellValue,
            matchIndex: compareValue.indexOf(searchValue)
          });
        }
      });
    });
    
    set({ searchResults: results });
    return results;
  },
  
  replaceAll: (searchTerm, replaceTerm) => {
    const { data, caseSensitive, selectedColumns, columns } = get();
    const updates = [];
    
    const columnsToSearch = selectedColumns.length > 0 
      ? selectedColumns 
      : columns.map(col => col.id);
    
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
