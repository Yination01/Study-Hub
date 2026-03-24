/**
 * StudyHub — AI Generation API (Groq)
 * © 2025 Yination & Excalibur. All rights reserved.
 */

const CLASSIFY_PROMPT = `You are an academic document classifier.
Read the document and return ONLY a valid JSON object.
{
  "type": "course" | "assignment" | "ca" | "resource",
  "courseName": "course code if visible e.g. COS 341, or empty string",
  "title": "short descriptive title for this document",
  "confidence": "high" | "medium" | "low"
}
Types:
- course: lecture notes, textbook chapters, study material
- assignment: homework, coursework, project brief, question sheet
- ca: continuous assessment, test, quiz, exam paper, lab report
- resource: supplementary reading, reference, article`;

const COURSE_PROMPT = `You are an expert academic study guide generator.
Return ONLY a valid JSON object — no markdown, no preamble.
{
  "courseName": "course code e.g. COS 341",
  "chapterTitle": "chapter or topic title",
  "keyConcepts": [{"title":"","description":"one sentence","color":"blue|orange|green|purple"}],
  "definitions": [{"term":"","definition":""}],
  "mechanisms": [{"title":"","body":"step-by-step; use \\n\\n for paragraph breaks"}],
  "algorithms": [{"name":"","description":"","note":""}],
  "chapters": [{"num":"Chapter X","name":"","takeaways":["","",""]}],
  "questions": [{"question":"","answer":""}]
}
Rules: keyConcepts 12-18, definitions 20-35, mechanisms 4-7, algorithms [] if none,
chapters 4-8 each with EXACTLY 3 takeaways, questions EXACTLY 25 exam-style with full answers.`;

const ASSIGNMENT_PROMPT = `You are an expert academic assistant.
Read this assignment document carefully. For EVERY question, provide a complete worked answer.
Crosscheck each answer for logical consistency, calculation errors, and completeness.
Return ONLY a valid JSON object:
{
  "type": "assignment",
  "courseName": "course code if visible",
  "title": "assignment title",
  "description": "2-4 sentence summary of what is required",
  "dueDate": "due date string or null",
  "marks": total_marks_integer_or_null,
  "questions": [
    {
      "number": "Q1",
      "question": "exact question text",
      "marks": marks_or_null,
      "answer": "COMPLETE worked answer — show ALL steps, verify logic, crosscheck result"
    }
  ],
  "notes": "special instructions or null"
}
IMPORTANT: answers must be thorough enough to earn full marks. Show working for every step.`;

const CA_PROMPT = `You are an expert academic assistant.
Analyse this CA/test/exam. For every question provide a complete worked answer with full steps.
Return ONLY a valid JSON object:
{
  "type": "ca",
  "courseName": "course code if visible",
  "title": "CA/test title",
  "caType": "CA|Test|Quiz|Lab|Exam|Other",
  "description": "what this covers",
  "date": "date or null",
  "marks": total_or_null,
  "questions": [
    {
      "number": "Q1",
      "question": "exact question text",
      "marks": marks_or_null,
      "answer": "full worked answer — verify each step"
    }
  ]
}`;

async function callGroq(apiKey, messages, model, temperature) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: temperature ?? 0.2, max_tokens: 16000 }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

function sanitizeJsonStr(raw) {
  // Strip BOM
  let s = raw.replace(/^\uFEFF/, '');
  // Strip markdown fences
  s = s.replace(/```json|```/g, '').trim();
  // Find the JSON boundaries — strip any leading/trailing non-JSON text
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  // Replace unescaped control characters (0x00-0x1F) that break JSON.parse
  // We walk char by char and escape only those inside string literals
  let result = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const code = s.charCodeAt(i);
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\') { result += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString && code < 0x20) {
      // Escape the control character properly
      if (code === 0x09) result += '\\t';
      else if (code === 0x0A) result += '\\n';
      else if (code === 0x0D) result += '\\r';
      else result += '\\u' + code.toString(16).padStart(4, '0');
      continue;
    }
    result += ch;
  }
  return result;
}

function parseJSON(raw) {
  const cleaned = sanitizeJsonStr(raw);
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Last resort: aggressive strip of all control chars
    const aggressive = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');
    return JSON.parse(aggressive);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Groq API key not configured' });

  const { text, imageBase64, mimeType, mode } = req.body || {};
  if (!text && !imageBase64) return res.status(400).json({ error: 'Provide text or imageBase64' });

  const useVision = !!imageBase64;
  const visionModel = 'meta-llama/llama-4-scout-17b-16e-instruct';
  const textModel = 'llama-3.3-70b-versatile';

  function msgs(systemPrompt) {
    if (useVision) return [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        { type: 'text', text: `${systemPrompt}\n\nAnalyse the image above.` }
      ]
    }];
    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: (text || '').slice(0, 28000) }
    ];
  }

  try {
    let contentType = mode;
    let classifyData = null;

    if (!contentType || contentType === 'classify') {
      const raw = await callGroq(apiKey, msgs(CLASSIFY_PROMPT), useVision ? visionModel : textModel, 0.1);
      classifyData = parseJSON(raw);
      contentType = classifyData.type || 'course';
    }

    let result;
    const model = useVision ? visionModel : textModel;

    if (contentType === 'assignment') {
      result = parseJSON(await callGroq(apiKey, msgs(ASSIGNMENT_PROMPT), model, 0.2));
      result._type = 'assignment';
    } else if (contentType === 'ca') {
      result = parseJSON(await callGroq(apiKey, msgs(CA_PROMPT), model, 0.2));
      result._type = 'ca';
    } else if (contentType === 'resource') {
      result = { _type: 'resource', courseName: classifyData?.courseName || '', title: classifyData?.title || 'Resource' };
    } else {
      result = parseJSON(await callGroq(apiKey, msgs(COURSE_PROMPT), model, 0.3));
      result._type = 'course';
    }

    if (classifyData?.courseName && !result.courseName) result.courseName = classifyData.courseName;
    if (classifyData) result._classify = classifyData;

    return res.status(200).json(result);
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}
