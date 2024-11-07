const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Path to the temporary storage location
const tempFilePath = path.join('/tmp', 'db.json');

// Ensure the db.json file exists in the /tmp directory
if (!fs.existsSync(tempFilePath)) {
  // If the file doesn't exist, initialize it with default content (you can customize this)
  const initialData = {
    users: [
      {
        "id": "1",
        "firstname": "John",
        "lastname": "Wick",
        "password": "1234",
        "email": "editor@sample.com",
        "type": "editor",
        "status": "active"
      },
      {
        "id": "2",
        "firstname": "Jane",
        "lastname": "Doe",
        "password": "1234",
        "email": "writer@sample.com",
        "type": "writer",
        "status": "active"
      }
    ],
    company: [
      {
        "id": "1",
        "logo": "",
        "name": "Company ABC",
        "status": "active"
      }
    ],
    articles: [
      {
        "id": "1",
        "image": "",
        "title": "The Sea",
        "link": "",
        "date": "",
        "content": "",
        "status": "For Edit",
        "writer": "1",
        "editor": "2",
        "company": "1"
      }
    ]
  };
  fs.writeFileSync(tempFilePath, JSON.stringify(initialData, null, 2));
}

// Use /tmp/db.json for your router
const router = jsonServer.router(tempFilePath);

// Setup middlewares
server.use(middlewares);

// Handle requests
server.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    // Collect request data
    let requestData = '';
    req.on('data', chunk => {
      requestData += chunk;
    });

    req.on('end', () => {
      const jsonData = JSON.parse(requestData);
      // Write updated data back to /tmp/db.json
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
