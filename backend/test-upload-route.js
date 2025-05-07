const express = require('express');
const router = express.Router();
const { upload, setUploadType } = require('./middlewares/upload');
const path = require('path');

// Test upload route
router.post('/test-upload/:type', (req, res, next) => {
  // Set upload type based on URL parameter
  const uploadType = req.params.type;
  
  if (!['profile', 'project', 'document', 'message'].includes(uploadType)) {
    return res.status(400).json({ message: 'Invalid upload type' });
  }
  
  // Set upload type and process file
  req.uploadType = uploadType;
  
  // Use multer to handle the file upload
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return file information
    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
    
    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: req.file.path,
      fileSize: req.file.size,
      fileUrl: fileUrl
    });
  });
});

module.exports = router;
