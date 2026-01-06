import React, { useRef, useState } from 'react';
import { parseCSV, downloadCSV } from '../utils/csvParser';
import { generateSampleData, getSampleColumns } from '../utils/dataGenerator';
import useDataStore from '../store/dataStore';

const CSVUploader = () => {
  const fileInputRef = useRef(null);
  const [rowCount, setRowCount] = useState(10000);
  const { setData, setColumns, data, columns, setIsLoading } = useDataStore();
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    try {
      const { data: csvData, columns: csvColumns } = await parseCSV(file);
      
      if (csvData.length === 0) {
        setError('CSV file is empty');
        return;
      }

      setData(csvData);
      setColumns(csvColumns);
      console.log(`Loaded ${csvData.length} rows with ${csvColumns.length} columns`);
    } catch (err) {
      console.error('Error parsing CSV:', err);
      setError(`Error parsing CSV: ${err.message}`);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerateSample = () => {
    setError('');
    setIsLoading(true);

    try {
      const sampleData = generateSampleData(rowCount);
      const sampleColumns = getSampleColumns();
      
      setData(sampleData);
      setColumns(sampleColumns);
      console.log(`Generated ${sampleData.length} sample rows`);
    } catch (err) {
      console.error('Error generating sample data:', err);
      setError(`Error generating sample data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!data || data.length === 0) {
      setError('No data to download');
      return;
    }

    try {
      downloadCSV(data, columns, 'exported-data.csv');
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError(`Error downloading CSV: ${err.message}`);
    }
  };

  return (
    <div className="csv-uploader">
      <div className="uploader-section">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="csv-file-input"
        />
        <label htmlFor="csv-file-input" className="btn btn-secondary">
          📁 Upload CSV
        </label>
        
        <div className="divider">or</div>
        
        <div className="sample-generator">
          <label htmlFor="row-count">Sample rows:</label>
          <input
            id="row-count"
            type="number"
            min="100"
            max="100000"
            step="1000"
            value={rowCount}
            onChange={(e) => setRowCount(Math.max(100, parseInt(e.target.value) || 1000))}
            className="form-control-sm"
          />
          <button 
            className="btn btn-primary"
            onClick={handleGenerateSample}
          >
            Generate Sample Data
          </button>
        </div>

        {data && data.length > 0 && (
          <button 
            className="btn btn-secondary"
            onClick={handleDownload}
          >
            💾 Download CSV
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
