const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const env = require("dotenv");
env.config();

const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

// Use cors middleware for Express
app.use(cors());
app.use(express.json());

// Set up Socket.io with CORS settings
const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Server is running");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB!");

    const user = client.db("chatapp").collection("userInfo");

    // user info store in data base 
    app.post("/api/user", async (req, res) => {
      const userInfo = req.body;
      const result = await user.insertOne(userInfo);
      res.json(result);
    })

    // user info get in api 

    app.get("/api/user", async(req, res)=>{
      const userInfo = await user.find({}).toArray();
      
    })





    // Verify connection with a ping
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("An error occurred while connecting to MongoDB", error);
  } finally {
    // Optional: Close the MongoDB connection if needed
    // await client.close();
  }
}

// Run the connection setup
run().catch(console.dir);

// Start the server
server.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}/`)
);
