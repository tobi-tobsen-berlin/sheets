# High-Performance React Data Grid

A powerful, Google Sheets-like data grid built with React that handles large CSV datasets (10k-100k+ rows) with ease.

## Features

- 📊 **CSV Data Handling**: Load and parse large CSV files entirely on the frontend
- ⚡ **High Performance**: Virtualized rendering with TanStack Table and React Virtual
- ✏️ **Inline Editing**: Edit cells directly in the grid with keyboard navigation
- 🔍 **Bulk Search & Replace**: Search and replace across entire dataset or selected columns
- 🎯 **Smart State Management**: Efficient updates with Zustand to prevent unnecessary re-renders
- 📱 **Responsive**: Smooth scrolling with sticky headers and resizable columns

## Tech Stack

- **React 18+** - Modern hooks-based architecture
- **TanStack Table v8** - Powerful table management
- **TanStack Virtual** - Efficient row virtualization
- **Zustand** - Lightweight state management
- **PapaParse** - Fast CSV parsing
- **Vite** - Lightning-fast development

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Build

```bash
npm run build
```

## Usage

### Loading CSV Data

1. Click "Load Sample Data" to generate a large dataset
2. Or use "Upload CSV" to load your own CSV file

### Editing

- Click any cell to edit inline
- Use arrow keys or Tab to navigate
- Changes are saved automatically

### Search & Replace

1. Open the Search & Replace panel
2. Enter search term and replacement text
3. Choose scope (all columns or specific columns)
4. Select case sensitivity and match type
5. Click "Replace All" or "Find & Replace"

## Performance Considerations

- **Virtualization**: Only renders visible rows, handling 100k+ rows smoothly
- **Memoization**: Optimized re-rendering with React.memo and useMemo
- **Batched Updates**: Bulk operations are optimized to prevent UI freezes
- **Efficient Data Structures**: Fast lookups and updates using Maps and indexed arrays

## Architecture

```
src/
├── components/          # React components
│   ├── DataGrid.jsx    # Main grid component
│   ├── SearchReplace.jsx
│   └── CSVUploader.jsx
├── store/              # Zustand state management
│   └── dataStore.js
├── utils/              # Utility functions
│   ├── csvParser.js
│   ├── searchReplace.js
│   └── dataGenerator.js
└── styles/             # CSS styles
    └── grid.css
```

## License

MIT
