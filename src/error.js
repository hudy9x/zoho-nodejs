const missingCredentialsError = `
Error: Missing CLIENT_ID or CLIENT_SECRET in .env file

To obtain these credentials:
1. Go to https://accounts.zoho.com/developerconsole
2. Create a new Server-based Application
3. Copy the Client ID and Client Secret
4. Add them to your .env file:

CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret

For detailed instructions, check the "Getting CLIENT_ID and CLIENT_SECRET" section in README.md
`;

const missingAccountIdError = `
Error: Missing ACCOUNT_ID in .env file

To get your ACCOUNT_ID:
1. First authenticate using the app
2. Visit /get-account-id endpoint
3. Find your email in the response and copy its accountId
4. Add it to your .env file:

ACCOUNT_ID=your_account_id

For detailed instructions, check the "Usage" section in README.md
`;

module.exports = {
  missingCredentialsError,
  missingAccountIdError
};
