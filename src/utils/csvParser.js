import Papa from 'papaparse';

/**
 * Parse CSV file and return normalized data structure
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        
        const data = results.data;
        const columns = results.meta.fields.map((field, index) => ({
          id: field,
          accessorKey: field,
          header: field,
          cell: info => info.getValue(),
          enableSorting: true,
          enableColumnFilter: true,
          size: 150,
          minSize: 60,
          maxSize: 500
        }));
        
        resolve({ data, columns });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Convert data array to CSV string
 */
export const dataToCSV = (data, columns) => {
  if (!data || data.length === 0) return '';
  
  const headers = columns.map(col => col.id);
  const csv = Papa.unparse({
    fields: headers,
    data: data.map(row => headers.map(header => row[header] ?? ''))
  });
  
  return csv;
};

/**
 * Download data as CSV file
 */
export const downloadCSV = (data, columns, filename = 'data.csv') => {
  const csv = dataToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Validate CSV data structure
 */
export const validateCSVData = (data, columns) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('Columns must be a non-empty array');
  }
  
  // Check if all rows have the expected columns
  const columnIds = new Set(columns.map(col => col.id));
  const isValid = data.every(row => {
    const rowKeys = Object.keys(row);
    return rowKeys.every(key => columnIds.has(key));
  });
  
  if (!isValid) {
    console.warn('Some rows have unexpected columns');
  }
  
  return true;
};
