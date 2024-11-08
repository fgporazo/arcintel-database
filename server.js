const jsonServer = require('json-server');
const cors = require('cors'); // Import CORS
const { MongoClient } = require('mongodb'); // Import MongoDB driver

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Enable CORS for all origins
server.use(cors());

// MongoDB connection URI and database name
const mongoURI = 'mongodb+srv://user:Gduih7f7ORx2yLGV@cluster0.0jvhv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';  // Replace with your MongoDB URI
const dbName = 'arcintel';  // Your MongoDB database name
const collectionName = 'users';  // Your collection name (users)

let db, usersCollection;

// Connect to MongoDB
async function connectMongo() {
  const client = new MongoClient(mongoURI);
  await client.connect();
  db = client.db(dbName);
  usersCollection = db.collection(collectionName);
  console.log('MongoDB connected successfully');
}

// Connect to MongoDB before handling requests
connectMongo().catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit the process if MongoDB connection fails
});

// Use MongoDB for routing
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Handle GET requests for users
server.get('/users', async (req, res) => {
  try {
    // Query all users
    const users = await usersCollection.find({}).toArray();
    res.status(200).json(users); // Return all users
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle GET requests for a specific user by ID
server.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await usersCollection.findOne({ _id: userId });
    
    if (user) {
      res.status(200).json(user); // Return the user if found
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle POST and PUT requests for users
server.use(async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const resource = req.url.split('/')[1];
    
    if (resource === 'users') {
      try {
        if (req.method === 'POST') {
          // Insert a new user
          const result = await usersCollection.insertOne(req.body);
          res.status(201).json(result.ops[0]); // Send the newly created user back as a response
        } else if (req.method === 'PUT') {
          // Update an existing user
          const { id, ...updateData } = req.body;
          const result = await usersCollection.updateOne({ _id: id }, { $set: updateData });
          if (result.matchedCount > 0) {
            res.status(200).json(req.body); // Send the updated user back as a response
          } else {
            res.status(404).json({ error: 'User not found' });
          }
        }
      } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      next(); // If the resource is not "users", continue the request
    }
  } else {
    next(); // If it's not POST or PUT, continue the request
  }
});

// Use the default JSON server router (for other routes)
server.use(jsonServer.router({}));

module.exports = server; // Export server for Vercel handling
