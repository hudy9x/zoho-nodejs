const fs = require('fs');
const https = require('https');
const path = require('path');

const TOKEN_FILE = path.join(__dirname, '..', 'zoho_tokens.json');

function stringifyQuery(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

function saveTokens(tokens) {
  console.log('saveTokens tokens', tokens);
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
  console.log('Tokens saved to', TOKEN_FILE);
}

function loadTokens() {
  if (fs.existsSync(TOKEN_FILE)) {
    return JSON.parse(fs.readFileSync(TOKEN_FILE));
  }
  return null;
}

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: json });
        } catch (e) {
          reject(new Error(`Error parsing response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

module.exports = {
  saveTokens,
  loadTokens,
  makeRequest,
  TOKEN_FILE,
  stringifyQuery
};
