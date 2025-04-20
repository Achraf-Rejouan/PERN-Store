import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js'; // Import product routes

// Load environment variables from .env file
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json()); // Parse JSON bodies (as sent by API clients)
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Use Helmet to set various HTTP headers for security
app.use(morgan('dev')); // Use Morgan for logging HTTP requests in development mode

app.get('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});