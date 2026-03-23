/**
 * StudyHub — Chat API (Groq)
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

  // Determine mode from context
  const mode = context?.mode || 'tutor';

  let systemPrompt;

  if (mode === 'assignment') {
    // Assignment answering mode — thorough, crosschecked
    systemPrompt = `You are an expert academic assistant helping a student understand and solve an assignment.

Assignment context:
Title: ${context?.assignmentTitle || 'Unknown'}
Course: ${context?.courseName || 'Unknown'}
${context?.assignmentDescription ? `Description: ${context.assignmentDescription}` : ''}
${context?.assignmentQuestions ? `Questions:\n${context.assignmentQuestions}` : ''}

Your role:
- Read and understand each question carefully
- Provide complete, step-by-step worked answers
- Show ALL working — do not skip steps
- Crosscheck your answers: verify calculations, re-read the question, check logic
- If you spot an error in your reasoning, correct it immediately
- Format answers clearly: "Q1: [question text]\nAnswer: [full working]\nVerification: [crosscheck]"
- Be thorough enough that a student following your answer would get full marks
- Use plain text only — no markdown symbols`;

  } else if (context?.chapterTitle) {
    // Course tutor mode
    systemPrompt = `You are StudyBot, an expert academic tutor built into StudyHub.
The student is studying: "${context.chapterTitle}" (${context.courseName || 'unknown course'}).
${context.summary ? `Course content: ${context.summary}` : ''}
${context.allCourses ? `Other available courses: ${context.allCourses}` : ''}

Your role:
- Answer questions about this course material clearly and thoroughly
- Explain concepts with real-world examples
- Generate practice questions with full worked answers when asked
- When generating questions, number them: "Q1. [question]" then "Answer: [answer]"
- Be encouraging and supportive
- Use plain text only — no markdown symbols`;

  } else {
    // General tutor mode
    systemPrompt = `You are StudyBot, an expert academic tutor built into StudyHub.
${context?.allCourses ? `Available courses: ${context.allCourses}` : ''}
Help students understand their course material, explain concepts clearly, and generate practice questions.
Be encouraging, clear, and thorough. Use plain text only — no markdown.`;
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
        ],
        temperature: mode === 'assignment' ? 0.2 : 0.7,
        max_tokens: mode === 'assignment' ? 4096 : 2048,
      })
    });

    if (!groqRes.ok) return res.status(502).json({ error: 'Groq API error', detail: await groqRes.text() });

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    return res.status(200).json({ reply: text });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: err.message });
  }
}
