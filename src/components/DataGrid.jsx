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

  const onClick = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  // Update value when initialValue changes
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

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
      className="cell-value"
      title={String(value ?? '')}
    >
      {String(value ?? '')}
    </div>
  );
};

const DataGrid = () => {
  const data = useDataStore(state => state.data);
  const columns = useDataStore(state => state.columns);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [draggedColumn, setDraggedColumn] = useState(null);
  
  const tableContainerRef = useRef(null);

  // Initialize column order when columns change
  React.useEffect(() => {
    if (columns.length > 0 && columnOrder.length === 0) {
      setColumnOrder(columns.map(col => col.id));
    }
  }, [columns, columnOrder.length]);

  // Add editable cell to all columns
  const editableColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      cell: EditableCell
    }));
  }, [columns]);

  const table = useReactTable({
    data,
    columns: editableColumns,
    state: {
      sorting,
      columnFilters,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
      </div>
      
      <div 
        ref={tableContainerRef}
        className="table-container"
      >
        <table className="data-table">
          <thead className="table-header">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    draggable={!header.isPlaceholder}
                    onDragStart={(e) => handleDragStart(e, header.column.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, header.column.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      ${draggedColumn === header.column.id ? 'dragging' : ''}
                      ${draggedColumn && draggedColumn !== header.column.id ? 'drag-target' : ''}
                    `}
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
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
