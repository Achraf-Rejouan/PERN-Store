import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js'; // Import product routes
import { sql } from './config/db.js'; // Import the database connection
import aj from "./lib/arcjet.js"; // Import Arcjet middleware

// Load environment variables from .env file
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json()); // Parse JSON bodies (as sent by API clients)
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Use Helmet to set various HTTP headers for security
app.use(morgan('dev')); // Use Morgan for logging HTTP requests in development mode

//apply arcjet middleware
app.use(async (req, res, next) => {
  try{
  const decision = await aj.protect(req, { requested: 1 });
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Too Many Requests" }));
    } else if (decision.reason.isBot()) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No bots allowed" }));
    } else {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
    }
    return;
  }
  if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden: Spoofed bot detected" }));
    return;
  }
  next();
}catch (error) {
  console.error('Error in Arcjet middleware:', error.message, error.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  next(error);
}});

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

