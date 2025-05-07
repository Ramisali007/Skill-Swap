const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'CORS test successful!' });
});

// Start server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/test`);
});

// Log CORS configuration
console.log('CORS configuration:');
console.log('- Origin: *');
console.log('- Methods: GET, POST, PUT, DELETE, OPTIONS');
console.log('- Headers: Content-Type, Authorization');

// Keep the server running for 60 seconds
setTimeout(() => {
  console.log('Test server shutting down...');
  process.exit(0);
}, 60000);
