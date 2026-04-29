const data = [{no: '618', name: 'A'}, {no: 617, name: 'B'}, {no: undefined, name: 'C'}];
const sortConfig = { key: 'no', direction: 'asc' };
const sorted = [...data].sort((a, b) => {
  let aVal = a[sortConfig.key] ?? '';
  let bVal = b[sortConfig.key] ?? '';
  if (sortConfig.key === 'no') {
    const numA = parseInt(String(aVal).replace(/[^0-9-]/g, ''), 10) || 0;
    const numB = parseInt(String(bVal).replace(/[^0-9-]/g, ''), 10) || 0;
    return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
  }
});
console.log(sorted);
