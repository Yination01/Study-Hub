/**
 * StudyHub — Auth API
 * © 2025 Yination & Excalibur. All rights reserved.
 *
 * POST /api/auth
 * Validates superuser credentials server-side.
 * Credentials live in Vercel environment variables only —
 * they are never sent to or stored in the browser.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false });
  }

  const SU_USERNAME = process.env.SU_USERNAME;
  const SU_PASSWORD = process.env.SU_PASSWORD;

  if (!SU_USERNAME || !SU_PASSWORD) {
    return res.status(500).json({ error: 'Superuser credentials not configured on server.' });
  }

  const usernameMatch = username.toLowerCase() === SU_USERNAME.toLowerCase();
  const passwordMatch = password === SU_PASSWORD;

  if (usernameMatch && passwordMatch) {
    return res.status(200).json({ ok: true, role: 'superuser', displayName: 'Owner' });
  }

  return res.status(200).json({ ok: false });
}
