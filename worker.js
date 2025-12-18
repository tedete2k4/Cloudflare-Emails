export default {

  // =====================================================
  //                  EMAIL HANDLER
  // =====================================================
  async email(message, env) {
    if (!env.EMAILS) return;

    const id = Date.now().toString();
    const from = message.from;
    const to = message.to;
    const subject = message.headers.get("subject") || "(No subject)";
    const date = new Date().toISOString();

    const raw = await new Response(message.raw).text();
    const { text, html } = parseEmail(raw);

    await env.EMAILS.put(id, JSON.stringify({
      id,
      from,
      to,
      subject,
      body: text || "(No text content)",
      htmlBody: html,
      date,
      isRead: false
    }));
  },

  // =====================================================
  //                  HTTP HANDLER
  // =====================================================
  async fetch(request, env) {

    if (!env.EMAILS) {
      return new Response("KV EMAILS not bound", { status: 500 });
    }

    const url = new URL(request.url);
    const params = url.searchParams;

    // ================= AUTH =================
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = {};
    cookieHeader.split(";").forEach(c => {
      const [k, v] = c.trim().split("=");
      if (k) cookies[k] = v;
    });

    const loggedIn = cookies.auth === "1";

    if (!loggedIn && url.pathname !== "/login") {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" }
      });
    }

    // ================= LOGIN =================
    if (url.pathname === "/login") {

      if (request.method === "POST") {
        const form = await request.formData();
        if (form.get("password") === env.INBOX_PASSWORD) {
          return new Response(null, {
            status: 302,
            headers: {
              "Set-Cookie": "auth=1; Path=/; HttpOnly",
              "Location": "/"
            }
          });
        }
      }

      return page("Login", `
        <div class="center">
          <form method="POST" class="card auth">
            <h2>📬 Inbox Login</h2>
            <input name="password" type="password" placeholder="Password" required>
            <button>Login</button>
          </form>
        </div>
      `);
    }

    // ================= DELETE =================
    if (params.has("delete")) {
      await env.EMAILS.delete(params.get("delete"));
      return new Response(null, {
        status: 302,
        headers: { Location: "/" }
      });
    }

    // ================= VIEW EMAIL =================
    if (params.has("view")) {
      const id = params.get("view");
      const data = await env.EMAILS.get(id);
      if (!data) return new Response("Not found", { status: 404 });

      const email = JSON.parse(data);

      if (!email.isRead) {
        email.isRead = true;
        await env.EMAILS.put(id, JSON.stringify(email));
      }

      return page(email.subject, `
        <a class="back" href="/">← Inbox</a>

        <div class="card">
          <h2>${esc(email.subject)}</h2>

          <div class="meta">
            <span>${esc(email.from)}</span>
            <span>${fmt(email.date)}</span>
          </div>

          <div class="actions">
            <button onclick="showPlain()">Plain</button>
            ${email.htmlBody ? `<button onclick="showHTML()">HTML</button>` : ""}
          </div>

          <pre id="plain" class="body">${esc(email.body)}</pre>

          ${email.htmlBody ? `
            <iframe id="html"
              sandbox
              srcdoc="${esc(email.htmlBody)}"></iframe>
          ` : ""}

          <script>
            const p = document.getElementById('plain');
            const h = document.getElementById('html');
            function showPlain(){ p.style.display='block'; if(h) h.style.display='none'; }
            function showHTML(){ p.style.display='none'; h.style.display='block'; }
          </script>
        </div>
      `);
    }

    // ================= LIST EMAILS =================
    const q = (params.get("q") || "").toLowerCase();
    const list = await env.EMAILS.list();
    let emails = [];

    for (const k of list.keys) {
      const e = await env.EMAILS.get(k.name);
      if (e) emails.push(JSON.parse(e));
    }

    emails.sort((a, b) => b.id - a.id);

    if (q) {
      emails = emails.filter(e =>
        e.subject.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q)
      );
    }

    return page("Inbox", `
      <header>
        <h1>📥 Inbox</h1>
        <form>
          <input name="q" value="${esc(q)}" placeholder="Search email...">
        </form>
      </header>

      <div class="list">
        ${emails.length === 0 ? `<div class="empty">No emails</div>` : ""}

        ${emails.map(e => `
          <div class="item ${e.isRead ? "" : "unread"}">
            <div>
              <a href="?view=${e.id}" class="subject">${esc(e.subject)}</a>
              <div class="from">${esc(e.from)}</div>
            </div>
            <div class="right">
              <span>${rel(e.date)}</span>
              <a class="del" href="?delete=${e.id}"
                onclick="return confirm('Delete?')">✕</a>
            </div>
          </div>
        `).join("")}
      </div>
    `);
  }
};

// =====================================================
//                MIME PARSER (FIX)
// =====================================================
function parseEmail(raw) {
  const boundaryMatch = raw.match(/boundary="([^"]+)"/i);
  if (!boundaryMatch) {
    return { text: raw, html: "" };
  }

  const boundary = boundaryMatch[1];
  const parts = raw.split(`--${boundary}`);

  let text = "";
  let html = "";

  for (const part of parts) {
    if (/Content-Type:\s*text\/plain/i.test(part)) {
      text = decodePart(part);
    }
    if (/Content-Type:\s*text\/html/i.test(part)) {
      html = decodePart(part);
    }
  }

  return { text, html };
}

function decodePart(part) {
  const sections = part.split(/\r?\n\r?\n/);
  if (sections.length < 2) return "";

  let body = sections.slice(1).join("\n").trim();

  if (/quoted-printable/i.test(part)) {
    body = decodeQuotedPrintableUtf8(body);
  } else if (/base64/i.test(part)) {
    body = decodeBase64Utf8(body);
  }

  return body;
}

// =====================================================
//                UI TEMPLATE
// =====================================================
function page(title, body) {
  return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>
*{box-sizing:border-box}
body{
  margin:0;
  font-family:system-ui,-apple-system,BlinkMacSystemFont;
  background:#f5f7fb;
  color:#111;
}
a{text-decoration:none;color:inherit}
.center{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
}
header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:20px;
}
header input{
  padding:8px 12px;
  border-radius:8px;
  border:1px solid #ddd;
}
.card{
  background:#fff;
  border-radius:14px;
  padding:20px;
  box-shadow:0 10px 30px rgba(0,0,0,.06);
}
.auth{
  width:300px;
  text-align:center;
}
.auth input{
  width:100%;
  padding:10px;
  margin:10px 0;
}
.auth button{
  width:100%;
}
.back{
  display:inline-block;
  margin-bottom:12px;
  color:#2563eb;
}
.meta{
  display:flex;
  justify-content:space-between;
  color:#666;
  font-size:13px;
  margin-bottom:10px;
}
.actions button{
  margin-right:8px;
}
iframe{
  width:100%;
  height:600px;
  border:none;
  margin-top:10px;
  display:none;
}
.body{
  white-space:pre-wrap;
  line-height:1.6;
}
.list{
  background:#fff;
  border-radius:14px;
  overflow:hidden;
  box-shadow:0 10px 30px rgba(0,0,0,.06);
}
.item{
  display:flex;
  justify-content:space-between;
  padding:14px 18px;
  border-bottom:1px solid #eee;
}
.item:hover{background:#f8fafc}
.item.unread .subject{font-weight:700}
.subject{display:block}
.from{
  font-size:13px;
  color:#666;
}
.right{
  text-align:right;
  font-size:13px;
  color:#666;
}
.del{
  margin-left:10px;
  color:#dc2626;
}
.empty{
  padding:30px;
  text-align:center;
  color:#777;
}
button{
  padding:6px 12px;
  border-radius:8px;
  border:1px solid #ddd;
  background:#fff;
  cursor:pointer;
}
button:hover{background:#f1f5f9}
</style>
</head>
<body>
<div style="max-width:900px;margin:auto;padding:20px">
${body}
</div>
</body>
</html>
`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// =====================================================
//                HELPERS
// =====================================================
const esc = s => String(s || "").replace(/[&<>"]/g, m => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
}[m]));

const fmt = d => new Date(d).toLocaleString("vi-VN");

const rel = d => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " h ago";
  return Math.floor(s / 86400) + " days ago";
};

function decodeQuotedPrintableUtf8(input = "") {
  input = input.replace(/=\r?\n/g, "");
  const bytes = [];
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "=") {
      bytes.push(parseInt(input.substr(i + 1, 2), 16));
      i += 2;
    } else {
      bytes.push(input.charCodeAt(i));
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function decodeBase64Utf8(input = "") {
  const binary = atob(input.replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
