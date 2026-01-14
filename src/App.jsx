import React from 'react';
import DataGrid from './components/DataGrid';
import SearchReplace from './components/SearchReplace';
import CSVUploader from './components/CSVUploader';
import ColumnSelector from './components/ColumnSelector';
import BulkEdit from './components/BulkEdit';
import useDataStore from './store/dataStore';
import './styles/grid.css';

function App() {
  const isLoading = useDataStore(state => state.isLoading);
  const data = useDataStore(state => state.data);

  return (
    <div className="app">
      <div className="toolbar">
        <CSVUploader />
        <ColumnSelector />
        <BulkEdit />
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
    </div>
  );
}

export default App;
