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
    const { title, description, imageUrl, imageUrls, context } = req.body || {};

    const targetTitle = title || context || 'Unspecified Civic Complaint';
    const targetDesc = description || context || 'No description provided.';
    const finalImageUrl = imageUrl || (imageUrls && imageUrls[0]) || null;

    let geminiParts: any[] = [];
    
    const promptText = `
    You are the GrievanceMap Civic Classification AI. Analyze the citizen reported civic issue and categorize it.
    Issue Title: "${targetTitle}"
    Issue Description: "${targetDesc}"

    Rules:
    1. Categorize the issue into one of: 'roads', 'drainage', 'waste_management', 'water_supply', 'street_lighting'.
    2. Evaluate the priority / severity rating as one of: 'low', 'medium', 'high', 'critical'.
    3. Estimate your confidence index as a decimal number between 0.0 and 1.0.
    4. Suggest a clean, formal title for the grievance.
    5. Evaluate sentiment score between -1.0 (extremely negative) and 1.0 (positive/neutral).
    6. Estimate an urgency score between 0 and 100.
    7. Provide a high-end summary, a suggested department name, and a list of tags/keywords.

    You MUST return output strictly as a JSON object, with no markdown code blocks, containing:
    {
      "suggestedCategory": "roads|drainage|waste_management|water_supply|street_lighting",
      "suggestedPriority": "low|medium|high|critical",
      "confidence": 0.95,
      "suggestedTitle": "Title here",
      "sentimentScore": 0.1,
      "urgencyScore": 75,
      "suggestedDepartment": "Department Name Here",
      "summary": "Summary here",
      "keywords": ["keyword1", "keyword2"],
      "detectedIssues": ["issue1", "issue2"],
      "severityEstimate": "low|medium|high|critical",
      "description": "Visual or textual breakdown of the incident"
    }
    `;

    geminiParts.push({ text: promptText });

    if (finalImageUrl) {
      try {
        const imageRes = await fetch(finalImageUrl);
        if (imageRes.ok) {
          const buffer = await imageRes.arrayBuffer();
          const base64Data = Buffer.from(buffer).toString('base64');
          const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
          geminiParts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
      } catch (err) {
        console.error('Failed to fetch image from URL, falling back to text-only analysis:', err);
      }
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: geminiParts }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return res.status(geminiRes.status).json({ error: `Gemini API returned error: ${errorText}` });
    }

    const data = await geminiRes.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse the output string safely
    const cleanJson = JSON.parse(outputText.trim());
    return res.status(200).json(cleanJson);
  } catch (error: any) {
    console.error('Error classifying issue:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during classification.' });
  }
}
