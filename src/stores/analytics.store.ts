/**
 * Analytics Store (Zustand)
 * --------------------------
 * Manages analytics data state — wards, categories, city metrics.
 * Everything fetched from Firestore, never hardcoded.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Ward, Category, CityAnalyticsSnapshot, WardHealthMetrics, AIInsight } from '../types/analytics.types';

// ─── State Interface ─────────────────────────────────────────────────

interface AnalyticsStoreState {
  // Wards (from Firestore)
  wards: Ward[];
  wardsLoading: boolean;
  wardsError: string | null;
  selectedWardId: string | null;

  // Categories (from Firestore)
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // City analytics
  citySnapshot: CityAnalyticsSnapshot | null;
  citySnapshotLoading: boolean;

  // Ward health
  wardHealthMap: Record<string, WardHealthMetrics>;
  wardHealthLoading: boolean;

  // AI Insights
  aiInsights: AIInsight[];
  aiInsightsLoading: boolean;

  // Actions
  setWards: (wards: Ward[]) => void;
  setWardsLoading: (loading: boolean) => void;
  setWardsError: (error: string | null) => void;
  setSelectedWardId: (wardId: string | null) => void;

  setCategories: (categories: Category[]) => void;
  setCategoriesLoading: (loading: boolean) => void;
  setCategoriesError: (error: string | null) => void;

  setCitySnapshot: (snapshot: CityAnalyticsSnapshot | null) => void;
  setCitySnapshotLoading: (loading: boolean) => void;

  setWardHealth: (wardId: string, metrics: WardHealthMetrics) => void;
  setWardHealthBatch: (metrics: Record<string, WardHealthMetrics>) => void;
  setWardHealthLoading: (loading: boolean) => void;

  setAIInsights: (insights: AIInsight[]) => void;
  setAIInsightsLoading: (loading: boolean) => void;

  // Selectors
  getWardById: (wardId: string) => Ward | undefined;
  getCategoryById: (categoryId: string) => Category | undefined;
  getSubcategories: (parentId: string) => Category[];
}

// ─── Store ───────────────────────────────────────────────────────────

export const useAnalyticsStore = create<AnalyticsStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      wards: [],
      wardsLoading: false,
      wardsError: null,
      selectedWardId: null,

      categories: [],
      categoriesLoading: false,
      categoriesError: null,

      citySnapshot: null,
      citySnapshotLoading: false,

      wardHealthMap: {},
      wardHealthLoading: false,

      aiInsights: [],
      aiInsightsLoading: false,

      // Ward actions
      setWards: (wards) => set({ wards }, false, 'analytics/setWards'),
      setWardsLoading: (wardsLoading) =>
        set({ wardsLoading }, false, 'analytics/setWardsLoading'),
      setWardsError: (wardsError) =>
        set({ wardsError }, false, 'analytics/setWardsError'),
      setSelectedWardId: (selectedWardId) =>
        set({ selectedWardId }, false, 'analytics/setSelectedWardId'),

      // Category actions
      setCategories: (categories) =>
        set({ categories }, false, 'analytics/setCategories'),
      setCategoriesLoading: (categoriesLoading) =>
        set({ categoriesLoading }, false, 'analytics/setCategoriesLoading'),
      setCategoriesError: (categoriesError) =>
        set({ categoriesError }, false, 'analytics/setCategoriesError'),

      // City snapshot actions
      setCitySnapshot: (citySnapshot) =>
        set({ citySnapshot }, false, 'analytics/setCitySnapshot'),
      setCitySnapshotLoading: (citySnapshotLoading) =>
        set({ citySnapshotLoading }, false, 'analytics/setCitySnapshotLoading'),

      // Ward health actions
      setWardHealth: (wardId, metrics) =>
        set(
          (state) => ({
            wardHealthMap: { ...state.wardHealthMap, [wardId]: metrics },
          }),
          false,
          'analytics/setWardHealth'
        ),
      setWardHealthBatch: (metrics) =>
        set(
          (state) => ({
            wardHealthMap: { ...state.wardHealthMap, ...metrics },
          }),
          false,
          'analytics/setWardHealthBatch'
        ),
      setWardHealthLoading: (wardHealthLoading) =>
        set({ wardHealthLoading }, false, 'analytics/setWardHealthLoading'),

      // AI Insights actions
      setAIInsights: (aiInsights) =>
        set({ aiInsights }, false, 'analytics/setAIInsights'),
      setAIInsightsLoading: (aiInsightsLoading) =>
        set({ aiInsightsLoading }, false, 'analytics/setAIInsightsLoading'),

      // Selectors
      getWardById: (wardId) => get().wards.find((w) => w.id === wardId),
      getCategoryById: (categoryId) =>
        get().categories.find((c) => c.id === categoryId),
      getSubcategories: (parentId) =>
        get().categories.filter((c) => c.parentId === parentId),
    }),
    { name: 'AnalyticsStore' }
  )
);
