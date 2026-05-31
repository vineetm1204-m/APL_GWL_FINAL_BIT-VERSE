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
    const { action, wardId, period, grievanceIds, title, description, imageUrls } = req.body || {};

    let systemPrompt = '';
    let responseFormat: 'json' | 'text' = 'json';

    if (action === 'generateCityInsights') {
      systemPrompt = `
      You are the GrievanceMap Smart City Analytics engine. Review the city metrics for Gwalior Municipal Corporation (GMC) for the ward: "${wardId || 'all_wards'}" and period: "${period || '30_days'}".
      Detect and predict any infrastructure deterioration, active complaint spikes, resolution anomalies, and make recommendations.
      
      Return your output strictly as a JSON object of schema:
      {
        "insights": [
          {
            "type": "trend|anomaly|prediction|recommendation",
            "title": "Insight Title",
            "description": "Insight description outlining cause and suggested action",
            "severity": "info|warning|critical",
            "relatedWardIds": ["ward_04"],
            "relatedCategoryIds": ["water_supply"],
            "confidence": 0.88
          }
        ]
      }
      `;
    } else if (action === 'summarizeGrievanceBatch') {
      systemPrompt = `
      Review the list of complaint IDs: [${(grievanceIds || []).join(', ')}] reported in Gwalior.
      Summarize the common underlying infrastructure failure patterns, structural risks, and suggest direct corrective actions.
      
      Return your output strictly as a JSON object of schema:
      {
        "summary": "High-level aggregate summary of critical matters.",
        "commonThemes": ["theme 1", "theme 2"],
        "actionItems": ["action item 1", "action item 2"]
      }
      `;
    } else if (action === 'classifyUrgency') {
      systemPrompt = `
      Evaluate the absolute urgency level of the following incident:
      Title: "${title || 'Unspecified Incident'}"
      Description: "${description || 'No description'}"
      Associated Media Attachments: ${imageUrls ? imageUrls.length : 0} images.

      Provide rating metrics.
      Return your output strictly as a JSON object of schema:
      {
        "urgencyLevel": "low|medium|high|critical",
        "urgencyScore": 82,
        "reasoning": "Reasoning detailing safety risk, infrastructure impact, or public inconvenience."
      }
      `;
    } else {
      // Default fallback
      systemPrompt = `
      Answer standard smart-city analytics query for Gwalior Municipal Corp.
      Request payload: ${JSON.stringify(req.body)}
      `;
      responseFormat = 'text';
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload: any = {
      contents: [{ parts: [{ text: systemPrompt }] }],
    };

    if (responseFormat === 'json') {
      payload.generationConfig = {
        responseMimeType: 'application/json',
      };
    }

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return res.status(geminiRes.status).json({ error: `Gemini API returned error: ${errorText}` });
    }

    const data = await geminiRes.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    if (responseFormat === 'json') {
      return res.status(200).json(JSON.parse(answer.trim()));
    } else {
      return res.status(200).json({ answer });
    }
  } catch (error: any) {
    console.error('Error in AI Query:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during AI query.' });
  }
}
