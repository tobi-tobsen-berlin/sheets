# Data grid frontend prototype

Data grid frontend prototype built with React that handles large CSV datasets (10k-100k+ rows) with ease.

## Features

- 📊 **CSV Data Handling**: Load and parse large CSV files entirely on the frontend
- ⚡ **High Performance**: Virtualized rendering with TanStack Table and React Virtual
- ✏️ **Inline Editing**: Edit cells directly in the grid with double-click or start typing
- 🎯 **Multi-Select Cells**: Sheets-style cell selection (click, drag, shift-click, ctrl/cmd-click)
- ✏️ **Bulk Edit**: Edit multiple selected cells at once with replace, append, or prepend modes
- 🔍 **Bulk Search & Replace**: Search and replace across entire dataset or selected columns
- 🎯 **Fuzzy Search**: Find matches even with typos and variations (e.g., "Jhon" matches "John")
- 🔀 **Column Reordering**: Drag and drop columns to reorder them
- 📏 **Column Resizing**: Drag column edges to adjust width with real-time preview
- 🎯 **Smart Column Sizing**: Automatic column width based on header and content length
- 🎯 **Smart State Management**: Efficient updates with Zustand to prevent unnecessary re-renders
- 📱 **Responsive**: Smooth scrolling with sticky headers and optimized performance

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

### Cell Selection

- **Single click** - Select a cell (highlighted in blue)
- **Double-click** - Edit the cell content
- **Click and drag** - Select multiple cells
- **Shift + click** - Select a range from last selected cell to current
- **Ctrl/Cmd + click** - Add individual cells to selection
- **Ctrl/Cmd + V** - Paste clipboard value to all selected cells

### Editing Cells

#### Single Cell Editing
- **Double-click** any cell to edit inline
- **Start typing** while a cell is selected to edit
- **Enter** to save, **Escape** to cancel
- Changes are saved automatically

#### Bulk Edit (Multiple Cells)

**Method 1: Bulk Edit Dialog**
1. Select multiple cells using any selection method
2. Click "✏️ Edit Selected (N)" button in toolbar
3. Choose edit mode:
   - **Replace** - Overwrite existing values
   - **Append** - Add to end of existing values
   - **Prepend** - Add to beginning of existing values
4. Enter new value
5. Preview changes before applying
6. Click "Apply" to update all selected cells

**Method 2: Quick Paste (Ctrl/Cmd + V)**
1. Select multiple cells
2. Copy a value to your clipboard (from anywhere)
3. Press **Ctrl+V** (Windows/Linux) or **Cmd+V** (Mac)
4. The value is instantly pasted to all selected cells
5. A notification confirms the number of cells updated

### Column Management

#### Reordering Columns
- **Drag** the column header (⋮⋮ icon area) to reorder columns
- Drop between other columns to reposition

#### Resizing Columns
- **Hover** over the right edge of any column header
- **Drag** the edge left or right to resize
- Column width updates in real-time
- Automatic sizing based on header and content length

### Search & Replace

1. Click **"🔍 Search & Replace"** button
2. Enter search term and replacement text
3. Choose scope (all columns or specific columns)
4. Select options:
   - **Case sensitivity**: Exact case matching
   - **Fuzzy search**: Allow typos and variations
   - **Match sensitivity**: Adjust fuzzy matching threshold (30-95%)
5. Click **"Find Matches"** to preview or **"Replace All"** to execute
6. Highlights are automatically cleared after replace

#### Fuzzy Search Examples
- "Jhon" matches "John" (typo)
- "acme" matches "Acme Corp" (partial match)
- "newyork" matches "New York" (spacing variation)
- Sensitivity slider: Higher % = stricter matching

## Performance Considerations

- **Virtualization**: Only renders visible rows, handling 100k+ rows smoothly
- **Memoization**: Optimized re-rendering with React.memo and useMemo
- **Batched Updates**: Bulk operations are optimized to prevent UI freezes
- **Efficient Data Structures**: Fast lookups and updates using Maps and indexed arrays
- **GPU Acceleration**: Hardware-accelerated column resizing with CSS transforms
- **Smart Rendering**: Cells use CSS containment for isolated rendering performance
- **Optimized Interactions**: Pointer events disabled during resize for smoother dragging

## Architecture

```
src/
├── components/          # React components
│   ├── DataGrid.jsx    # Main grid with virtualization & resizing
│   ├── SearchReplace.jsx
│   ├── BulkEdit.jsx    # Bulk edit dialog
│   ├── CSVUploader.jsx
│   └── ColumnSelector.jsx
├── store/              # Zustand state management
│   └── dataStore.js    # Includes cell selection state
├── utils/              # Utility functions
│   ├── csvParser.js    # Smart column sizing
│   ├── fuzzySearch.js
│   └── dataGenerator.js
└── styles/             # CSS styles
    └── grid.css        # Includes selection & resize styles
```

## License

MIT
