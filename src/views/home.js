function getHomeTemplate({ authUrl, redirectUri }) {
  return `
    <style>
      body {
        display: flex;
        gap: 60px;
        justify-content: center;
        align-items: start;
        margin-top: 120px;
        height: 100vh;
        font-family: Arial, sans-serif;
        line-height: 1.5;
        font-size: 16px;
      }
      code {
        font-family: monospace;
        background-color:rgb(220 220 220);
        padding: 2px 4px;
        border-radius: 4px;
      }
      ol {
        width: 500px;
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      li {
        background-color: #f2f2f2;
        border-radius: 10px;
        width: 100%;
        padding: 20px;
        margin: 10px;
        font-size: 24px;
      }
      a {
        text-decoration: none;
        color: #337ab7;
      }
      form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap:10px;
        align-items: start;
      }
      input {
        width: 100%;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-size: 18px;
      }
      button {
        padding: 10px 20px;
        background-color: #337ab7;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 18px;
      }
      label {
        width: 100%;
        font-size: 18px;
      }
      input[type="radio"] {
        width: 40px;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-size: 18px;
      }
      textarea {
        width: 100%;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-size: 18px;
      }
      a:hover {
        text-decoration: underline;
      }
      .flex {
        display: flex;
        gap: 10px;
      }
    </style>

    <div>
      <h2>Zoho OAuth2 Express Example</h2>
      <p>Please read the README.md file for more information.</p>
      <ol>
        <li>1. Run <a href="${authUrl}" target="_blank">Get Authorization Code</a> to get authorization code.
        <br/><br/>After authorizing, Zoho will redirect you to <code>${redirectUri}</code> with <code>?code=...</code> in the URL. 
        <br/><br/>Tokens will be saved automatically.</li>
        
        <li>2. Run <a href="/get-account-id" target="_blank">Get ACCOUNT_ID</a> to get account ID. You will need it to send emails.</li>
        <li>3. Run <a href="/list-messages" target="_blank">List Messages</a> to list messages from your inbox.
        <br/><br/>You can find <code>messageId</code>, <code>status</code> in the response and use it to mark an email as read or unread.
        </li>
        <li>4. Run <a href="/renew-access-token">Renew Access Token</a></li>
      </ol>
    </div>

    <div>
      <h2>Email API Testing</h2>
      <ol>
        <li>
          <form action="/send-test-email" method="get" target="_blank">
            <label>
              <div>To address</div>
              <input type="text" name="toAddress" placeholder="To Address" value="your-email@gmail.com">
            </label>
            <label>
              <div>Subject</div>
              <input type="text" name="subject" placeholder="Subject" value="Test from Zoho API">
            </label>
            <label>
              <div>Content</div>
              <textarea name="content" placeholder="Content">Hello from Express.js and Zoho!</textarea>
            </label>
            <button type="submit">Send Test Email</button>
          </form>
        </li>

        <li>
          <form action="/mark-email" method="get" target="_blank">
            <label>
              <div>Message ID (Get at step 3)</div>
              <input type="text" name="messageId" placeholder="Message ID">
            </label>
            <div class="flex">
              <label class="flex">
                Read
                <input type="radio" name="read" value="true"> 
              </label>
              <label class="flex">
                Unread
                <input type="radio" name="read" value="false"> 
              </label>
            </div>
            <button type="submit">Mark as Unread</button>
          </form>
        </li>
      </ol>
    </div>
    
  `;
}

module.exports = getHomeTemplate;
