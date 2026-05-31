import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY is not set.' });
  }

  try {
    const { question, history } = req.body || {};
    if (!question) {
      return res.status(400).json({ error: 'Missing parameter: question is required.' });
    }

    const systemPrompt = `
    You are the GrievanceMap AI Civic Assistant, an expert advisor for Gwalior Municipal Corporation (GMC).
    Answer user queries clearly, formally, and in markdown. You have deep access to city analytics, resolution metrics, officer queues, and ward health logs.

    Here is the Gwalior context:
    - Maharaj Bada: Historic center, Ward 07. High congestion. Health Score is 41/100 (Degraded due to waste management backlog).
    - Lashkar: Residential sector, Ward 01. Health Score is 92/100.
    - Phool Bagh: Major administrative zone, Ward 04. Health Score is 78/100.
    - Morar: Rapidly expanding region, Ward 12. Health Score is 89/100.
    - Worst Performing Ward currently: Ward 15 (Transport Nagar) at 62% SLA compliance.
    - Resolution Trends: Response times accelerated by 24% (down from 24h to 18m) due to automated routing.

    User Question: "${question}"
    Provide a highly informative, premium dashboard-ready response. Avoid vague statements.
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }],
          },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return res.status(geminiRes.status).json({ error: `Gemini API returned error: ${errorText}` });
    }

    const data = await geminiRes.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error('Error in AI Chat:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during chat.' });
  }
}
