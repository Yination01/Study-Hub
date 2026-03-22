/**
 * StudyHub — Chat API (powered by Groq)
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Groq API key not configured' });

  const systemPrompt = context?.chapterTitle
    ? `You are StudyBot, an expert academic tutor built into StudyHub.
The student is currently studying: "${context.chapterTitle}" (${context.courseName || 'unknown course'}).
${context.summary ? `Course content summary: ${context.summary}` : ''}

Your role:
- Answer questions about this course material clearly and thoroughly
- Explain concepts in simple terms with real-world examples
- Generate extra practice questions with full worked answers when asked
- When generating questions, number them clearly: "Q1. [question]" then "Answer: [answer]"
- Be encouraging and supportive
- Use plain text only — no markdown symbols like ** or ##`
    : `You are StudyBot, an expert academic tutor built into StudyHub.
Help students understand their course material, explain concepts clearly, and generate practice questions with full answers.
Be encouraging, clear, and thorough. Use plain text only — no markdown.`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return res.status(502).json({ error: 'Groq API error', detail: err });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    return res.status(200).json({ reply: text });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: err.message });
  }
}
