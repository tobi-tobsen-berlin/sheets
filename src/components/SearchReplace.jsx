import React, { useState, useCallback } from 'react';
import useDataStore from '../store/dataStore';

const SearchReplace = () => {
  const {
    searchTerm,
    replaceTerm,
    caseSensitive,
    selectedColumns,
    columns,
    isSearchOpen,
    setSearchTerm,
    setReplaceTerm,
    setCaseSensitive,
    setSelectedColumns,
    setIsSearchOpen,
    findMatches,
    replaceAll,
  } = useDataStore();

  const [matchCount, setMatchCount] = useState(0);
  const [replaceCount, setReplaceCount] = useState(0);
  const [message, setMessage] = useState('');

  const handleFind = useCallback(() => {
    const matches = findMatches();
    setMatchCount(matches.length);
    setReplaceCount(0);
    setMessage(`Found ${matches.length} match(es)`);
  }, [findMatches]);

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

  const handleColumnToggle = useCallback((columnId) => {
    setSelectedColumns(
      selectedColumns.includes(columnId)
        ? selectedColumns.filter(id => id !== columnId)
        : [...selectedColumns, columnId]
    );
  }, [selectedColumns, setSelectedColumns]);

  const handleSelectAll = useCallback(() => {
    setSelectedColumns(selectedColumns.length === columns.length ? [] : columns.map(col => col.id));
  }, [selectedColumns, columns, setSelectedColumns]);

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
    <div className="search-replace-panel">
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
          <label>Search in columns:</label>
          <div className="column-selector">
            <button 
              className="btn btn-sm"
              onClick={handleSelectAll}
            >
              {selectedColumns.length === columns.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="column-list">
              {columns.map((col) => (
                <label key={col.id} className="checkbox-label column-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.length === 0 || selectedColumns.includes(col.id)}
                    onChange={() => handleColumnToggle(col.id)}
                  />
                  {col.header}
                </label>
              ))}
            </div>
          </div>
          <small className="form-hint">
            {selectedColumns.length === 0 
              ? 'All columns selected' 
              : `${selectedColumns.length} column(s) selected`}
          </small>
        </div>

        <div className="button-group">
          <button 
            className="btn btn-secondary"
            onClick={handleFind}
            disabled={!searchTerm}
          >
            Find Matches
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleReplaceAll}
            disabled={!searchTerm}
          >
            Replace All
          </button>
        </div>

        {message && (
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
