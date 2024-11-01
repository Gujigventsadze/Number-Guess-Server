import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Use the port from environment variables, default to 3001 if undefined
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection setup
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // Required for some hosted databases
  },
});

db.connect()
  .then(() => console.log("Successfully connected to the database"))
  .catch((err) => console.log(`Error ${err}`));

// Adding data history to the database
app.post("/game-over", async (req, res) => {
  const { attempts, userNum } = req.body;
  try {
    console.log("Connected Successfully");
    await db.query(
      "INSERT INTO number_data (number, attempts) VALUES ($1, $2)",
      [userNum, attempts]
    );
    return res.status(200).json({ message: "Data inserted successfully" });
  } catch (err) {
    console.log(`Error: ${err}`);
    return res.status(500).json({ error: "Database insertion failed" });
  }
});

// Fetching data history and displaying it on the main page
app.get("/get-data", async (req, res) => {
  try {
    const data = await db.query("SELECT * FROM number_data");
    const jsonData = data.rows;
    res.send(jsonData);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(port, () => console.log(`Listening to port ${port}`));
