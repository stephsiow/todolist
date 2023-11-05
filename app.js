
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config()

const app = express(); //create app
app.set("view engine", "ejs"); //use EJS as view engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const uri = process.env.MONGODB_URI;

let day = date();
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connect() {
  try {
    console.log("Attempting to connect to Mongo");
    await client.connect();
    console.log("Connected to db")
    return client.db("todolistdb");
  } catch (err) {
    console.error("Error:", err);
  } 
}

app.use(async (req, res, next) => {
  // Establish the MongoDB connection and attach the database object to the request
  req.db = await connect();
  next();
});

app.get("/", async (req, res) => {
  const collection = req.db.collection("todolist");
  const documents = await collection.find({}).toArray();
  res.render("list", { kindOfDay: day, documents });
});

app.post("/", async (req, res) => {
  try {
    const collection = req.db.collection('todolist');
    // Extract the data you want to insert from the request body
    const newItem = req.body.newItem;
    // Insert the new document into the collection
    const result = await collection.insertOne({ item: newItem });
    console.log('Item added successfully');
    const documents = await collection.find({}).toArray();
    // Render the 'list' template with the updated data
    res.render('list', { kindOfDay: day, documents });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while adding the item' });
  }
});

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});