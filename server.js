const jsonServer = require('json-server');
const cors = require('cors'); // Import CORS
const { MongoClient, ObjectId } = require('mongodb'); // Import MongoDB driver

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
  try {
    await client.connect();
    db = client.db(dbName);
    usersCollection = db.collection(collectionName);
    console.log('MongoDB connected successfully');
    
    // Check if users collection has data
    const count = await usersCollection.countDocuments();  // Count the documents
    console.log(`Users collection has ${count} documents.`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
}

// Connect to MongoDB before handling requests
connectMongo();

// Use MongoDB for routing
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Handle GET requests for users (retrieve all users)
server.get('/users', async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray(); // Fetch all users
    console.log('Fetched users:', users);  // Log the fetched users
    res.status(200).json(users); // Return all users as response
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle GET requests for a specific user by ID
server.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
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
          // Insert a new user into the MongoDB collection
          const result = await usersCollection.insertOne(req.body);
          const newUser = await usersCollection.findOne({ _id: result.insertedId });
          console.log('Created new user:', newUser);  // Log the newly created user
          res.status(201).json(newUser); // Send the newly created user back as a response
        } else if (req.method === 'PUT') {
          // Update an existing user in MongoDB
          const { id, ...updateData } = req.body;
          const result = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
          );

          if (result.matchedCount > 0) {
            const updatedUser = await usersCollection.findOne({ _id: new ObjectId(id) });
            console.log('Updated user:', updatedUser);  // Log the updated user
            res.status(200).json(updatedUser); // Send the updated user back as a response
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

// Start the server
server.listen(3000, () => {
  console.log('JSON Server running on http://localhost:3000');
});

module.exports = server; // Export server for Vercel handling
