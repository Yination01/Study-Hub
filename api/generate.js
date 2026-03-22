/**
 * StudyHub — Course Generation API (Groq)
 * © 2025 Yination & Excalibur. All rights reserved.
 *
 * POST /api/generate
 * Body: { text: string }            ← extracted text from any file
 *    OR { imageBase64, mimeType }   ← image sent to vision model
 */

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
- definitions: ALL important terms, 20-35 items
- mechanisms: 4-7 important processes explained step-by-step
- algorithms: only if document contains algorithms/methods; empty [] otherwise
- chapters: 4-8 section blocks, each with EXACTLY 3 non-obvious takeaways
- questions: EXACTLY 25 challenging varied exam-style questions with full worked answers
- Preserve chronological order of the source material
- Return ONLY the JSON object, nothing else`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Groq API key not configured' });

  const { text, imageBase64, mimeType } = req.body || {};

  if (!text && !imageBase64) {
    return res.status(400).json({ error: 'Provide either text or imageBase64' });
  }

  try {
    let messages;

    if (imageBase64) {
      // Vision model for images
      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` }
            },
            {
              type: 'text',
              text: `${SYSTEM_PROMPT}\n\nExtract all academic content from this image and generate the study guide JSON.`
            }
          ]
        }
      ];
    } else {
      // Text-based content
      messages = [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Generate a StudyHub JSON study guide from the following document content:\n\n${text.slice(0, 28000)}` // Groq context limit
        }
      ];
    }

    const model = imageBase64
      ? 'meta-llama/llama-4-scout-17b-16e-instruct' // vision-capable
      : 'llama-3.3-70b-versatile';

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 8192
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return res.status(502).json({ error: 'Groq API error', detail: err });
    }

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    if (!clean) return res.status(502).json({ error: 'Empty response from Groq' });

    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}
