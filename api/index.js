const crypto = require('crypto');

module.exports = (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const path = url.pathname;

  // GDPR Compliance Webhooks (mandatory for Shopify apps)
  // These return 200 OK as SheetSync doesn't store any customer data

  if (path === '/webhooks/customers/data_request' && req.method === 'POST') {
    // Customer data request - we don't store customer data
    return res.status(200).json({ message: 'No customer data stored' });
  }

  if (path === '/webhooks/customers/redact' && req.method === 'POST') {
    // Customer data deletion - we don't store customer data
    return res.status(200).json({ message: 'No customer data to delete' });
  }

  if (path === '/webhooks/shop/redact' && req.method === 'POST') {
    // Shop data deletion - we don't store shop data
    return res.status(200).json({ message: 'No shop data to delete' });
  }

  // OAuth callback - handles the auth redirect after install
  if (path === '/auth/callback') {
    const code = url.searchParams.get('code');
    const shop = url.searchParams.get('shop');
    const hmac = url.searchParams.get('hmac');

    if (!code || !shop) {
      return res.status(400).send(page('Error', 'Missing authorization code or shop parameter.'));
    }

    return res.status(200).send(page(
      'SheetSync Installed Successfully',
      `<p>SheetSync has been installed on <strong>${escapeHtml(shop)}</strong>.</p>
       <p>To complete setup, run this command in your terminal:</p>
       <pre>node shopify-oauth.js ${escapeHtml(shop)} &lt;client-id&gt; &lt;client-secret&gt;</pre>
       <p>This will exchange the authorization for a permanent access token.</p>
       <p>See the <a href="https://github.com/verygoodads/sheetsync">documentation</a> for full setup instructions.</p>`
    ));
  }

  // App home page - shown after install or when visiting the app URL
  if (path === '/' || path === '') {
    return res.status(200).send(page(
      'SheetSync',
      `<p>SheetSync exports your Shopify sales data to Google Sheets.</p>
       <h2>Features</h2>
       <ul>
         <li>Monthly revenue breakdowns matching Shopify Analytics exactly</li>
         <li>Orders, gross sales, discounts, returns, net sales, shipping, taxes, total sales</li>
         <li>Automatic Google Sheets integration</li>
         <li>Current month partial data with day count labels</li>
       </ul>
       <h2>Getting Started</h2>
       <ol>
         <li>Install SheetSync on your Shopify store</li>
         <li>Run the CLI tool to authorize and get your access token</li>
         <li>Export data to your Google Sheet with one command</li>
       </ol>
       <p>For setup instructions, visit the <a href="https://github.com/verygoodads/sheetsync">documentation</a>.</p>`
    ));
  }

  // 404 for everything else
  return res.status(404).send(page('Not Found', '<p>Page not found.</p>'));
};

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - SheetSync</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 680px; margin: 0 auto; padding: 40px 20px; }
    h1 { color: #6abd45; margin-bottom: 24px; font-size: 28px; }
    h2 { margin-top: 24px; margin-bottom: 12px; font-size: 20px; }
    p { margin-bottom: 12px; }
    ul, ol { margin: 12px 0; padding-left: 24px; }
    li { margin: 6px 0; }
    pre { background: #f4f4f4; padding: 12px 16px; border-radius: 6px; overflow-x: auto; font-size: 14px; margin: 12px 0; }
    a { color: #6abd45; }
    strong { font-weight: 600; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}
