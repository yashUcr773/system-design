// Test script for the CRUD API
// Run this file with: node test-api.js

const baseUrl = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing MySQL CRUD API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(baseUrl);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    console.log('📋 Available endpoints:', Object.keys(healthData.endpoints).join(', '));

    // Test 2: Create a user
    console.log('\n2. Creating a new user...');
    const newUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };
    const createResponse = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const createData = await createResponse.json();
    console.log('✅ User created:', createData.data);
    const userId = createData.data.id;

    // Test 3: Get all users
    console.log('\n3. Getting all users...');
    const getAllResponse = await fetch(`${baseUrl}/users`);
    const getAllData = await getAllResponse.json();
    console.log('✅ All users:', `Found ${getAllData.count} user(s)`);

    // Test 4: Get user by ID
    console.log('\n4. Getting user by ID...');
    const getUserResponse = await fetch(`${baseUrl}/users/${userId}`);
    const getUserData = await getUserResponse.json();
    console.log('✅ User by ID:', getUserData.data.name);

    // Test 5: Update user
    console.log('\n5. Updating user...');
    const updateUser = { name: 'John Smith', age: 31 };
    const updateResponse = await fetch(`${baseUrl}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateUser)
    });
    const updateData = await updateResponse.json();
    console.log('✅ User updated:', updateData.data.name);

    // Test 6: Delete user
    console.log('\n6. Deleting user...');
    const deleteResponse = await fetch(`${baseUrl}/users/${userId}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteResponse.json();
    console.log('✅ User deleted:', deleteData.message);

    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;