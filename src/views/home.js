function getHomeTemplate({ authUrl, redirectUri }) {
  return `
    <style>
      body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: Arial, sans-serif;
      }
      ol {
        width: 600px;
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
        display: flex;
        flex-direction: column;
        align-items: start;
      }
      input {
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
        font-size: 18px;
      }
      input[type="radio"] {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-size: 18px;
      }
      textarea {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-size: 18px;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
    <h2>Zoho OAuth2 Express Example</h2>
    <p>Please read the README.md file for more information.</p>
    <ol>
      <li><a href="${authUrl}" target="_blank">Get Authorization Code</a>
      <br/><br/>After authorizing, Zoho will redirect you to <code>${redirectUri}</code> with <code>?code=...</code> in the URL. Tokens will be saved automatically.</li>
      
      <li><a href="/get-account-id" target="_blank">Get ACCOUNT_ID</a></li>
      <li><a href="/list-messages" target="_blank">List Messages</a></li>
      <li><a href="/renew-access-token">Renew Access Token</a></li>
    </ol>

    <h2>Email API Testing</h2>
    <ol>
      <li>
        <form action="/send-test-email" method="get" target="_blank">
          <label>
            <div>To address</div>
            <input type="text" name="toAddress" placeholder="To Address" value="huudai09@gmail.com">
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
          <input type="text" name="messageId" placeholder="Message ID">
          <div>
            <label>
              <input type="radio" name="read" value="true"> Read
            </label>
            <label>
              <input type="radio" name="read" value="false"> Unread
            </label>
          </div>
          <button type="submit">Mark as Unread</button>
        </form>
      </li>
    </ol>
  `;
}

module.exports = getHomeTemplate;
