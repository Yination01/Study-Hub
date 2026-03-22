/**
 * StudyHub — Chat API
 * © 2025 Yination & Excalibur. All rights reserved.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, context } = req.body || {};
  if (!messages?.length) return res.status(400).json({ error: 'Missing messages' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const systemContext = context?.chapterTitle
    ? `You are StudyBot, an expert academic tutor built into StudyHub.
The student is currently studying: "${context.chapterTitle}" (${context.courseName || 'unknown course'}).
${context.summary ? `Course content summary:\n${context.summary}` : ''}

Your role:
- Answer questions about this course material clearly and thoroughly
- Explain concepts in simple terms with real examples
- Generate extra practice questions with full worked answers when asked
- When generating questions, format them clearly numbered like: "Q1. [question]" then "Answer: [answer]"
- Keep responses focused on the course material
- Be encouraging and supportive
- Use plain text, no markdown symbols like ** or ##`
    : `You are StudyBot, an expert academic tutor built into StudyHub.
Help students understand their course material, explain concepts, and generate practice questions.
Be clear, thorough, and encouraging. Use plain text without markdown symbols.`;

  const contents = [
    { role: 'user', parts: [{ text: systemContext }] },
    { role: 'model', parts: [{ text: 'Understood. I am StudyBot, ready to help.' }] },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
  ];

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini error', detail: err });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    return res.status(200).json({ reply: text });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: err.message });
  }
}
