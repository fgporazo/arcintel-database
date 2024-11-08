To run an existing JSON-server project in your local environment, follow these steps:

Step 1: Clone the JSON Server Repository
git clone <repository_url>
cd <json-server-directory>

Step 2: Install Dependencies
npm install

FINAL STEP

To start the JSON server locally, run the following command:
json-server --watch db.json --port 3000

You can access the data on the following endpoints:

GET /users: http://localhost:3000/users
GET /users/1: http://localhost:3000/users/1
POST /users: http://localhost:3000/users (create new user)
