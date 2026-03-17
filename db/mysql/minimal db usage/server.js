const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'testdb1',
  port: process.env.DB_PORT || 3306
};

let db;

// Initialize database connection
async function initializeDatabase() {
  try {
    // First, connect without specifying a database to create it if needed
    const { database, ...configWithoutDb } = dbConfig;
    const tempConnection = await mysql.createConnection(configWithoutDb);
    
    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log(`Database '${database}' ensured to exist`);
    
    // Close temporary connection
    await tempConnection.end();
    
    // Now connect to the specific database
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
    
    // Create a test table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        age INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table ready');
    
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'MySQL CRUD API is running!',
    endpoints: {
      'GET /users': 'Get all users',
      'GET /users/:id': 'Get user by ID',
      'POST /users': 'Create new user',
      'PUT /users/:id': 'Update user by ID',
      'DELETE /users/:id': 'Delete user by ID'
    }
  });
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    let t1 = new Date().getTime()
    const [rows] = await db.execute('SELECT * FROM users ORDER BY created_at DESC LIMIT 100');
    let t2 = new Date().getTime()
    console.log(t2-t1)
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// POST create new user
app.post('/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    // Basic validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    const [result] = await db.execute(
      'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
      [name, email, age || null]
    );
    
    // Get the created user
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }
});

// PUT update user by ID
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;
    
    // Check if user exists
    const [existingUser] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (age !== undefined) {
      updates.push('age = ?');
      values.push(age);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    values.push(id);
    await db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Get the updated user
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  }
});

// DELETE user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [existingUser] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: existingUser[0]
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} for API documentation`);
  });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  if (db) {
    await db.end();
    console.log('Database connection closed');
  }
  process.exit(0);
});
