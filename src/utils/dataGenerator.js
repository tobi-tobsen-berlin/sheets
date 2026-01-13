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
 * Get column definitions for artwork data
 */
export const getSampleColumns = () => {
  return [
    { id: 'objectId', accessorKey: 'objectId', header: 'Object ID', size: 100 },
    { id: 'artist', accessorKey: 'artist', header: 'Artist', size: 180 },
    { id: 'title', accessorKey: 'title', header: 'Title', size: 200 },
    { id: 'creationDate', accessorKey: 'creationDate', header: 'Year', size: 80 },
    { id: 'medium', accessorKey: 'medium', header: 'Medium', size: 200 },
    { id: 'dimensions', accessorKey: 'dimensions', header: 'Dimensions', size: 150 },
    { id: 'height', accessorKey: 'height', header: 'Height', size: 80 },
    { id: 'width', accessorKey: 'width', header: 'Width', size: 80 },
    { id: 'depth', accessorKey: 'depth', header: 'Depth', size: 80 },
    { id: 'units', accessorKey: 'units', header: 'Units', size: 60 },
    { id: 'category', accessorKey: 'category', header: 'Category', size: 140 },
    { id: 'subCategory', accessorKey: 'subCategory', header: 'Sub-Category', size: 150 },
    { id: 'genre', accessorKey: 'genre', header: 'Genre', size: 200 },
    { id: 'subject', accessorKey: 'subject', header: 'Subject', size: 120 },
    { id: 'signature', accessorKey: 'signature', header: 'Signature', size: 100 },
    { id: 'location', accessorKey: 'location', header: 'Location', size: 140 },
    { id: 'subLocation', accessorKey: 'subLocation', header: 'Sub-Location', size: 140 },
    { id: 'condition', accessorKey: 'condition', header: 'Condition', size: 120 },
    { id: 'fmvValue', accessorKey: 'fmvValue', header: 'FMV Value', size: 120 },
    { id: 'fmvCurrency', accessorKey: 'fmvCurrency', header: 'Currency', size: 80 },
    { id: 'provenance', accessorKey: 'provenance', header: 'Provenance', size: 150 },
    { id: 'clientReference', accessorKey: 'clientReference', header: 'Client Ref', size: 120 },
    { id: 'description', accessorKey: 'description', header: 'Description', size: 400 },
    { id: 'notes', accessorKey: 'notes', header: 'Notes', size: 400 }
  ].map(col => ({
    ...col,
    cell: info => info.getValue(),
    enableSorting: true,
    enableColumnFilter: true,
    minSize: 60,
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
