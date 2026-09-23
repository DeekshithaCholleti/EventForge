const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/admin/AdminDashboard.jsx', 'utf8');
code = code.replace(
  "{['Event Name', 'Organizer', 'Format', 'Status', 'Dates', 'Capacity']",
  "{['Event Name', 'Organizer', 'Rating', 'Status', 'Dates', 'Capacity']"
);
fs.writeFileSync('frontend/src/pages/admin/AdminDashboard.jsx', code, 'utf8');
