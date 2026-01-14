import React, { useState } from 'react';
import useDataStore from '../store/dataStore';

const BulkEdit = () => {
  const selectedCells = useDataStore(state => state.selectedCells);
  const data = useDataStore(state => state.data);
  const columns = useDataStore(state => state.columns);
  const bulkUpdate = useDataStore(state => state.bulkUpdate);
  const clearSelection = useDataStore(state => state.clearSelection);
  
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [editMode, setEditMode] = useState('replace'); // 'replace', 'append', 'prepend'

  const selectedCount = selectedCells.size;

  // Get preview of what will be changed
  const getPreview = () => {
    const preview = [];
    let count = 0;
    const maxPreview = 5;

    for (const cellKey of selectedCells) {
      if (count >= maxPreview) break;
      
      const [rowIndex, columnId] = cellKey.split('-');
      const row = data[parseInt(rowIndex)];
      if (row) {
        const currentValue = row[columnId];
        const columnName = columns.find(col => col.id === columnId)?.header || columnId;
        
        let futureValue = newValue;
        if (editMode === 'append') {
          futureValue = (currentValue || '') + newValue;
        } else if (editMode === 'prepend') {
          futureValue = newValue + (currentValue || '');
        }
        
        preview.push({
          rowIndex: parseInt(rowIndex),
          columnName,
          currentValue: currentValue || '(empty)',
          futureValue
        });
        count++;
      }
    }
    
    return preview;
  };

  const handleBulkEdit = () => {
    const updates = [];
    
    for (const cellKey of selectedCells) {
      const [rowIndex, columnId] = cellKey.split('-');
      const row = data[parseInt(rowIndex)];
      
      if (row) {
        let value = newValue;
        
        if (editMode === 'append') {
          value = (row[columnId] || '') + newValue;
        } else if (editMode === 'prepend') {
          value = newValue + (row[columnId] || '');
        }
        
        updates.push({
          rowIndex: parseInt(rowIndex),
          columnId,
          value
        });
      }
    }
    
    bulkUpdate(updates);
    setIsOpen(false);
    setNewValue('');
    clearSelection();
  };

  const handleClose = () => {
    setIsOpen(false);
    setNewValue('');
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setIsOpen(true)}
        title={`Edit ${selectedCount} selected cell${selectedCount !== 1 ? 's' : ''}`}
      >
        ✏️ Edit Selected ({selectedCount})
      </button>

      {isOpen && (
        <>
          <div className="modal-overlay" onClick={handleClose}></div>
          <div className="bulk-edit-dialog">
            <div className="search-header">
              <h3>Bulk Edit {selectedCount} Cells</h3>
              <button className="btn-close" onClick={handleClose}>×</button>
            </div>

            <div className="bulk-edit-content">
              <div className="form-group">
                <label>Edit Mode</label>
                <div className="edit-mode-selector">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="editMode"
                      value="replace"
                      checked={editMode === 'replace'}
                      onChange={(e) => setEditMode(e.target.value)}
                    />
                    Replace - Overwrite existing values
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="editMode"
                      value="append"
                      checked={editMode === 'append'}
                      onChange={(e) => setEditMode(e.target.value)}
                    />
                    Append - Add to end of existing values
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="editMode"
                      value="prepend"
                      checked={editMode === 'prepend'}
                      onChange={(e) => setEditMode(e.target.value)}
                    />
                    Prepend - Add to beginning of existing values
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bulkValue">New Value</label>
                <textarea
                  id="bulkValue"
                  className="form-control"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter value to apply to all selected cells..."
                  rows={3}
                  autoFocus
                />
              </div>

              {newValue && (
                <div className="bulk-edit-preview">
                  <h4>Preview (showing first 5 cells):</h4>
                  <div className="preview-list">
                    {getPreview().map((item, idx) => (
                      <div key={idx} className="preview-item">
                        <div className="preview-cell">
                          <span className="preview-label">Row {item.rowIndex + 1} - {item.columnName}</span>
                          <div className="preview-change">
                            <span className="preview-old">{String(item.currentValue)}</span>
                            <span className="preview-arrow">→</span>
                            <span className="preview-new">{String(item.futureValue)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedCount > 5 && (
                      <div className="preview-more">
                        ...and {selectedCount - 5} more cells
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="button-group" style={{ marginTop: '1.5rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleBulkEdit}
                  disabled={!newValue}
                >
                  Apply to {selectedCount} Cell{selectedCount !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BulkEdit;
