require('dotenv').config();

const express = require('express');
const { saveTokens, loadTokens, makeRequest, stringifyQuery } = require('./utils');
const { missingCredentialsError, missingAccountIdError } = require('./error');

const app = express();
const PORT = 3000;

// Integrate Zoho Email: https://www.zoho.com/mail/help/api/using-oauth-2.html
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(missingCredentialsError);
}

if (!ACCOUNT_ID) {
  console.error(missingAccountIdError);
}

const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const ZOHO_ACCOUNTS_URL = 'accounts.zoho.com';
const ZOHO_SCOPES = process.env.ZOHO_SCOPES || ""

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
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code found in query.');
  }

  const params = stringifyQuery({
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

  try {
    const response = await makeRequest(options);
    saveTokens(response.data);
    res.json(response.data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// Send test email route
app.get('/send-test-email', async (req, res) => {
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

  try {
    const response = await makeRequest(options, emailData);
    res.set('Content-Type', 'application/json');
    res.send(response.data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.get('/get-account-id', async (req, res) => {
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

  try {
    const response = await makeRequest(options);
    res.json(response.data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.post('/mark-email', async (req, res) => {
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

  try {
    const response = await makeRequest(options, data);
    res.set('Content-Type', 'application/json');
    res.status(response.statusCode).send(response.data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// List messages route
app.get('/list-messages', async (req, res) => {
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

  try {
    const response = await makeRequest(options);
    res.json(response.data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// Renew access token route
app.post('/renew-access-token', async (req, res) => {

  const tokens = loadTokens();
  if (!tokens || !tokens.refresh_token) {
    return res.status(400).send('No access token found. Please authenticate first.');
  }
  // You can get refresh_token from body or use the saved one
  const refresh_token = tokens.refresh_token

  const params = stringifyQuery({
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

  try {
    const response = await makeRequest(options);
    if (response.data.access_token) {
      // Optionally save new tokens
      saveTokens({ ...response.data, refresh_token });
    }
    res.status(response.statusCode).json(response.data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// ==== START SERVER ====
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});
