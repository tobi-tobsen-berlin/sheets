/**
 * Generate sample artwork data for testing
 */

const artists = [
  'Yayoi Kusama', 'Pablo Picasso', 'Frida Kahlo', 'Vincent van Gogh', 'Claude Monet',
  'Georgia O\'Keeffe', 'Andy Warhol', 'Salvador Dalí', 'Rembrandt van Rijn', 'Leonardo da Vinci',
  'Michelangelo', 'Edvard Munch', 'Henri Matisse', 'Jackson Pollock', 'Mark Rothko',
  'Jean-Michel Basquiat', 'Banksy', 'Gerhard Richter', 'Ai Weiwei', 'Damien Hirst',
  'Jeff Koons', 'Takashi Murakami', 'Cindy Sherman', 'Anselm Kiefer', 'David Hockney',
  'Lucian Freud', 'Francis Bacon', 'Willem de Kooning', 'Cy Twombly', 'Ellsworth Kelly'
];

const artworkTitles = [
  'Infinity Nets', 'Starry Night', 'The Persistence of Memory', 'Water Lilies', 'The Scream',
  'Untitled', 'Composition', 'Study', 'Portrait', 'Landscape',
  'Still Life', 'Abstract', 'Figure Study', 'Self Portrait', 'Nude',
  'Garden Scene', 'Urban Life', 'The Bridge', 'Reflections', 'Morning Light',
  'Evening Glow', 'Blue Period', 'Red Series', 'Black Paintings', 'White on White'
];

const mediums = [
  'Oil on canvas', 'Acrylic on canvas', 'Mixed media', 'Watercolor on paper',
  'Pastel on paper', 'Charcoal on paper', 'Oil on panel', 'Tempera on canvas',
  'Ink on paper', 'Graphite on paper', 'Lithograph', 'Silkscreen', 'Etching',
  'Acrylic and oil on canvas', 'Spray paint on canvas'
];

const categories = ['Fine Art', 'Contemporary Art', 'Modern Art', 'Sculpture', 'Photography', 'Prints', 'Drawings'];
const subCategories = ['Paintings', 'Works on Paper', 'Mixed Media', 'Limited Edition Prints'];
const genres = [
  'Post-War & Contemporary Art', 'Impressionism', 'Abstract Expressionism',
  'Surrealism', 'Pop Art', 'Minimalism', '20th Century Design', 'Modernism'
];
const subjects = [
  'Abstract', 'Landscape', 'Portrait', 'Still Life', 'Seascape', 'Urban Scene',
  'Nature', 'Figurative', 'Geometric', 'Cubist Scene'
];
const locations = ['Gallery', 'Storage', 'On Loan', 'Private Collection', 'Museum'];
const subLocations = ['Main Gallery', 'Storage Room A', 'Storage Room B', 'Conservation Lab', 'Display Case'];
const conditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Needs Restoration'];
const currencies = ['USD', 'EUR', 'GBP', 'CHF'];

const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// Sample text snippets for descriptions
const descriptionParts = [
  "This remarkable piece showcases the artist's unique vision and mastery of technique.",
  "The work captures a pivotal moment in the evolution of modern art.",
  "Notable for its bold use of color and innovative composition.",
  "Executed during a period of significant artistic development.",
  "The painting demonstrates exceptional attention to detail and emotional depth.",
  "This piece reflects the artist's exploration of form and space.",
  "A stunning example of the artist's mature style.",
  "The work reveals the influence of various artistic movements.",
  "Characterized by dynamic brushwork and vibrant palette.",
  "This composition exemplifies the artist's innovative approach to perspective.",
  "The artwork emerged during a particularly productive phase of the artist's career.",
  "Notable for its harmonious balance of light and shadow.",
  "The piece demonstrates remarkable technical proficiency.",
  "A significant contribution to the canon of contemporary art.",
  "The work explores themes of identity, memory, and perception.",
  "Executed with extraordinary skill and artistic vision.",
  "This painting represents a culmination of years of experimentation.",
  "The artwork showcases the artist's distinctive visual language.",
  "A powerful statement on the nature of representation.",
  "The composition reveals layers of meaning and symbolism."
];

const noteParts = [
  "Acquired from a prominent private collection.",
  "Previously exhibited at major international venues.",
  "Conservation assessment completed in 2023.",
  "Includes original certificate of authenticity.",
  "Provenance fully documented and verified.",
  "Featured in several important publications.",
  "Part of a significant body of work from this period.",
  "Minor restoration work completed by certified conservator.",
  "Frame is original and in excellent condition.",
  "Accompanied by detailed condition report.",
  "Recently appraised for insurance purposes.",
  "Stored in climate-controlled environment.",
  "Available for exhibition or loan.",
  "Multiple interested collectors have viewed this piece.",
  "Comparable works have sold at major auction houses.",
  "Documentation includes exhibition history and literature references.",
  "Professional photography available upon request.",
  "Shipping and insurance can be arranged.",
  "This work is ready for immediate delivery.",
  "Additional research materials available in archives."
];

const generateDescription = () => {
  const numSentences = randomNumber(2, 5);
  let description = '';
  for (let i = 0; i < numSentences; i++) {
    description += randomItem(descriptionParts) + ' ';
  }
  // Pad if too short
  while (description.length < 100) {
    description += randomItem(descriptionParts) + ' ';
  }
  // Trim if too long
  if (description.length > 1000) {
    description = description.substring(0, 997) + '...';
  }
  return description.trim();
};

const generateNotes = () => {
  const numSentences = randomNumber(2, 6);
  let notes = '';
  for (let i = 0; i < numSentences; i++) {
    notes += randomItem(noteParts) + ' ';
  }
  // Pad if too short
  while (notes.length < 100) {
    notes += randomItem(noteParts) + ' ';
  }
  // Trim if too long
  if (notes.length > 1000) {
    notes = notes.substring(0, 997) + '...';
  }
  return notes.trim();
};

/**
 * Generate large sample artwork dataset
 * @param {number} rowCount - Number of rows to generate
 * @returns {Array} Array of artwork objects
 */
export const generateSampleData = (rowCount = 10000) => {
  const data = [];
  const startYear = 1950;
  const endYear = 2024;
  
  for (let i = 0; i < rowCount; i++) {
    const artist = randomItem(artists);
    const title = `${randomItem(artworkTitles)} ${randomNumber(1, 50)}`;
    const year = randomNumber(startYear, endYear);
    const height = randomNumber(20, 200);
    const width = randomNumber(20, 200);
    const depth = randomNumber(1, 10);
    const unit = randomItem(['cm', 'in']);
    const value = randomNumber(1000, 5000000);
    
    data.push({
      objectId: `${String.fromCharCode(65 + randomNumber(0, 25))}${randomNumber(10, 99)}-${String.fromCharCode(65 + randomNumber(0, 25))}${String.fromCharCode(65 + randomNumber(0, 25))}${randomNumber(0, 9)}`,
      artist,
      title,
      creationDate: year,
      medium: randomItem(mediums),
      dimensions: `${height} × ${width} ${unit}`,
      height,
      width,
      depth,
      units: unit,
      category: randomItem(categories),
      subCategory: randomItem(subCategories),
      genre: randomItem(genres),
      subject: randomItem(subjects),
      location: randomItem(locations),
      subLocation: randomItem(subLocations),
      condition: randomItem(conditions),
      fmvValue: value,
      fmvCurrency: randomItem(currencies),
      signature: randomNumber(0, 10) > 3 ? 'Signed' : 'Unsigned',
      provenance: randomNumber(0, 10) > 7 ? 'Private collection' : '',
      clientReference: randomNumber(0, 10) > 6 ? `REF-${randomNumber(1000, 9999)}` : '',
      description: generateDescription(),
      notes: generateNotes()
    });
  }
  
  return data;
};

/**
 * Calculate optimal column width based on header text length and sample content
 * @param {string} headerText - The column header text
 * @param {Array} sampleData - Sample data to check content length
 * @param {string} columnId - Column identifier to access data
 * @param {object} options - Override options for special cases
 * @returns {number} Calculated width in pixels
 */
const calculateColumnSize = (headerText, sampleData = [], columnId = '', options = {}) => {
  const {
    minSize = 100, // More generous minimum width
    maxSize = 500,
    charWidth = 10, // Increased from 8 to 10 for more breathing room
    padding = 60, // Increased from 40 to 60 for sort icons, drag handles, resizer
  } = options;
  
  // Calculate width based on header text
  const headerWidth = headerText.length * charWidth + padding;
  
  // If we have sample data, check content length
  let contentWidth = headerWidth;
  if (sampleData.length > 0 && columnId) {
    // Sample first 10 rows to get average content length
    const sampleSize = Math.min(10, sampleData.length);
    let maxContentLength = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      const value = sampleData[i][columnId];
      if (value !== null && value !== undefined) {
        const strValue = String(value);
        maxContentLength = Math.max(maxContentLength, strValue.length);
      }
    }
    
    // Calculate content width (use 85% of actual content length for better fit)
    contentWidth = Math.floor(maxContentLength * charWidth * 0.85) + padding;
  }
  
  // Use the larger of header width or content width
  const calculatedWidth = Math.max(headerWidth, contentWidth);
  
  // Clamp between min and max
  return Math.max(minSize, Math.min(maxSize, calculatedWidth));
};

/**
 * Get column definitions for artwork data
 * @param {Array} sampleData - Optional sample data to calculate content-aware sizes
 */
export const getSampleColumns = (sampleData = null) => {
  const columns = [
    { id: 'objectId', accessorKey: 'objectId', header: 'Object ID' },
    { id: 'artist', accessorKey: 'artist', header: 'Artist' },
    { id: 'title', accessorKey: 'title', header: 'Title' },
    { id: 'creationDate', accessorKey: 'creationDate', header: 'Year' },
    { id: 'medium', accessorKey: 'medium', header: 'Medium' },
    { id: 'dimensions', accessorKey: 'dimensions', header: 'Dimensions' },
    { id: 'height', accessorKey: 'height', header: 'Height' },
    { id: 'width', accessorKey: 'width', header: 'Width' },
    { id: 'depth', accessorKey: 'depth', header: 'Depth' },
    { id: 'units', accessorKey: 'units', header: 'Units' },
    { id: 'category', accessorKey: 'category', header: 'Category' },
    { id: 'subCategory', accessorKey: 'subCategory', header: 'Sub-Category' },
    { id: 'genre', accessorKey: 'genre', header: 'Genre' },
    { id: 'subject', accessorKey: 'subject', header: 'Subject' },
    { id: 'signature', accessorKey: 'signature', header: 'Signature' },
    { id: 'location', accessorKey: 'location', header: 'Location' },
    { id: 'subLocation', accessorKey: 'subLocation', header: 'Sub-Location' },
    { id: 'condition', accessorKey: 'condition', header: 'Condition' },
    { id: 'fmvValue', accessorKey: 'fmvValue', header: 'FMV Value' },
    { id: 'fmvCurrency', accessorKey: 'fmvCurrency', header: 'Currency' },
    { id: 'provenance', accessorKey: 'provenance', header: 'Provenance' },
    { id: 'clientReference', accessorKey: 'clientReference', header: 'Client Ref' },
    // Special cases: text fields need more space
    { id: 'description', accessorKey: 'description', header: 'Description', size: 300 },
    { id: 'notes', accessorKey: 'notes', header: 'Notes', size: 300 }
  ];

  return columns.map(col => ({
    ...col,
    size: col.size || calculateColumnSize(col.header, sampleData, col.id),
    cell: info => info.getValue(),
    enableSorting: true,
    enableColumnFilter: true,
    minSize: 100,
    maxSize: 500
  }));
};

/**
 * Generate CSV content from sample data
 */
export const generateSampleCSV = (rowCount = 1000) => {
  const data = generateSampleData(rowCount);
  const columns = getSampleColumns();
  const headers = columns.map(col => col.id).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.id];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
};
