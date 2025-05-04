const { makeRequest, loadTokens, saveTokens, stringifyQuery } = require('./utils');

const ZOHO_ACCOUNTS_URL = 'accounts.zoho.com';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

class ZohoApi {
  static async exchangeCodeForTokens(code, redirectUri) {
    const params = stringifyQuery({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      code: code
    });

    const options = {
      hostname: ZOHO_ACCOUNTS_URL,
      path: '/oauth/v2/token?' + params,
      method: 'POST'
    };

    const response = await makeRequest(options);
    console.log('exchangeCodeForTokens response', response);
    saveTokens(response.data);
    return response.data;
  }

  static async sendEmail({ fromAddress, toAddress, subject, content }) {
    const tokens = this._getTokens();
    
    const emailData = JSON.stringify({
      fromAddress,
      toAddress,
      subject,
      content
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

    const response = await makeRequest(options, emailData);
    return response.data;
  }

  static async getAccountId() {
    const tokens = this._getTokens();

    const options = {
      hostname: 'mail.zoho.com',
      path: '/api/accounts',
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
        'Accept': 'application/json'
      }
    };

    const response = await makeRequest(options);
    return response.data;
  }

  static async markEmail({ messageIds, read }) {
    const tokens = this._getTokens();

    const mode = read ? 'markAsRead' : 'markAsUnread';
    const data = JSON.stringify({
      mode,
      messageId: messageIds
    });

    const options = {
      hostname: 'mail.zoho.com',
      path: `/api/accounts/${ACCOUNT_ID}/updatemessage`,
      method: 'PUT',
      headers: {
        'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const response = await makeRequest(options, data);
    return response.data;
  }

  static async listMessages(folderId = '6702887000000008014') {
    const tokens = this._getTokens();

    const options = {
      hostname: 'mail.zoho.com',
      path: `/api/accounts/${ACCOUNT_ID}/messages/view?folderId=${folderId}`,
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
        'Accept': 'application/json'
      }
    };

    const response = await makeRequest(options);
    return response.data;
  }

  static async renewAccessToken() {
    const tokens = this._getTokens();
    console.log('renewAccessToken tokens', tokens);
    const refresh_token = tokens.refresh_token;

    const params = stringifyQuery({
      refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token'
    });

    const options = {
      hostname: 'accounts.zoho.com',
      path: `/oauth/v2/token?${params}`,
      method: 'POST'
    };

    const response = await makeRequest(options);
    if (response.data.access_token) {
      saveTokens({ ...response.data, refresh_token });
    }
    return response.data;
  }

  static _getTokens() {
    const tokens = loadTokens();
    if (!tokens || !tokens.access_token) {
      throw new Error('No access token found. Please authenticate first.');
    }
    return tokens;
  }
}

module.exports = ZohoApi;
