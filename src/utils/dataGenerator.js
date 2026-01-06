/**
 * Generate sample data for testing
 */

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Jessica', 'Daniel', 'Ashley'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const companies = ['Acme Corp', 'Tech Solutions', 'Global Industries', 'Innovation Labs', 'Digital Dynamics', 'Cloud Systems', 'Data Analytics Inc', 'Smart Solutions', 'NextGen Tech', 'Future Corp'];
const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'IT', 'Product', 'Customer Success', 'Legal'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const statuses = ['Active', 'Inactive', 'Pending', 'On Hold'];
const products = ['Widget A', 'Widget B', 'Gadget X', 'Gadget Y', 'Tool Pro', 'Tool Lite', 'Service Plus', 'Service Basic'];

const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

/**
 * Generate large sample dataset
 * @param {number} rowCount - Number of rows to generate
 * @returns {Array} Array of row objects
 */
export const generateSampleData = (rowCount = 10000) => {
  const data = [];
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date();
  
  for (let i = 0; i < rowCount; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    
    data.push({
      id: i + 1,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      company: randomItem(companies),
      department: randomItem(departments),
      position: `${randomItem(['Senior', 'Junior', 'Lead', 'Staff'])} ${randomItem(['Engineer', 'Manager', 'Specialist', 'Analyst'])}`,
      salary: randomNumber(50000, 200000),
      city: randomItem(cities),
      state: randomItem(['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'AZ', 'WA']),
      country: 'USA',
      phone: `+1-${randomNumber(200, 999)}-${randomNumber(200, 999)}-${randomNumber(1000, 9999)}`,
      joinDate: randomDate(startDate, endDate),
      status: randomItem(statuses),
      product: randomItem(products),
      revenue: randomNumber(1000, 100000),
      quantity: randomNumber(1, 500),
      notes: `Sample note for row ${i + 1}`
    });
  }
  
  return data;
};

/**
 * Get column definitions for sample data
 */
export const getSampleColumns = () => {
  return [
    { id: 'id', accessorKey: 'id', header: 'ID', size: 80 },
    { id: 'firstName', accessorKey: 'firstName', header: 'First Name', size: 120 },
    { id: 'lastName', accessorKey: 'lastName', header: 'Last Name', size: 120 },
    { id: 'email', accessorKey: 'email', header: 'Email', size: 250 },
    { id: 'company', accessorKey: 'company', header: 'Company', size: 180 },
    { id: 'department', accessorKey: 'department', header: 'Department', size: 150 },
    { id: 'position', accessorKey: 'position', header: 'Position', size: 200 },
    { id: 'salary', accessorKey: 'salary', header: 'Salary', size: 120 },
    { id: 'city', accessorKey: 'city', header: 'City', size: 120 },
    { id: 'state', accessorKey: 'state', header: 'State', size: 80 },
    { id: 'country', accessorKey: 'country', header: 'Country', size: 100 },
    { id: 'phone', accessorKey: 'phone', header: 'Phone', size: 150 },
    { id: 'joinDate', accessorKey: 'joinDate', header: 'Join Date', size: 120 },
    { id: 'status', accessorKey: 'status', header: 'Status', size: 100 },
    { id: 'product', accessorKey: 'product', header: 'Product', size: 150 },
    { id: 'revenue', accessorKey: 'revenue', header: 'Revenue', size: 120 },
    { id: 'quantity', accessorKey: 'quantity', header: 'Quantity', size: 100 },
    { id: 'notes', accessorKey: 'notes', header: 'Notes', size: 200 }
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
