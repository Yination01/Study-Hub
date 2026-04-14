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

  const mode = context?.mode || 'tutor';
  const isSuperuser = context?.isSuperuser === true;

  let systemPrompt;

  if (mode === 'assignment') {
    systemPrompt = `You are an expert academic assistant helping a student fully understand and solve an assignment for "${context?.courseName || 'their course'}".

Assignment: ${context?.assignmentTitle || 'Unknown'}
${context?.assignmentDescription ? `Description: ${context.assignmentDescription}` : ''}
${context?.assignmentQuestions ? `Questions:\n${context.assignmentQuestions}` : ''}

Rules:
- Read every question carefully before answering anything
- Provide complete step-by-step worked answers with full working shown
- After answering, verify: re-read the question, check calculations, confirm logic
- Format: "Q1: [question]\nAnswer: [full working]\nVerification: [crosscheck]"
- Be thorough enough that a student following your answer would score full marks
- Acknowledge uncertainty honestly — never fabricate facts
- Plain text only, no markdown`;

  } else if (mode === 'explanation') {
    systemPrompt = `You are StudyBot, an expert academic tutor for "${context?.chapterTitle || 'this course'}".
A student got a quiz question wrong and needs a clear explanation.
Be encouraging, concise (3-5 sentences), and educational. Plain text only.`;

  } else if (mode === 'suggest') {
    // AI suggests improvements to course content — routes to approvals
    systemPrompt = `You are an AI curriculum assistant reviewing a StudyHub course.
Course: "${context?.chapterTitle}" (${context?.courseName})
Current content summary: ${context?.summary || 'not provided'}

Suggest 2-3 specific, actionable improvements to this course's study material.
For each suggestion, provide:
- What to add/change/improve (be specific)
- Why it would help students

Format as JSON only:
{"suggestions": [{"title": "...", "description": "...", "type": "add_content|improve_explanation|add_questions|add_examples"}]}
No preamble, no markdown, JSON only.`;

  } else if (context?.chapterTitle) {
    systemPrompt = `You are StudyBot, an expert academic tutor built into StudyHub.
You are helping a student studying: "${context.chapterTitle}" — ${context.courseName || 'unknown course'}.
${context.summary ? `Course content overview: ${context.summary}` : ''}
${context.allCourses ? `Other courses available: ${context.allCourses}` : ''}

Your capabilities:
- Answer questions about this material with clear explanations and real-world examples
- Generate well-structured practice questions with complete worked answers
- Identify gaps in understanding and suggest what to review
- Compare related concepts clearly
- When asked for questions, number them: "Q1. [question]" → "Answer: [answer]"
- Always verify your answers before responding
- Be encouraging, honest about uncertainty, and thorough
- Plain text only — no markdown symbols`;

  } else {
    systemPrompt = `You are StudyBot, an expert academic tutor built into StudyHub — an AI-powered study platform for university students.
${context?.allCourses ? `Available courses: ${context.allCourses}` : ''}

Help students:
- Understand course material with clear explanations and examples
- Generate practice questions with complete answers
- Prepare for exams with study strategies
- Explain difficult concepts in multiple ways until understood

Always: verify your answers, be honest about uncertainty, and encourage the student.
Plain text only — no markdown.`;
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
        temperature: mode === 'assignment' ? 0.2 : mode === 'suggest' ? 0.6 : 0.7,
        max_tokens: mode === 'assignment' ? 4096 : mode === 'suggest' ? 1024 : 2048,
      })
    });

    if (!groqRes.ok) return res.status(502).json({ error: 'Groq API error', detail: await groqRes.text() });

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    return res.status(200).json({ reply: text, mode });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: err.message });
  }
}
