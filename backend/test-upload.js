const fs = require('fs');
const path = require('path');

// Test function to create a sample file in each upload directory
const createTestFiles = () => {
  const uploadDirs = [
    'uploads/documents',
    'uploads/messages',
    'uploads/profiles',
    'uploads/projects',
    'uploads/utils'
  ];

  const testContent = 'This is a test file to verify that the upload directory is working correctly.';

  uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    const testFilePath = path.join(fullPath, 'test-file.txt');
    
    try {
      // Ensure directory exists
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${fullPath}`);
      }
      
      // Create test file
      fs.writeFileSync(testFilePath, testContent);
      console.log(`Created test file: ${testFilePath}`);
    } catch (error) {
      console.error(`Error creating test file in ${dir}:`, error);
    }
  });
};

// Run the test
createTestFiles();
console.log('Test completed. Check the uploads directories for test files.');
