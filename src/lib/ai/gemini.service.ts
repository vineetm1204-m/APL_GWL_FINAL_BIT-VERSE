/**
 * AI Service Layer — Gemini Proxy Integration
 * --------------------------------------------
 * Connects to Gemini model parameters through Vercel Serverless Functions.
 * Replaces direct Firebase callable functions to guarantee robust server-side security.
 *
 * Features:
 * - Text analysis (categorization, priority, sentiment)
 * - Image analysis (Gemini Vision for damage assessment)
 * - Trend prediction and anomaly detection
 * - Natural language summarization
 */

// ─── Response Types (Preserved) ──────────────────────────────────────

interface AITextAnalysisResponse {
  suggestedCategory: string;
  suggestedPriority: string;
  sentimentScore: number;
  urgencyScore: number;
  suggestedDepartment: string | null;
  summary: string;
  keywords: string[];
}

interface AIImageAnalysisResponse {
  description: string;
  detectedIssues: string[];
  severityEstimate: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

interface AIInsightsResponse {
  insights: Array<{
    type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    relatedWardIds: string[];
    relatedCategoryIds: string[];
    confidence: number;
  }>;
}

interface AISummaryResponse {
  summary: string;
  commonThemes: string[];
  actionItems: string[];
}

interface AIUrgencyResponse {
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  urgencyScore: number;
  reasoning: string;
}

// Helper to make API post requests
async function callServerlessApi<T>(path: string, body: any): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Serverless function error at ${path}: ${errText}`);
  }

  return response.json() as Promise<T>;
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Analyze grievance text using Gemini via Vercel proxy
 */
export async function analyzeText(
  title: string,
  description: string
): Promise<AITextAnalysisResponse> {
  return callServerlessApi<AITextAnalysisResponse>('/api/classify-issue', {
    title,
    description,
  });
}

/**
 * Analyze grievance image using Gemini via Vercel proxy
 */
export async function analyzeImage(
  imageUrl: string,
  context?: string
): Promise<AIImageAnalysisResponse> {
  return callServerlessApi<AIImageAnalysisResponse>('/api/classify-issue', {
    imageUrl,
    context,
  });
}

/**
 * Generate city-wide or ward-specific AI insights via Vercel proxy
 */
export async function getInsights(
  wardId?: string,
  period?: string
): Promise<AIInsightsResponse> {
  return callServerlessApi<AIInsightsResponse>('/api/ai-query', {
    action: 'generateCityInsights',
    wardId,
    period,
  });
}

/**
 * Get a summary of multiple grievances via Vercel proxy
 */
export async function summarizeBatch(
  grievanceIds: string[]
): Promise<AISummaryResponse> {
  return callServerlessApi<AISummaryResponse>('/api/ai-query', {
    action: 'summarizeGrievanceBatch',
    grievanceIds,
  });
}

/**
 * Classify urgency of a new grievance via Vercel proxy
 */
export async function getUrgencyClassification(
  title: string,
  description: string,
  imageUrls?: string[]
): Promise<AIUrgencyResponse> {
  return callServerlessApi<AIUrgencyResponse>('/api/ai-query', {
    action: 'classifyUrgency',
    title,
    description,
    imageUrls,
  });
}

/**
 * Full AI analysis pipeline for a new grievance
 * Combines text analysis, image analysis, and urgency classification
 */
export async function fullGrievanceAnalysis(
  title: string,
  description: string,
  imageUrls: string[] = []
): Promise<{
  textAnalysis: AITextAnalysisResponse;
  imageAnalyses: AIImageAnalysisResponse[];
  urgency: AIUrgencyResponse;
}> {
  const [textAnalysis, urgency, ...imageAnalyses] = await Promise.all([
    analyzeText(title, description),
    getUrgencyClassification(title, description, imageUrls),
    ...imageUrls.map((url) =>
      analyzeImage(url, `${title}: ${description}`)
    ),
  ]);

  return {
    textAnalysis,
    imageAnalyses,
    urgency,
  };
}
