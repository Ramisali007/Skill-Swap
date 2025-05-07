const axios = require('axios');

// Test the login API with the simple user
const testSimpleLogin = async () => {
  try {
    console.log('Testing login API with simple user...');
    
    const testUser = {
      email: 'simple@example.com',
      password: 'password123'
    };
    
    console.log('Sending login request with data:', testUser);
    
    const response = await axios.post('http://localhost:5001/api/auth/login', testUser);
    
    console.log('Login API response:', response.data);
    console.log('Login API test successful!');
  } catch (error) {
    console.error('Login API test failed:');
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
testSimpleLogin();
