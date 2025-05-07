const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
createDirIfNotExists('./uploads');
createDirIfNotExists('./uploads/profiles');
createDirIfNotExists('./uploads/projects');
createDirIfNotExists('./uploads/documents');
createDirIfNotExists('./uploads/messages');
createDirIfNotExists('./uploads/portfolio');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads';

    // Determine upload directory based on file type
    if (req.uploadType === 'profile') {
      uploadPath = './uploads/profiles';
    } else if (req.uploadType === 'project') {
      uploadPath = './uploads/projects';
    } else if (req.uploadType === 'document') {
      uploadPath = './uploads/documents';
    } else if (req.uploadType === 'message') {
      uploadPath = './uploads/messages';
    } else if (req.uploadType === 'portfolio') {
      uploadPath = './uploads/portfolio';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images, documents, and common file types
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, documents, and common file types are allowed!'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Middleware to set upload type
exports.setUploadType = (type) => {
  return (req, res, next) => {
    req.uploadType = type;
    next();
  };
};

// Export multer instance
exports.upload = upload;
