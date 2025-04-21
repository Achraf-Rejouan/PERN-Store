import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js'; // Import product routes
import { sql } from './config/db.js'; // Import the database connection

// Load environment variables from .env file
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json()); // Parse JSON bodies (as sent by API clients)
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Use Helmet to set various HTTP headers for security
app.use(morgan('dev')); // Use Morgan for logging HTTP requests in development mode

app.use('/api/products', productRoutes);

async function initDB() {
  try {
    await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    console.log('DB initialized and products table created if it did not exist.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// Initialize the database connection and create the products table if it doesn't exist
initDB().then(() => {
  app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
});

