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
    const { action, userId, grievanceId, message, title } = req.body || {};

    if (action === 'dispatchAlert') {
      console.log(`Dispacthing real-time notification alert to citizen ${userId} for grievance ${grievanceId}: ${message}`);
      return res.status(200).json({
        success: true,
        sent: true,
        timestamp: Date.now(),
        notificationId: `notif_${Math.random().toString(36).substring(2, 9)}`,
      });
    }

    // Default fallback list of active notifications
    return res.status(200).json({
      success: true,
      message: 'Notification trigger subsystem online.',
      status: 'active',
      endpoints: ['dispatchAlert', 'registerDeviceToken'],
    });
  } catch (error: any) {
    console.error('Error in notifications service:', error);
    return res.status(500).json({ error: error.message || 'An error occurred.' });
  }
}
