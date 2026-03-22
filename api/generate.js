/**
 * StudyHub — Gemini PDF Processing API
 * © 2025 Yination & Excalibur. All rights reserved.
 */

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

const SYSTEM_PROMPT = `You are an expert academic study guide generator.
Return ONLY a valid JSON object — no markdown fences, no preamble, no trailing text.

Structure:
{
  "courseName": "short course code e.g. COS 341",
  "chapterTitle": "chapter or topic title",
  "keyConcepts": [{"title":"","description":"one sentence","color":"blue|orange|green|purple"}],
  "definitions": [{"term":"","definition":""}],
  "mechanisms": [{"title":"","body":"step-by-step explanation; use \\n\\n for paragraph breaks"}],
  "algorithms": [{"name":"","description":"","note":""}],
  "chapters": [{"num":"Chapter X","name":"","takeaways":["","",""]}],
  "questions": [{"question":"","answer":""}]
}

Rules:
- keyConcepts: 12-18 items, rotate colors
- definitions: ALL bolded/important terms, 20-35 items
- mechanisms: 4-7 important processes explained step-by-step
- algorithms: only if the doc has algorithms/methods to compare; empty [] otherwise
- chapters: 4-8 section blocks, each with EXACTLY 3 non-obvious takeaways
- questions: EXACTLY 25 challenging varied exam-style questions with full worked answers.
- Preserve chronological order. Return ONLY the JSON object.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { base64Data, filename } = req.body || {};
  if (!base64Data) return res.status(400).json({ error: 'Missing base64Data' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: 'application/pdf', data: base64Data } },
              { text: `${SYSTEM_PROMPT}\n\nFilename: ${filename || 'unknown'}` }
            ]
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini API error', detail: errText });
    }

    const geminiData = await geminiRes.json();
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    if (!clean) return res.status(502).json({ error: 'Empty response from Gemini' });
    return res.status(200).json(JSON.parse(clean));

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}
