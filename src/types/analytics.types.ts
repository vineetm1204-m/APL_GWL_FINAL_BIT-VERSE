/**
 * Analytics Types
 * ----------------
 * Types for the analytics and reporting system.
 * All analytics are computed from Firestore data — never hardcoded.
 */

import type { Timestamp } from 'firebase/firestore';
import type { GrievanceStatus, Priority } from '../config/constants';

// ─── Ward (Fetched from Firestore) ──────────────────────────────────

export interface Ward {
  id: string;
  name: string;
  code: string;
  boundaries: Array<{ lat: number; lng: number }>; // GeoJSON polygon
  center: { lat: number; lng: number };
  population: number | null;
  area: number | null; // sq km
  officerIds: string[];
  healthScore: number | null; // Computed from grievance data
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Category (Fetched from Firestore) ───────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Hex color
  parentId: string | null; // For subcategories
  slaHours: number; // Default SLA for this category
  departmentId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── City Analytics Snapshot ─────────────────────────────────────────

export interface CityAnalyticsSnapshot {
  id: string;
  timestamp: Timestamp;
  period: 'daily' | 'weekly' | 'monthly';

  // Totals
  totalGrievances: number;
  totalResolved: number;
  totalPending: number;
  totalInProgress: number;

  // Performance
  averageResolutionHours: number;
  slaComplianceRate: number; // percentage
  citizenSatisfactionAvg: number; // 1-5

  // Breakdown (computed, not hardcoded)
  statusBreakdown: Record<GrievanceStatus, number>;
  priorityBreakdown: Record<Priority, number>;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  wardBreakdown: Array<{
    wardId: string;
    wardName: string;
    count: number;
    healthScore: number;
  }>;

  // Trends
  dailyTrend: Array<{
    date: string; // ISO date
    submitted: number;
    resolved: number;
  }>;

  // AI Insights
  aiInsights: AIInsight[];
}

// ─── Ward Health Score ───────────────────────────────────────────────

export interface WardHealthMetrics {
  wardId: string;
  healthScore: number; // 0-100, computed
  pendingGrievances: number;
  resolvedThisMonth: number;
  avgResolutionHours: number;
  slaBreaches: number;
  topCategories: Array<{ categoryId: string; count: number }>;
  trend: 'improving' | 'stable' | 'declining';
  computedAt: Timestamp;
}

// ─── AI Insight ──────────────────────────────────────────────────────

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  relatedWardIds: string[];
  relatedCategoryIds: string[];
  confidence: number;
  generatedAt: Timestamp;
  expiresAt: Timestamp;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────

export interface DashboardStats {
  myGrievances: number;
  pendingReview: number;
  resolvedThisMonth: number;
  averageResponseTime: string; // formatted
}

export interface OfficerDashboardStats {
  assignedActive: number;
  resolvedToday: number;
  slaAtRisk: number;
  wardHealthScore: number | null;
}

export interface AdminDashboardStats {
  totalActive: number;
  resolvedThisWeek: number;
  cityHealthScore: number | null;
  activeCitizens: number;
  slaComplianceRate: number | null;
}

// ─── Notification ────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Timestamp;
}
