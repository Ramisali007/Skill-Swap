const axios = require('axios');

// Test the registration API
const testRegistrationAPI = async () => {
  try {
    console.log('Testing registration API...');
    
    // Generate a unique email to avoid duplicate key errors
    const timestamp = Date.now();
    const testUser = {
      name: 'Test User',
      email: `testuser${timestamp}@example.com`,
      password: 'password123',
      role: 'client',
      phone: '1234567890'
    };
    
    console.log('Sending registration request with data:', testUser);
    
    const response = await axios.post('http://localhost:5001/api/auth/signup', testUser);
    
    console.log('Registration API response:', response.data);
    console.log('Registration API test successful!');
  } catch (error) {
    console.error('Registration API test failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
};

// Run the test
testRegistrationAPI();
