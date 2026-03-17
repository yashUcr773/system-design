# MySQL CRUD Express App

A minimal CRUD (Create, Read, Update, Delete) Express.js application for testing MySQL database connectivity and operations.

## Features

- ✅ Full CRUD operations for users
- ✅ MySQL database integration
- ✅ Error handling and validation
- ✅ Environment-based configuration
- ✅ Automatic table creation
- ✅ JSON API responses

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Update `.env` file with your MySQL credentials
   - Default configuration connects to localhost:3306

3. **Start your MySQL database:**
   - If using Docker: Make sure your MySQL container is running
   - If using local MySQL: Ensure the service is started

4. **Run the application:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Base URL: `http://localhost:3000`

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/` | Health check and API documentation | - |
| GET | `/users` | Get all users | - |
| GET | `/users/:id` | Get user by ID | - |
| POST | `/users` | Create new user | `{name, email, age?}` |
| PUT | `/users/:id` | Update user | `{name?, email?, age?}` |
| DELETE | `/users/:id` | Delete user | - |

## Example Usage

### Create a user:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":30}'
```

### Get all users:
```bash
curl http://localhost:3000/users
```

### Update a user:
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Smith","age":31}'
```

### Delete a user:
```bash
curl -X DELETE http://localhost:3000/users/1
```

## Testing

Run the automated test script:
```bash
node test-api.js
```

This will test all CRUD operations and verify the API is working correctly.

## Data Seeding

The project includes a comprehensive data seeding script to populate your database with random test data.

### Quick Start
```bash
# Generate 100 random users (default)
npm run seed

# Clear existing data and generate 100 users
npm run seed:clear

# Generate 1000 random users
npm run seed:large
```

### Manual Usage
```bash
# Basic usage - generates 100 users
node seed-data.js

# Generate specific number of users
node seed-data.js --count 500

# Clear existing data before seeding
node seed-data.js --clear --count 200

# Show help
node seed-data.js --help
```

### Features
- 🎲 Generates realistic random names and emails
- 📧 Ensures unique email addresses
- 👥 Age range: 18-80 years
- 🔄 Progress tracking for large datasets
- ⚠️ Duplicate handling
- 📊 Data verification after seeding

### Sample Generated Data
```json
{
  "name": "Sarah Johnson",
  "email": "sarah.johnson@gmail.com",
  "age": 34
}
```

## Database Schema

The app automatically creates a `users` table with the following structure:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | MySQL host |
| `DB_USER` | root | MySQL username |
| `DB_PASSWORD` | password | MySQL password |
| `DB_NAME` | testdb | Database name |
| `DB_PORT` | 3306 | MySQL port |
| `PORT` | 3000 | Express server port |

## Error Handling

The API includes comprehensive error handling:
- 400: Bad Request (validation errors)
- 404: Not Found (user doesn't exist)
- 409: Conflict (duplicate email)
- 500: Internal Server Error (database/server errors)

## Troubleshooting

1. **Connection refused**: Check if MySQL is running
2. **Access denied**: Verify database credentials in `.env`
3. **Database doesn't exist**: The app will try to create it, ensure user has CREATE privileges
4. **Port already in use**: Change `PORT` in `.env` file