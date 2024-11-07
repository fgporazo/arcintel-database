const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Path to the temporary storage location
const tempFilePath = path.join('/tmp', 'db.json');

// If db.json doesn't exist in /tmp, use the default one
if (!fs.existsSync(tempFilePath)) {
  // Optionally, copy the db.json file from your source if needed
  // fs.copyFileSync('path/to/your/db.json', tempFilePath);
}

// Use /tmp/db.json for your router
const router = jsonServer.router(tempFilePath);

// Setup middlewares
server.use(middlewares);

// Handle requests
server.use((req, res, next) => {
  // Example: Write to /tmp/db.json (you can adjust this logic based on your needs)
  if (req.method === 'POST' || req.method === 'PUT') {
    // Ensure the request data is in JSON format before writing
    let requestData = '';
    req.on('data', chunk => {
      requestData += chunk;
    });
    
    req.on('end', () => {
      const jsonData = JSON.parse(requestData);
      // Write updated data back to the temporary file
      fs.writeFileSync(tempFilePath, JSON.stringify(jsonData, null, 2));
      next();
    });
  } else {
    next();
  }
});

// Use the router
server.use(router);

// Start the server
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
