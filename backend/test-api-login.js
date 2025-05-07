require('dotenv').config();
const axios = require('axios');

// Test the login API with a sample user
const testLoginAPI = async () => {
  try {
    console.log('Testing login API...');
    
    // Sample user credentials
    const testUser = {
      email: 'ali.ahmed@example.com',
      password: 'password123'
    };
    
    console.log('Sending login request with data:', testUser);
    
    const response = await axios.post('http://localhost:5001/api/auth/login', testUser);
    
    console.log('Login response status:', response.status);
    console.log('Login response data:', response.data);
    
    if (response.data.token) {
      console.log('Login successful! Token received.');
      
      // Test getting user profile with the token
      console.log('\nTesting user profile API with token...');
      
      const profileResponse = await axios.get('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('Profile response status:', profileResponse.status);
      console.log('Profile response data:', profileResponse.data);
    }
    
    console.log('\nAPI test completed successfully!');
  } catch (error) {
    console.error('API test failed:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
};

// Run the test
testLoginAPI();
