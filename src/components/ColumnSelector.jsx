import React, { useState, useRef, useEffect } from 'react';
import useDataStore from '../store/dataStore';

const ColumnSelector = () => {
  const columns = useDataStore(state => state.columns);
  const hiddenColumns = useDataStore(state => state.hiddenColumns);
  const setHiddenColumns = useDataStore(state => state.setHiddenColumns);
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const toggleColumn = (columnId) => {
    if (hiddenColumns.includes(columnId)) {
      setHiddenColumns(hiddenColumns.filter(id => id !== columnId));
    } else {
      setHiddenColumns([...hiddenColumns, columnId]);
    }
  };

  const showAll = () => {
    setHiddenColumns([]);
  };

  const hideAll = () => {
    setHiddenColumns(columns.map(col => col.id));
  };

  const visibleCount = columns.length - hiddenColumns.length;

  return (
    <div className="column-selector" ref={dropdownRef}>
      <button
        className="column-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Show/Hide Columns"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 2h16v2H0V2zm0 5h16v2H0V7zm0 5h16v2H0v-2z"/>
        </svg>
        <span>Columns ({visibleCount}/{columns.length})</span>
      </button>

      {isOpen && (
        <div className="column-selector-dropdown">
          <div className="column-selector-header">
            <button onClick={showAll} className="link-button">Show All</button>
            <button onClick={hideAll} className="link-button">Hide All</button>
          </div>
          
          <div className="column-selector-list">
            {columns.map(column => (
              <label key={column.id} className="column-selector-item">
                <input
                  type="checkbox"
                  checked={!hiddenColumns.includes(column.id)}
                  onChange={() => toggleColumn(column.id)}
                />
                <span>{column.header || column.id}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;
