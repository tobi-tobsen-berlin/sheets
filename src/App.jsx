import React from 'react';
import DataGrid from './components/DataGrid';
import SearchReplace from './components/SearchReplace';
import CSVUploader from './components/CSVUploader';
import useDataStore from './store/dataStore';
import './styles/grid.css';

function App() {
  const isLoading = useDataStore(state => state.isLoading);
  const data = useDataStore(state => state.data);

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚡ High-Performance React Data Grid</h1>
        <p className="subtitle">
          Google Sheets-like experience for large datasets • Built with React 18 + TanStack Table
        </p>
      </header>

      <div className="toolbar">
        <CSVUploader />
        <SearchReplace />
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      )}

      <main className="app-main">
        <DataGrid />
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <strong>Features:</strong>
            <ul>
              <li>✓ Virtualized rendering for 100k+ rows</li>
              <li>✓ Inline cell editing</li>
              <li>✓ Bulk search & replace</li>
              <li>✓ Sorting & filtering</li>
            </ul>
          </div>
          <div className="footer-section">
            <strong>Keyboard Shortcuts:</strong>
            <ul>
              <li>Click cell to edit</li>
              <li>Enter to save</li>
              <li>Escape to cancel</li>
              <li>Click headers to sort</li>
            </ul>
          </div>
          <div className="footer-section">
            <strong>Performance Tips:</strong>
            <ul>
              <li>Only visible rows are rendered</li>
              <li>Bulk operations are optimized</li>
              <li>State updates are batched</li>
              <li>Smooth 60fps scrolling</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
