import express from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import cors from "cors";
import schema from "./schema/Schema.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
connectDB();

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔗 GraphQL playground: http://localhost:${PORT}/graphql`);
});