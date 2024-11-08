const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import CORS

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Enable CORS for all origins
server.use(cors());

// Path to the temporary storage location
const tempFilePath = path.join('/tmp', 'db.json');

// Ensure the db.json file exists in the /tmp directory
if (!fs.existsSync(tempFilePath)) {
  // Initialize with default content
  const initialData = {
    users: [
      { id: "1", firstname: "John", lastname: "Wick", password: "1234", email: "editor@sample.com", type: "editor", status: "active" },
      { id: "2", firstname: "Jane", lastname: "Doe", password: "1234", email: "writer@sample.com", type: "writer", status: "active" }
    ],
    company: [
      { id: "1", logo: "", name: "Company ABC", status: "active" }
    ],
    articles: [
      { id: "1", image: "", title: "The Sea", link: "", date: "", content: "", status: "For Edit", writer: "1", editor: "2", company: "1" }
    ]
  };
  fs.writeFileSync(tempFilePath, JSON.stringify(initialData, null, 2));
}

// Use /tmp/db.json for your router
const router = jsonServer.router(tempFilePath);

// Setup middlewares
server.use(middlewares);

// Improved request handling for POST and PUT
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    // Read the current database
    const db = JSON.parse(fs.readFileSync(tempFilePath, 'utf-8'));
    
    // Add or update the data accordingly
    if (req.method === 'POST') {
      const resource = req.url.split('/')[1];
      db[resource].push(req.body); // Append to the specific resource (e.g., users)
    } else if (req.method === 'PUT') {
      // Find the resource and update it; simple example assumes ID is provided
      const resource = req.url.split('/')[1];
      const id = req.body.id;
      db[resource] = db[resource].map(item => item.id === id ? req.body : item);
    }
    
    // Write updated data back to /tmp/db.json
    fs.writeFileSync(tempFilePath, JSON.stringify(db, null, 2));
    res.status(200).json(req.body);
  } else {
    next();
  }
});

// Use the router
server.use(router);

module.exports = server; // Export server for Vercel handling
