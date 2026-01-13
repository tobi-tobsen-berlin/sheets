import React, { useState, useCallback } from 'react';
import useDataStore from '../store/dataStore';

const SearchReplace = () => {
  const {
    searchTerm,
    replaceTerm,
    caseSensitive,
    selectedColumns,
    columns,
    hiddenColumns,
    isSearchOpen,
    fuzzySearch,
    fuzzyThreshold,
    isSearching,
    searchProgress,
    data,
    setSearchTerm,
    setReplaceTerm,
    setCaseSensitive,
    setSelectedColumns,
    setIsSearchOpen,
    setFuzzySearch,
    setFuzzyThreshold,
    findMatches,
    replaceAll,
  } = useDataStore();

  const [matchCount, setMatchCount] = useState(0);
  const [replaceCount, setReplaceCount] = useState(0);
  const [message, setMessage] = useState('');
  const panelRef = React.useRef(null);

  // Debug: Log when isSearching changes
  React.useEffect(() => {
    console.log('🎯 SearchReplace - isSearching changed:', isSearching, 'progress:', searchProgress);
  }, [isSearching, searchProgress]);

  // Auto-scroll to top when search starts
  React.useEffect(() => {
    if (isSearching && panelRef.current) {
      console.log('📜 Scrolling dialog to top...');
      panelRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [isSearching]);

  const handleFind = useCallback(async () => {
    console.log('🔍 Starting search, isSearching should be true now');
    setMessage('Searching...');
    
    try {
      const matches = await findMatches();
      setMatchCount(matches.length);
      setReplaceCount(0);
      
      const exactMatches = matches.filter(m => m.exact).length;
      const fuzzyMatches = matches.length - exactMatches;
      
      let msg = `Found ${matches.length} match(es)`;
      if (fuzzySearch && fuzzyMatches > 0) {
        msg += ` (${exactMatches} exact, ${fuzzyMatches} fuzzy)`;
      }
      setMessage(msg);
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Search failed');
    }
    
    console.log('🔍 Search completed, isSearching should be false now');
  }, [findMatches, fuzzySearch]);

  const handleReplaceAll = useCallback(() => {
    if (!searchTerm) {
      setMessage('Please enter a search term');
      return;
    }

    const count = replaceAll(searchTerm, replaceTerm);
    setReplaceCount(count);
    setMatchCount(0);
    setMessage(`Replaced ${count} occurrence(s)`);
  }, [searchTerm, replaceTerm, replaceAll]);

  const handleClearHighlights = useCallback(() => {
    useDataStore.setState({ searchResults: [] });
    setMatchCount(0);
    setMessage('');
  }, []);

  const handleColumnToggle = useCallback((columnId) => {
    setSelectedColumns(
      selectedColumns.includes(columnId)
        ? selectedColumns.filter(id => id !== columnId)
        : [...selectedColumns, columnId]
    );
  }, [selectedColumns, setSelectedColumns]);

  const handleSelectAll = useCallback(() => {
    // Only select/deselect visible columns
    const visibleColumns = columns.filter(col => !hiddenColumns.includes(col.id));
    const visibleIds = visibleColumns.map(col => col.id);
    const allVisibleSelected = visibleIds.every(id => selectedColumns.length === 0 || selectedColumns.includes(id));
    
    if (allVisibleSelected) {
      // Deselect all visible, keep hidden ones selected
      setSelectedColumns(selectedColumns.filter(id => hiddenColumns.includes(id)));
    } else {
      // Select all visible
      const newSelection = [...new Set([...selectedColumns, ...visibleIds])];
      setSelectedColumns(newSelection);
    }
  }, [selectedColumns, columns, hiddenColumns, setSelectedColumns]);

  if (!isSearchOpen) {
    return (
      <button 
        className="btn btn-primary search-toggle"
        onClick={() => setIsSearchOpen(true)}
      >
        🔍 Search & Replace
      </button>
    );
  }

  return (
    <div className="search-replace-panel" ref={panelRef}>
      <div className="search-header">
        <h3>Search & Replace</h3>
        <button 
          className="btn-close"
          onClick={() => setIsSearchOpen(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Progress bar at the top */}
      {isSearching && (
        <div className="search-progress-top">
          <div className="progress-header">
            <span className="progress-label">🔍 Searching...</span>
            <span className="progress-percentage">{searchProgress}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${searchProgress}%` }}
            />
          </div>
          <div className="progress-info-compact">
            {Math.round((searchProgress / 100) * data.length).toLocaleString()} / {data.length.toLocaleString()} rows
          </div>
        </div>
      )}

      <div className="search-form">
        <div className="form-group">
          <label htmlFor="search-input">Search for:</label>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter search term..."
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="replace-input">Replace with:</label>
          <input
            id="replace-input"
            type="text"
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            placeholder="Enter replacement text..."
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            Case sensitive
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={fuzzySearch}
              onChange={(e) => setFuzzySearch(e.target.checked)}
            />
            Fuzzy search (allows typos and variations)
          </label>
        </div>

        {fuzzySearch && (
          <div className="form-group">
            <label htmlFor="fuzzy-threshold">
              Match sensitivity: {Math.round(fuzzyThreshold * 100)}%
              <small className="form-hint"> (Higher = stricter matching)</small>
            </label>
            <input
              id="fuzzy-threshold"
              type="range"
              min="0.3"
              max="0.95"
              step="0.05"
              value={fuzzyThreshold}
              onChange={(e) => setFuzzyThreshold(parseFloat(e.target.value))}
              className="range-slider"
            />
            <div className="range-labels">
              <span>Loose (30%)</span>
              <span>Strict (95%)</span>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Search in columns:</label>
          <div className="column-selector">
            <button 
              className="btn btn-sm"
              onClick={handleSelectAll}
            >
              Select/Deselect All Visible
            </button>
            <div className="column-list">
              {columns.map((col) => {
                const isHidden = hiddenColumns.includes(col.id);
                const isChecked = selectedColumns.length === 0 || selectedColumns.includes(col.id);
                
                return (
                  <label 
                    key={col.id} 
                    className={`checkbox-label column-item ${isHidden ? 'column-hidden' : ''}`}
                    title={isHidden ? 'Column is hidden' : ''}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleColumnToggle(col.id)}
                      disabled={isHidden}
                    />
                    <span>{col.header}</span>
                    {isHidden && <span className="hidden-badge">Hidden</span>}
                  </label>
                );
              })}
            </div>
          </div>
          <small className="form-hint">
            {selectedColumns.length === 0 
              ? `All visible columns selected (${columns.length - hiddenColumns.length})` 
              : `${selectedColumns.filter(id => !hiddenColumns.includes(id)).length} visible column(s) selected`}
          </small>
        </div>

        {/* Debug info - remove later */}
        <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.5rem' }}>
          Debug: isSearching={String(isSearching)}, progress={searchProgress}%
        </div>

        <div className="button-group">
          <button 
            className="btn btn-secondary"
            onClick={handleFind}
            disabled={!searchTerm || isSearching}
          >
            {isSearching ? 'Searching...' : 'Find Matches'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleReplaceAll}
            disabled={!searchTerm || isSearching}
          >
            Replace All
          </button>
        </div>
        
        {matchCount > 0 && !isSearching && (
          <button 
            className="btn btn-secondary btn-clear"
            onClick={handleClearHighlights}
          >
            Clear Highlights
          </button>
        )}

        {message && !isSearching && (
          <div className={`message ${replaceCount > 0 ? 'message-success' : 'message-info'}`}>
            {message}
          </div>
        )}

        {matchCount > 0 && (
          <div className="match-info">
            <strong>{matchCount}</strong> match(es) found
            {selectedColumns.length > 0 && (
              <span> in {selectedColumns.length} column(s)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchReplace;
