import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import dotenv from 'dotenv';
import cors from 'cors';
import schema from './schema/schema.js';
import connectDB from './config/db.js';
import uploadRoutes from './routes/upload.js'; // 👈 Add this import

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
connectDB();

// ✅ Add this: Middleware for parsing JSON
app.use(express.json());

// ✅ Add this: Upload routes
app.use('/api', uploadRoutes);

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/graphql`));