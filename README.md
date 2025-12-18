📬 Cloudflare Worker Email Inbox

A serverless email inbox built entirely on Cloudflare Workers, using Cloudflare Email Routing and Cloudflare KV.

This project lets you receive emails, store them without a traditional database, and view them through a secure, modern web UI — all without running a server.

✨ Features

📥 Receive emails via Cloudflare Email Routing

🗄️ Store emails in Cloudflare KV

🔐 Password-protected inbox

🔍 Search emails by subject or sender

🟢 Unread / read status

⏱️ Human-friendly timestamps (5 minutes ago)

📨 View emails as Plain text or HTML

🎨 Clean, modern, responsive UI

⚡ Deploy directly from Cloudflare Dashboard

🚫 No VPS, no database server, no frontend framework

🧱 Architecture Overview
Incoming Email
      ↓
Cloudflare Email Routing
      ↓
Cloudflare Worker
      ↓
Cloudflare KV (EMAILS)
      ↓
Web Inbox UI

📦 Requirements

A Cloudflare account

Cloudflare Workers enabled

Cloudflare Email Routing enabled

You do not need:

A VPS

A traditional database

Node.js / NPM

Frontend frameworks

🚀 Deployment Guide (Beginner Friendly)
1. Create a Worker

Go to Cloudflare Dashboard

Navigate to Workers & Pages

Click Create Worker

Choose a name (e.g. email-inbox)

Select HTTP handler

Create the worker

2. Create a KV Namespace

Go to Workers & Pages → KV

Click Create namespace

Name it:

EMAILS

3. Bind KV to the Worker

Open your Worker

Go to Settings → Variables and Secrets

Under KV Namespace Bindings, click Add

Fill in:

Variable name: EMAILS

Namespace: EMAILS

Click Save and Deploy

4. Set Inbox Password

In Settings → Variables and Secrets, add an environment variable:

INBOX_PASSWORD = your_password_here


Example:

INBOX_PASSWORD = 123456


Then click Save and Deploy.

5. Deploy the Worker Code

Open the Code tab of your Worker

Delete the default code

Paste the content of worker.js from this repository

Click Save and Deploy

6. Enable Email Routing

Go to Email → Email Routing

Add a destination → choose Worker

Select your worker (e.g. email-inbox)

Add a rule:

Any address → Worker

Now send a test email to your domain.

🧪 Usage
Access the Inbox
https://<worker-name>.<account>.workers.dev


If not logged in → redirected to /login

Enter the password → access inbox

Send a Test Email

Send an email to your routed domain

Reload the inbox page

The email will appear instantly

🔐 Security Notes

Inbox is protected by a password

Authentication uses an HttpOnly cookie (auth=1)

HTML emails are rendered inside:

<iframe sandbox>


This prevents JavaScript execution and cookie access

📁 Email Data Structure (Stored in KV)

Each email is stored as a JSON object:

{
  "id": "1700000000000",
  "from": "user@gmail.com",
  "to": "inbox@domain.com",
  "subject": "Hello",
  "body": "Plain text content",
  "htmlBody": "<html>...</html>",
  "date": "2025-12-18T12:00:00Z",
  "isRead": false
}

🛠️ Customization

Change password
Update INBOX_PASSWORD in Cloudflare Dashboard — no code change required

Customize UI
All CSS is embedded inside the page() function in worker.js

❌ Common Issues
Inbox does not redirect to /login

Open the site in an incognito/private browser window

Or clear browser cache

Error 1101

Ensure KV namespace EMAILS is bound correctly

Verify the variable name is exactly EMAILS

🧭 Roadmap Ideas

Pagination for large inboxes

Email attachments

Dark mode

Telegram / Discord notifications

Multi-user authentication

📄 License

MIT License

Free to use, modify, and deploy for both personal and commercial projects.
