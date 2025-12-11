// require('dotenv').config();

// const express = require('express');
// const app = express();
// const fs = require('fs');
// const jwt = require('jsonwebtoken');
// const path = require('path');

// // In-memory store for pairing: device_code -> user_token
// const tokens = {};

// // For parsing application/json
// app.use(express.json());

// // Endpoint for Apple Music device linking
// app.post('/link-apple-token', (req, res) => {
//   const { device_code, user_token } = req.body;
//   if (typeof device_code === 'string' && typeof user_token === 'string') {
//     tokens[device_code] = user_token;
//     console.log(`Linked device_code: ${device_code}`);
//     res.json({ ok: true });
//   } else {
//     res.status(400).json({ error: 'Missing device_code or user_token' });
//   }
// });

// // Endpoint for device to poll for token
// app.get('/check-token', (req, res) => {
//   const device_code = req.query.device_code;
//   if (!device_code) {
//     return res.status(400).json({ error: 'Missing device_code' });
//   }
//   const user_token = tokens[device_code];
//   if (user_token) {
//     res.json({ user_token });
//     // Optionally: delete tokens[device_code];
//   } else {
//     res.status(404).json({ user_token: null });
//   }
// });

// // --- Apple Music Dynamic Developer Token Endpoint ---
// // Returns a fresh developerToken JWT on each request
// app.get('/developer-token', (req, res) => {
//   const time = Math.floor(Date.now() / 1000);
//   const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_FILE);

//   const headers = {
//     kid: process.env.KEY_ID
//   };

//   const claims = {
//     iss: process.env.TEAM_ID,
//     iat: time,
//     exp: time + 3600, // 1 hour (safe for MusicKit)
//     aud: 'https://appleid.apple.com',
//     sub: process.env.SERVICE_ID,
//   };

//   const token = jwt.sign(claims, privateKey, {
//     algorithm: 'ES256',
//     header: headers
//   });

//   res.json({ developerToken: token });
// });

// // Start server as before
// var port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`Your app is listening on port ${port}.`));






require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
  origin: 'https://pasanathant.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

const fs = require('fs');
const bodyParser = require('body-parser');

// In-memory store for pairing: device_code -> user_token
const tokens = {};

// Middleware for JSON
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`--> ${req.method} ${req.url}`);
  if (Object.keys(req.query).length)
    console.log('    Query:', req.query);
  if (req.body && Object.keys(req.body).length)
    console.log('    Body:', req.body);
  next();
});

// Store the userToken posted by the web login page (phone)
app.post('/link-apple-token', (req, res) => {
  const { device_code, user_token } = req.body;
  console.log('POST /link-apple-token called');
  if (typeof device_code === 'string' && typeof user_token === 'string') {
    tokens[device_code] = user_token;
    console.log(`Linked device_code: ${device_code} to user_token: ${user_token}`);
    res.json({ ok: true });
  } else {
    console.log('Error: Missing device_code or user_token in POST /link-apple-token');
    res.status(400).json({ error: 'Missing device_code or user_token' });
  }
});

// Allow app/device to poll for user_token using its device_code
app.get('/check-token', (req, res) => {
  console.log('GET /check-token called');
  const device_code = req.query.device_code;
  if (!device_code) {
    console.log('Error: Missing device_code in GET /check-token');
    return res.status(400).json({ error: 'Missing device_code' });
  }
  const user_token = tokens[device_code];
  if (user_token) {
    console.log(`device_code ${device_code} found, returning user_token`);
    res.json({ user_token });
    // Optionally: delete after first retrieval for one-time pairing!
    // console.log(`Deleting device_code ${device_code} from memory`);
    // delete tokens[device_code];
  } else {
    console.log(`device_code ${device_code} not found`);
    res.status(404).json({ user_token: null });
  }
});

// Start server as before
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Your app is listening on port ${port}.`));


// require('dotenv').config();

// const express = require('express');
// const app = express();
// const cors = require('cors');
// app.use(cors({
//   origin: 'https://pasanathant.github.io',
//   methods: ['GET', 'POST', 'OPTIONS'],
//   allowedHeaders: ['Content-Type']
// }));

// const fs = require('fs');
// const bodyParser = require('body-parser');

// // In-memory store for pairing: device_code -> user_token
// const tokens = {};

// // Store the userToken posted by the web login page (phone)
// app.use(express.json()); // for parsing application/json

// app.post('/link-apple-token', (req, res) => {
//   const { device_code, user_token } = req.body;
//   if (typeof device_code === 'string' && typeof user_token === 'string') {
//     tokens[device_code] = user_token;
//     console.log(`Linked device_code: ${device_code}`);
//     res.json({ ok: true });
//   } else {
//     res.status(400).json({ error: 'Missing device_code or user_token' });
//   }
// });

// // Allow app/device to poll for user_token using its device_code
// app.get('/check-token', (req, res) => {
//   const device_code = req.query.device_code;
//   if (!device_code) {
//     return res.status(400).json({ error: 'Missing device_code' });
//   }
//   const user_token = tokens[device_code];
//   if (user_token) {
//     res.json({ user_token });
//     // Optionally: delete after first retrieval for one-time pairing!
//     // delete tokens[device_code];
//   } else {
//     res.status(404).json({ user_token: null });
//   }
// });

// // You may also want to support clearing expired or used tokens, add that as needed.

// // Start server as before
// var port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`Your app is listening on port ${port}.`));
