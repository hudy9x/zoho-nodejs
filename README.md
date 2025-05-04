# Zoho Mail API Integration with Node.js

A sample Express.js application demonstrating integration with Zoho Mail API using OAuth 2.0 authentication. This app provides endpoints for sending emails, listing messages, marking emails as read/unread, and managing OAuth tokens.

## Features

- OAuth 2.0 authentication with Zoho Mail
- Send test emails
- List messages from a specific folder
- Mark emails as read/unread
- Auto token refresh functionality
- Simple web interface for testing

## Prerequisites

1. Node.js installed on your system
2. A Zoho Mail account
3. A registered application in [Zoho Developer Console](https://accounts.zoho.com/developerconsole)
   - Select "Server-Based Applications" when registering
   - Configure redirect URI as `http://localhost:3000/callback`

## Installation

Clone the repository:
```bash
git clone [your-repo-url]
cd [your-repo-name]
```

Install dependencies:
```bash
npm install
```

Configure your application:
   - Open `index.js`
   - Update the following constants with your Zoho application credentials:
     ```javascript
     const CLIENT_ID = 'your_client_id';
     const CLIENT_SECRET = 'your_client_secret';
     const ACCOUNT_ID = 'your_account_id'; // You can get this using /get-account-id endpoint
     ```

## Usage

Start the server:
```bash
node index.js
```

Open your browser and navigate to `http://localhost:3000`

Follow the authentication flow:
   - Click "Get Authorization Code" link
   - Log in to your Zoho account and authorize the application
   - The app will automatically save the tokens in `zoho_tokens.json`

Get your Account ID:
   - After authentication, click on "Get ACCOUNT_ID"
   - Copy your account ID and update it in `index.js`

Test the integration:
   - Click "Send Test Email" to verify the setup

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Home page with authentication instructions |
| GET | `/callback` | OAuth callback endpoint |
| GET | `/send-test-email` | Send a test email |
| GET | `/get-account-id` | Retrieve your Zoho Mail account ID |
| GET | `/list-messages` | List messages from a specific folder |
| POST | `/mark-email` | Mark messages as read/unread |
| POST | `/renew-access-token` | Refresh the access token |

## Token Management

- Tokens are automatically saved to `zoho_tokens.json`
- Access tokens expire after 1 hour
- Use the `/renew-access-token` endpoint to refresh expired tokens
- The refresh token is used automatically when renewing access tokens

## Security Notes

- Never commit your `CLIENT_ID`, `CLIENT_SECRET`, or `zoho_tokens.json` to version control
- Use environment variables for sensitive data in production
- Keep your refresh token secure

## Error Handling

The application includes basic error handling for:
- Missing or invalid tokens
- Failed API requests
- Invalid parameters
- Token refresh failures

## Contributing

Feel free to submit issues and enhancement requests!
