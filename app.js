require('dotenv').config()

const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');

// -------------------------------------------
// STARTUP DIAGNOSTICS
// -------------------------------------------
console.log("=== SERVER STARTING UP ===")
console.log("ENV CHECK:", {
  PORT: process.env.PORT,
  KEY_ID: process.env.KEY_ID,
  TEAM_ID: process.env.TEAM_ID,
  SERVICE_ID: process.env.SERVICE_ID,
  PRIVATE_KEY_FILE: process.env.PRIVATE_KEY_FILE
});

try {
  const stats = fs.statSync(process.env.PRIVATE_KEY_FILE);
  console.log("Private key file exists:", stats.size, "bytes");
} catch (err) {
  console.error("Private key file NOT found:", err.message);
}
// -------------------------------------------

const getClientSecret = () => {
  console.log('getClientSecret ENV:', {
    KEY_ID: process.env.KEY_ID,
    TEAM_ID: process.env.TEAM_ID,
    SERVICE_ID: process.env.SERVICE_ID,
    PRIVATE_KEY_FILE: process.env.PRIVATE_KEY_FILE,
  })

  const time = new Date().getTime() / 1000; // Current time in seconds since Epoch
  const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_FILE);

  const headers = {
    kid: process.env.KEY_ID,
    typ: undefined
  }

  const claims = {
    'iss': process.env.TEAM_ID,
    'iat': time, // The time the token was generated
    'exp': time + 86400 * 180, // Token expiration date
    'aud': 'https://appleid.apple.com',
    'sub': process.env.SERVICE_ID,
  }

  token = jwt.sign(claims, privateKey, {
    algorithm: 'ES256',
    header: headers
  });

  return token
}

app.post('/callback', bodyParser.urlencoded({ extended: true }), (req, res) => {
  console.log('--- /callback HIT ---')
  console.log('Body:', req.body)

  try {
    let firstName = ''
    let middleName = ''
    let lastName = ''
    let email = ''

    if (req.body.user) {
      const user = JSON.parse(req.body.user)
      if (user.name) {
        if (user.name.firstName) firstName = user.name.firstName
        if (user.name.middleName) middleName = user.name.middleName
        if (user.name.lastName) lastName = user.name.lastName
      }
      if (user.email) email = user.email
    }

    const code = req.body.code
    const clientSecret = getClientSecret()

    const params = new URLSearchParams({
      success: 'true',
      code: code,
      client_secret: clientSecret,
      ...(firstName && { first_name: firstName }),
      ...(middleName && { middle_name: middleName }),
      ...(lastName && { last_name: lastName }),
      ...(email && { email: email }),
    })

    const deepLink = `pasa-mediaplayer://signin-with-apple/callback?${params.toString()}`

    console.log('Redirecting to deep link:', deepLink)
    res.redirect(deepLink)
  } catch (err) {
    console.error('Error in /callback handler:', err)
    res.redirect('pasa-mediaplayer://signin-with-apple/callback?success=false')
  }
})

/*app.post('/callback', bodyParser.urlencoded({
  extended: true
}), (req, res) => {
  console.log('--- /callback HIT ---');
  console.log('Body:', req.body);

  try {
    let returnURL = "";
    let firstName = "";
    let middleName = "";
    let lastName = "";
    let email = "";

    if (req.body.user) {
      const user = JSON.parse(req.body.user);
      firstName = '&first_name=' + (user.name.firstName || '');
      middleName = '&middle_name=' + (user.name.middleName || '');
      lastName = '&last_name=' + (user.name.lastName || '');
      email = '&email=' + (user.email || '');
    }

    const code = '&code=' + req.body.code;
    const clientSecret = '&client_secret=' + getClientSecret();

    returnURL =
      '?success=true' +
      code +
      clientSecret +
      firstName +
      middleName +
      lastName +
      email;

    console.log("Redirecting:", returnURL);
    res.redirect(returnURL);
  } catch (err) {
    console.error("ERROR in /callback:", err);
    res.redirect('?success=false');
  }
});/*
  
  /*if (res.statusCode == 200) {
    var returnURL = ""
    var firstName = ""
    var middleName = ""
    var lastName = ""
    var email = ""
    if (req.body.hasOwnProperty('user')) {
      const userdata = req.body.user
      const user = JSON.parse(userdata)
      firstName = '&first_name=' + user.name['firstName']
      middleName = '&middle_name=' + user.name['middleName']
      lastName = '&last_name=' + user.name['lastName']
      email = '&email=' + user.email
    }

    var code = '&code=' + req.body.code
    var clientSecret = '&client_secret=' + getClientSecret()
    returnURL = '?success=true' + code + clientSecret + firstName + middleName + lastName + email
    res.redirect(returnURL)
  } else {
    res.redirect('?success=false')
  }
})
*/


// Helper to build the dev token
const fs = require('fs');
const jwt = require('jsonwebtoken');

function getMusicKitDeveloperToken() {
  const privateKey = fs.readFileSync(process.env.MUSICKIT_PRIVATE_KEY_FILE);

  const now = Math.floor(Date.now() / 1000);
  const fiveMonths = 60 * 60 * 24 * 30 * 5; // Apple allows up to ~6 months

  const payload = {
    iss: process.env.MUSICKIT_TEAM_ID,
    iat: now,
    exp: now + fiveMonths,
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    header: {
      kid: process.env.MUSICKIT_KEY_ID,
    },
  });

  return token;
}

app.get('/apple-music/developer-token', (req, res) => {
  try {
    const token = getMusicKitDeveloperToken();
    res.json({ developerToken: token });
  } catch (err) {
    console.error('Error generating MusicKit dev token', err);
    res.status(500).json({ error: 'failed_to_generate_token' });
  }
});

//

var port = process.env.PORT;
app.listen(port, () => console.log(`Your app is listening on port ` + port + '.'))
