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

  try {
    const { grievanceId, action, reason } = req.body || {};

    if (action === 'triggerEscalation') {
      console.log(`SLA SLA Breach Detected! Triggering automated escalation routing for Grievance: ${grievanceId}. Reason: ${reason || 'SLA timer expired'}`);
      return res.status(200).json({
        success: true,
        escalated: true,
        grievanceId,
        newPriority: 'critical',
        assignedDept: 'Chief Municipal Engineer Command Cell',
        timestamp: Date.now(),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Escalation analysis dashboard running.',
      status: 'nominal',
      totalActiveBreaches: 2,
    });
  } catch (error: any) {
    console.error('Error in escalation dispatcher:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during escalation dispatch.' });
  }
}
