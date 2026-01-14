import React, { useMemo, useRef, useCallback, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import useDataStore from '../store/dataStore';

const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);
  const updateCell = useDataStore(state => state.updateCell);
  const searchResults = useDataStore(state => state.searchResults);
  const selectCell = useDataStore(state => state.selectCell);
  const addCellToSelection = useDataStore(state => state.addCellToSelection);
  const selectedCells = useDataStore(state => state.selectedCells);
  const setIsSelecting = useDataStore(state => state.setIsSelecting);
  const isSelecting = useDataStore(state => state.isSelecting);
  
  // Compute if this cell is selected
  const isSelected = selectedCells.has(`${row.index}-${column.id}`);

  const onBlur = useCallback(() => {
    setIsEditing(false);
    if (value !== initialValue) {
      updateCell(row.index, column.id, value);
    }
  }, [value, initialValue, row.index, column.id, updateCell]);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onBlur();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  }, [initialValue, onBlur]);

  // Single click to select
  const onClick = useCallback((e) => {
    e.stopPropagation();
    if (isEditing) return;
    
    const isMulti = e.ctrlKey || e.metaKey;
    const isRange = e.shiftKey;
    selectCell(row.index, column.id, isMulti, isRange);
  }, [row.index, column.id, selectCell, isEditing]);

  // Double click to edit
  const onDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  // Mouse enter during drag selection
  const onMouseEnter = useCallback(() => {
    if (isSelecting) {
      addCellToSelection(row.index, column.id);
    }
  }, [isSelecting, row.index, column.id, addCellToSelection]);

  // Start drag selection
  const onMouseDown = useCallback((e) => {
    if (isEditing) return;
    // Only start drag on left mouse button, no modifier keys
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      setIsSelecting(true);
    }
  }, [setIsSelecting, isEditing]);

  // Update value when initialValue changes
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Check if this cell is in search results
  const matchInfo = useMemo(() => {
    return searchResults.find(
      result => result.rowIndex === row.index && result.columnId === column.id
    );
  }, [searchResults, row.index, column.id]);

  // Highlight matched text
  const renderHighlightedValue = useCallback(() => {
    if (!matchInfo) {
      return String(value ?? '');
    }

    const text = String(value ?? '');
    const { matchIndex, matchedText, exact, score } = matchInfo;
    
    if (!matchedText || matchIndex === undefined) {
      return text;
    }

    const before = text.substring(0, matchIndex);
    const match = text.substring(matchIndex, matchIndex + matchedText.length);
    const after = text.substring(matchIndex + matchedText.length);

    return (
      <>
        {before}
        <mark 
          className={`highlight ${exact ? 'highlight-exact' : 'highlight-fuzzy'}`}
          title={`Match: ${Math.round(score * 100)}% similarity`}
        >
          {match}
        </mark>
        {after}
      </>
    );
  }, [value, matchInfo]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={value ?? ''}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="cell-input"
        autoFocus
      />
    );
  }

  return (
    <div 
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={`cell-value ${matchInfo ? 'has-match' : ''} ${isSelected ? 'cell-selected' : ''}`}
      title={matchInfo ? `Match: ${Math.round(matchInfo.score * 100)}%` : String(value ?? '')}
    >
      {renderHighlightedValue()}
    </div>
  );
};

const DataGrid = () => {
  const data = useDataStore(state => state.data);
  const columns = useDataStore(state => state.columns);
  const hiddenColumns = useDataStore(state => state.hiddenColumns);
  const searchResults = useDataStore(state => state.searchResults);
  const setIsSelecting = useDataStore(state => state.setIsSelecting);
  const selectedCells = useDataStore(state => state.selectedCells);
  const bulkUpdate = useDataStore(state => state.bulkUpdate);
  const clearSelection = useDataStore(state => state.clearSelection);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnSizing, setColumnSizing] = useState({});
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [pasteNotification, setPasteNotification] = useState('');
  
  const tableContainerRef = useRef(null);

  // Handle mouse up to stop drag selection
  React.useEffect(() => {
    const handleMouseUp = () => {
      setIsSelecting(false);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setIsSelecting]);

  // Handle paste (Cmd+V / Ctrl+V) to selected cells
  React.useEffect(() => {
    const handlePaste = async (e) => {
      // Only handle if we have selected cells and not in an input field
      if (selectedCells.size === 0 || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      e.preventDefault();

      try {
        // Read clipboard text
        const clipboardText = await navigator.clipboard.readText();
        
        if (!clipboardText) {
          return;
        }

        // Prepare updates for all selected cells
        const updates = [];
        for (const cellKey of selectedCells) {
          const [rowIndex, columnId] = cellKey.split('-');
          updates.push({
            rowIndex: parseInt(rowIndex),
            columnId,
            value: clipboardText
          });
        }

        // Apply bulk update
        bulkUpdate(updates);
        
        // Show notification
        setPasteNotification(`Pasted to ${selectedCells.size} cell${selectedCells.size !== 1 ? 's' : ''}`);
        setTimeout(() => setPasteNotification(''), 2000);
        
        // Clear selection after paste
        clearSelection();
      } catch (err) {
        console.error('Paste failed:', err);
        setPasteNotification('Paste failed - clipboard permission denied');
        setTimeout(() => setPasteNotification(''), 2000);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [selectedCells, bulkUpdate, clearSelection]);

  // Filter out hidden columns
  const visibleColumns = useMemo(() => {
    return columns.filter(col => !hiddenColumns.includes(col.id));
  }, [columns, hiddenColumns]);

  // Initialize column order when columns change
  React.useEffect(() => {
    if (visibleColumns.length > 0 && columnOrder.length === 0) {
      setColumnOrder(visibleColumns.map(col => col.id));
    }
  }, [visibleColumns, columnOrder.length]);

  // Update column order when columns are hidden/shown
  React.useEffect(() => {
    if (visibleColumns.length > 0) {
      const visibleIds = visibleColumns.map(col => col.id);
      setColumnOrder(prev => prev.filter(id => visibleIds.includes(id)));
    }
  }, [visibleColumns]);

  // Add editable cell to visible columns only
  const editableColumns = useMemo(() => {
    return visibleColumns.map(col => ({
      ...col,
      cell: EditableCell
    }));
  }, [visibleColumns]);

  const table = useReactTable({
    data,
    columns: editableColumns,
    state: {
      sorting,
      columnFilters,
      columnOrder,
      columnSizing,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 60,
      maxSize: 800,
      size: 150,
    },
    debugTable: false,
  });

  const { rows } = table.getRowModel();

  // Drag and drop handlers
  const handleDragStart = useCallback((e, columnId) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnId);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, targetColumnId) => {
    e.preventDefault();
    
    const draggedColumnId = e.dataTransfer.getData('text/plain');
    
    if (draggedColumnId === targetColumnId) {
      setDraggedColumn(null);
      return;
    }

    setColumnOrder(prevOrder => {
      const newOrder = [...prevOrder];
      const draggedIndex = newOrder.indexOf(draggedColumnId);
      const targetIndex = newOrder.indexOf(targetColumnId);
      
      // Remove dragged column and insert at target position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumnId);
      
      return newOrder;
    });
    
    setDraggedColumn(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
  }, []);

  // Virtualization for rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: useCallback(() => 35, []),
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p>No data loaded. Upload a CSV file or generate sample data to get started.</p>
      </div>
    );
  }

  return (
    <div className="data-grid-container">
      <div className="data-info">
        <span>{data.length.toLocaleString()} rows × {columns.length} columns</span>
        {searchResults.length > 0 && (
          <span className="search-results-badge">
            🔍 {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} highlighted
            {searchResults.some(r => !r.exact) && (
              <span className="fuzzy-indicator"> (includes fuzzy matches)</span>
            )}
          </span>
        )}
        {pasteNotification && (
          <span className="paste-notification">
            📋 {pasteNotification}
          </span>
        )}
      </div>
      
      <div 
        ref={tableContainerRef}
        className="table-container"
      >
        <table 
          className="data-table"
          style={{
            width: table.getTotalSize(),
          }}
        >
          <thead className="table-header">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, header.column.id)}
                    className={`
                      ${draggedColumn === header.column.id ? 'dragging' : ''}
                      ${draggedColumn && draggedColumn !== header.column.id ? 'drag-target' : ''}
                    `}
                    style={{
                      width: header.getSize(),
                      position: 'relative',
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, header.column.id)}
                          onDragEnd={handleDragEnd}
                          className={header.column.getCanSort() ? 'header-sortable' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="drag-handle">⋮⋮</span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
                        />
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map(virtualRow => {
              const row = rows[virtualRow.index];
              return (
                <tr key={row.id} className="table-row">
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataGrid;
