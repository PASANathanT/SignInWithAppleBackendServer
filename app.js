require('dotenv').config();

const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');

// In-memory store for pairing: device_code -> user_token
const tokens = {};

// Store the userToken posted by the web login page (phone)
app.use(express.json()); // for parsing application/json

app.post('/link-apple-token', (req, res) => {
  const { device_code, user_token } = req.body;
  if (typeof device_code === 'string' && typeof user_token === 'string') {
    tokens[device_code] = user_token;
    console.log(`Linked device_code: ${device_code}`);
    res.json({ ok: true });
  } else {
    res.status(400).json({ error: 'Missing device_code or user_token' });
  }
});

// Allow app/device to poll for user_token using its device_code
app.get('/check-token', (req, res) => {
  const device_code = req.query.device_code;
  if (!device_code) {
    return res.status(400).json({ error: 'Missing device_code' });
  }
  const user_token = tokens[device_code];
  if (user_token) {
    res.json({ user_token });
    // Optionally: delete after first retrieval for one-time pairing!
    // delete tokens[device_code];
  } else {
    res.status(404).json({ user_token: null });
  }
});

// You may also want to support clearing expired or used tokens, add that as needed.

// Start server as before
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Your app is listening on port ${port}.`));
