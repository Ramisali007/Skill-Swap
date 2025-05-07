const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'freelancer', 'admin'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  profileImage: {
    type: String,
    default: ''
  },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    website: String
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active'
  },
  notificationPreferences: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      types: {
        projectUpdates: {
          type: Boolean,
          default: true
        },
        bidUpdates: {
          type: Boolean,
          default: true
        },
        messages: {
          type: Boolean,
          default: true
        },
        reviews: {
          type: Boolean,
          default: true
        },
        verification: {
          type: Boolean,
          default: true
        },
        payments: {
          type: Boolean,
          default: true
        },
        marketing: {
          type: Boolean,
          default: false
        },
        systemUpdates: {
          type: Boolean,
          default: true
        }
      },
      frequency: {
        type: String,
        enum: ['immediate', 'daily', 'weekly', 'never'],
        default: 'immediate'
      }
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      types: {
        projectUpdates: {
          type: Boolean,
          default: false
        },
        bidUpdates: {
          type: Boolean,
          default: false
        },
        messages: {
          type: Boolean,
          default: false
        },
        verification: {
          type: Boolean,
          default: true
        },
        payments: {
          type: Boolean,
          default: false
        },
        systemUpdates: {
          type: Boolean,
          default: false
        }
      },
      frequency: {
        type: String,
        enum: ['immediate', 'daily', 'never'],
        default: 'immediate'
      }
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      },
      types: {
        projectUpdates: {
          type: Boolean,
          default: true
        },
        bidUpdates: {
          type: Boolean,
          default: true
        },
        messages: {
          type: Boolean,
          default: true
        },
        reviews: {
          type: Boolean,
          default: true
        },
        verification: {
          type: Boolean,
          default: true
        },
        payments: {
          type: Boolean,
          default: true
        },
        systemUpdates: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Check if password is modified
  if (!this.isModified('password')) {
    console.log(`Password not modified for user ${this.email}, skipping hash`);
    return next();
  }

  try {
    console.log(`Hashing password for user: ${this.email}`);
    console.log(`Password before hashing: "${this.password}" (type: ${typeof this.password})`);
    console.log(`Password before hashing (length): ${this.password.length} characters`);

    // Ensure password is a string
    const passwordStr = String(this.password);

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordStr, salt);

    // Set the hashed password
    this.password = hashedPassword;

    console.log(`Password hashed successfully for user: ${this.email}`);
    console.log(`New password hash: "${this.password.substring(0, 10)}..." (type: ${typeof this.password})`);
    console.log(`New password hash (length): ${this.password.length} characters`);

    next();
  } catch (error) {
    console.error(`Error hashing password for user ${this.email}:`, error);
    console.error(`Error details: ${error.message}`);
    console.error(`Password value: ${typeof this.password}`);
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log(`Comparing passwords for user: ${this.email}`);
    console.log(`Candidate password length: ${candidatePassword.length} characters`);
    console.log(`Stored password hash length: ${this.password.length} characters`);

    // Make sure both the candidate password and stored password are strings
    const storedPassword = String(this.password);

    // Compare the passwords
    const isMatch = await bcrypt.compare(candidatePassword, storedPassword);

    console.log(`Password match result for user ${this.email}: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    return isMatch;
  } catch (error) {
    console.error(`Error comparing passwords for user ${this.email}:`, error);
    console.error('Error details:', error.message);
    console.error('Candidate password type:', typeof candidatePassword);
    console.error('Stored password type:', typeof this.password);
    return false;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
