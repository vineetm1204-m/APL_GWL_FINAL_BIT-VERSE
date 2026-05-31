/**
 * Grievance Types
 * ----------------
 * Core domain types for the grievance system.
 */

import type { Timestamp, GeoPoint } from 'firebase/firestore';
import type { GrievanceStatus, Priority } from '../config/constants';

// ─── Grievance Document ──────────────────────────────────────────────

export interface Grievance {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string | null;
  status: GrievanceStatus;
  priority: Priority;

  // Location
  location: GrievanceLocation;

  // Relationships
  wardId: string;
  reportedBy: string; // userId
  assignedTo: string | null; // userId of officer
  departmentId: string | null;

  // Media
  images: string[]; // Storage URLs
  documents: string[]; // Storage URLs

  // AI Analysis
  aiAnalysis: AIAnalysis | null;

  // Tracking
  upvotes: number;
  upvotedBy: string[]; // userIds
  viewCount: number;
  isAnonymous: boolean;
  isFlagged: boolean;

  // Resolution
  resolution: GrievanceResolution | null;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt: Timestamp | null;
  slaDeadline: Timestamp | null;
}

// ─── Grievance Location ──────────────────────────────────────────────

export interface GrievanceLocation {
  coordinates: GeoPoint;
  address: string;
  landmark: string | null;
  pincode: string | null;
}

// ─── AI Analysis (Gemini-powered) ────────────────────────────────────

export interface AIAnalysis {
  suggestedCategory: string;
  suggestedPriority: Priority;
  sentimentScore: number; // -1 to 1
  urgencyScore: number; // 0 to 100
  suggestedDepartment: string | null;
  summary: string;
  keywords: string[];
  imageAnalysis: ImageAnalysis | null;
  analyzedAt: Timestamp;
}

export interface ImageAnalysis {
  description: string;
  detectedIssues: string[];
  severityEstimate: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

// ─── Grievance Resolution ────────────────────────────────────────────

export interface GrievanceResolution {
  resolvedBy: string; // userId
  resolutionNote: string;
  resolutionImages: string[];
  satisfactionRating: number | null; // 1-5 from citizen
  citizenFeedback: string | null;
  resolvedAt: Timestamp;
}

// ─── Grievance Comment ───────────────────────────────────────────────

export interface GrievanceComment {
  id: string;
  grievanceId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  isInternal: boolean; // Only visible to officers/admins
  attachments: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Grievance Timeline Entry ────────────────────────────────────────

export interface GrievanceTimelineEntry {
  id: string;
  grievanceId: string;
  action: TimelineAction;
  actorId: string;
  actorName: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Timestamp;
}

export type TimelineAction =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'reassigned'
  | 'commented'
  | 'priority_changed'
  | 'escalated'
  | 'resolved'
  | 'reopened'
  | 'closed'
  | 'ai_analyzed';

// ─── Grievance Submission Form ───────────────────────────────────────

export interface GrievanceSubmission {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    landmark?: string;
    pincode?: string;
  };
  images?: File[];
  documents?: File[];
  isAnonymous: boolean;
}

// ─── Grievance Filters ───────────────────────────────────────────────

export interface GrievanceFilters {
  status?: GrievanceStatus[];
  priority?: Priority[];
  categoryId?: string;
  wardId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  assignedTo?: string;
  reportedBy?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'upvotes';
  sortOrder?: 'asc' | 'desc';
}
