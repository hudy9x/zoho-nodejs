const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const { missingCredentialsError, missingAccountIdError } = require('./error');
const ZohoApi = require('./zohoApi');
const getHomeTemplate = require('./views/home');

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
const ZOHO_SCOPES = process.env.ZOHO_SCOPES || "";

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method}: ${req.path}`);
  next();
});

// Home page with instructions
app.get('/', (req, res) => {
  const authUrl = `https://${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?scope=${ZOHO_SCOPES}&client_id=${CLIENT_ID}&response_type=code&access_type=offline&prompt=consent&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.send(getHomeTemplate({ authUrl, redirectUri: REDIRECT_URI }));
});

// OAuth2 callback route to exchange code for tokens
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code found in query.');
  }

  try {
    const data = await ZohoApi.exchangeCodeForTokens(code, REDIRECT_URI);
    res.json(data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// Send test email route
app.get('/send-test-email', async (req, res) => {
  const { toAddress, subject, content } = req.query;
  try {
    const data = await ZohoApi.sendEmail({
      fromAddress: process.env.FROM_ADDRESS,
      toAddress: toAddress || 'huudai09@gmail.com',
      subject: subject || 'Test from Zoho API',
      content: content || 'Hello from Express.js and Zoho!'
    });
    res.json(data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.get('/get-account-id', async (req, res) => {
  try {
    const data = await ZohoApi.getAccountId();
    res.json(data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.get('/mark-email', async (req, res) => {
  console.log('mark-email', req.query);
  const { messageId, read } = req.query;

  if (!messageId) {
    return res.status(400).send('Missing or invalid parameters.');
  }

  try {
    const data = await ZohoApi.markEmail({ messageIds: [messageId], read: read === 'true' });
    res.json(data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.post('/mark-email', async (req, res) => {
  const { messageIds, read } = req.body;

  if (!Array.isArray(messageIds) || typeof read !== 'boolean') {
    return res.status(400).send('Missing or invalid parameters.');
  }

  try {
    const data = await ZohoApi.markEmail({ messageIds, read });
    res.json(data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// List messages route
app.get('/list-messages', async (req, res) => {
  try {
    const data = await ZohoApi.listMessages();
    res.json(data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// Renew access token route
app.get('/renew-access-token', async (req, res) => {
  try {
    const data = await ZohoApi.renewAccessToken();
    res.json(data);
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});
