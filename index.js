const express = require('express');
const fs = require('fs');
const https = require('https');
const querystring = require('querystring');
const path = require('path');

const app = express();
const PORT = 3000;

// 1. Follow this documentation to integrate Zoho Email api: https://www.zoho.com/mail/help/api/using-oauth-2.html

// ==== CONFIGURATION ====

// 2. Follow this to https://accounts.zoho.com/developerconsole. to register an application
// For this app, please select "Server-Based Applications"
// You can get CLIENT_ID and CLIENT_SECRET
// Next, send
const CLIENT_ID = '1000.WS1E1H9L8QWJV1F4YC0NYXOI1S3Y2M';
const CLIENT_SECRET = 'b84713583413d1f4afff8af04563ffc980e8c7ab28';

// 3. Remember that you can use http://localhost for testing
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const TOKEN_FILE = path.join(__dirname, 'zoho_tokens.json');
const ZOHO_ACCOUNTS_URL = 'accounts.zoho.com';

// 4. Zoho user id IS NOT account ID
// so please run api /get-account-id and find `accountId`
const ACCOUNT_ID = '6702887000000008002';

// 5. For scopes, you can find it in https://www.zoho.com/mail/help/api/post-send-an-email.html
// Find `OAuth Scope` section
const ZOHO_SCOPES = 'ZohoMail.messages.ALL,ZohoMail.accounts.READ,ZohoMail.folders.ALL'

// Utility to save new tokens
function saveTokens(tokens) {
  // save this to a file 
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
  console.log('Tokens saved to', TOKEN_FILE);
}


// ==== UTILS ====
function saveTokens(tokens) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
  console.log('Tokens saved to', TOKEN_FILE);
}

function loadTokens() {
  if (fs.existsSync(TOKEN_FILE)) {
    return JSON.parse(fs.readFileSync(TOKEN_FILE));
  }
  return null;
}

// ==== ROUTES ====

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method}: ${req.path}`)
  next()
})


// Home page with instructions
app.get('/', (req, res) => {
  const authUrl = `https://${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?scope=${ZOHO_SCOPES}&client_id=${CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.send(`
    <h2>Zoho OAuth2 Express Example</h2>
    <ol>
      <li><a href="${authUrl}" target="_blank">Get Authorization Code</a></li>
      <li>After authorizing, Zoho will redirect you to <code>${REDIRECT_URI}</code> with <code>?code=...</code> in the URL.</li>
      <li>Tokens will be saved automatically.</li>
      <li><a href="/send-test-email">Send Test Email</a> (after authenticating and setting your ACCOUNT_ID)</li>
      <li><a href="/get-account-id" target="_blank">Get ACCOUNT_ID</a></li>
    </ol>
  `);
});

// OAuth2 callback route to exchange code for tokens
app.get('/callback', (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code found in query.');
  }

  const params = querystring.stringify({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code: code
  });

  const options = {
    hostname: ZOHO_ACCOUNTS_URL,
    path: '/oauth/v2/token?' + params,
    method: 'POST'
  };

  const zohoReq = https.request(options, (zohoRes) => {
    let data = '';
    zohoRes.on('data', chunk => data += chunk);
    zohoRes.on('end', () => {
      try {
        const tokens = JSON.parse(data);
        saveTokens(tokens);
        res.json(tokens);
      } catch (e) {
        res.status(500).send('Error parsing Zoho response: ' + e.message);
      }
    });
  });

  zohoReq.on('error', (e) => {
    res.status(500).send('Error: ' + e.message);
  });

  zohoReq.end();
});

// Send test email route
app.get('/send-test-email', (req, res) => {
  const tokens = loadTokens();
  if (!tokens || !tokens.access_token) {
    return res.status(400).send('No access token found. Please authenticate first.');
  }

  // Prepare email data
  const emailData = JSON.stringify({
    fromAddress: 'hi@hudy9x.com',
    toAddress: 'huudai09@gmail.com',
    subject: 'Test from Zoho API',
    content: 'Hello from Express.js and Zoho!'
  });

  const options = {
    hostname: 'mail.zoho.com',
    path: `/api/accounts/${ACCOUNT_ID}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(emailData)
    }
  };

  const zohoReq = https.request(options, (zohoRes) => {
    let data = '';
    zohoRes.on('data', chunk => data += chunk);
    zohoRes.on('end', () => {
      res.set('Content-Type', 'application/json');
      res.send(data);
    });
  });

  zohoReq.on('error', (e) => {
    res.status(500).send('Error: ' + e.message);
  });

  zohoReq.write(emailData);
  zohoReq.end();
});

app.get('/get-account-id', (req, res) => {
  const tokens = loadTokens();
  if (!tokens || !tokens.access_token) {
    return res.status(400).send('No access token found. Please authenticate first.');
  }

  const options = {
    hostname: 'mail.zoho.com',
    path: '/api/accounts',
    method: 'GET',
    headers: {
      'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
      'Accept': 'application/json'
    }
  };

  const zohoReq = https.request(options, (zohoRes) => {
    let data = '';
    zohoRes.on('data', chunk => data += chunk);
    zohoRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        res.json(json);
      } catch (e) {
        res.status(500).send('Error parsing Zoho response: ' + e.message);
      }
    });
  });

  zohoReq.on('error', (e) => {
    res.status(500).send('Error: ' + e.message);
  });

  zohoReq.end();
});

app.post('/mark-email', (req, res) => {
  const tokens = loadTokens();
  if (!tokens || !tokens.access_token) {
    return res.status(400).send('No access token found. Please authenticate first.');
  }

  const { messageIds, read } = req.body;
  const accountId = ACCOUNT_ID

  if (!accountId || !Array.isArray(messageIds) || typeof read !== 'boolean') {
    return res.status(400).send('Missing or invalid parameters.');
  }

  const mode = read ? 'markAsRead' : 'markAsUnread';
  const data = JSON.stringify({
    mode,
    messageId: messageIds
  });

  const options = {
    hostname: 'mail.zoho.com',
    path: `/api/accounts/${accountId}/updatemessage`,
    method: 'PUT',
    headers: {
      'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  console.log('mark as email: ', options, data)

  const zohoReq = require('https').request(options, (zohoRes) => {
    let responseData = '';
    zohoRes.on('data', chunk => responseData += chunk);
    zohoRes.on('end', () => {
      res.set('Content-Type', 'application/json');
      res.status(zohoRes.statusCode).send(responseData);
    });
  });

  zohoReq.on('error', (e) => {
    res.status(500).send('Error: ' + e.message);
  });

  zohoReq.write(data);
  zohoReq.end();
});


app.get('/list-messages', (req, res) => {
  const tokens = loadTokens();
  if (!tokens || !tokens.access_token) {
    return res.status(400).send('No access token found. Please authenticate first.');
  }

  // Replace with your actual accountId and folderId
  const accountId = ACCOUNT_ID;
  const folderId = '6702887000000008014'; // e.g., Inbox folderId

  const options = {
    hostname: 'mail.zoho.com',
    path: `/api/accounts/${accountId}/messages/view?folderId=${folderId}`,
    method: 'GET',
    headers: {
      'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
      'Accept': 'application/json'
    }
  };

  const zohoReq = require('https').request(options, (zohoRes) => {
    let data = '';
    zohoRes.on('data', chunk => data += chunk);
    zohoRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        // console.log('data', data)
        // // The messages list is usually in json.data
        // const messages = (json.data && Array.isArray(json.data)) ? json.data : [];
        // // Build HTML table
        // let html = `
        //   <h2>Zoho Mail Messages</h2>
        //   <table border="1" cellpadding="5" cellspacing="0">
        //     <tr>
        //       <th>Message ID</th>
        //       <th>Subject</th>
        //     </tr>
        // `;
        // messages.forEach(msg => {
        //   html += `<tr>
        //     <td>${msg.messageId}</td>
        //     <td>${msg.subject || '(No Subject)'}</td>
        //   </tr>`;
        // });
        // html += '</table>';
        res.json(json);
      } catch (e) {
        res.status(500).send('Error parsing Zoho response: ' + e.message);
      }
    });
  });

  zohoReq.on('error', (e) => {
    res.status(500).send('Error: ' + e.message);
  });

  zohoReq.end();
});


app.post('/renew-access-token', (req, res) => {

  const tokens = loadTokens();
  if (!tokens || !tokens.refresh_token) {
    return res.status(400).send('No access token found. Please authenticate first.');
  }
  // You can get refresh_token from body or use the saved one
  const refresh_token = tokens.refresh_token

  const params = querystring.stringify({
    refresh_token: refresh_token,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token'
  });

  const options = {
    hostname: 'accounts.zoho.com',
    path: `/oauth/v2/token?${params}`,
    method: 'POST'
  };

  const zohoReq = https.request(options, (zohoRes) => {
    let data = '';
    zohoRes.on('data', chunk => data += chunk);
    zohoRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.access_token) {
          // Optionally save new tokens
          saveTokens({ ...json, refresh_token });
        }
        res.status(zohoRes.statusCode).json(json);
      } catch (e) {
        res.status(500).send('Error parsing Zoho response: ' + e.message);
      }
    });
  });

  zohoReq.on('error', (e) => {
    res.status(500).send('Error: ' + e.message);
  });

  zohoReq.end();
});


// ==== START SERVER ====
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});

