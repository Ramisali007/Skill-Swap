require('dotenv').config();
const axios = require('axios');

// Test the dashboard API endpoints
const testDashboardAPI = async () => {
  try {
    console.log('Testing dashboard API endpoints...');
    
    // First, let's login to get a token
    console.log('\nLogging in to get auth token...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'ali.ahmed@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.token) {
      console.error('Login failed, no token received');
      return;
    }
    
    console.log('Login successful, token received');
    const token = loginResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Test client dashboard endpoint
    console.log('\nTesting client dashboard endpoint...');
    try {
      const clientResponse = await axios.get('http://localhost:5001/api/dashboard/client', { headers });
      console.log('Client dashboard response status:', clientResponse.status);
      console.log('Client dashboard data:', JSON.stringify(clientResponse.data, null, 2));
    } catch (error) {
      console.error('Error fetching client dashboard:', error.response?.data || error.message);
    }
    
    // Test freelancer dashboard endpoint
    console.log('\nTesting freelancer dashboard endpoint...');
    try {
      const freelancerResponse = await axios.get('http://localhost:5001/api/dashboard/freelancer', { headers });
      console.log('Freelancer dashboard response status:', freelancerResponse.status);
      console.log('Freelancer dashboard data:', JSON.stringify(freelancerResponse.data, null, 2));
    } catch (error) {
      console.error('Error fetching freelancer dashboard:', error.response?.data || error.message);
    }
    
    // Test admin dashboard endpoint
    console.log('\nTesting admin dashboard endpoint...');
    try {
      const adminResponse = await axios.get('http://localhost:5001/api/dashboard/admin', { headers });
      console.log('Admin dashboard response status:', adminResponse.status);
      console.log('Admin dashboard data:', JSON.stringify(adminResponse.data, null, 2));
    } catch (error) {
      console.error('Error fetching admin dashboard:', error.response?.data || error.message);
    }
    
    console.log('\nAPI testing completed');
  } catch (error) {
    console.error('Error during API testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Run the test
testDashboardAPI();
