/**
 * Grievance Store (Zustand)
 * --------------------------
 * Manages grievance list state, active grievance, filters, and pagination.
 * All data comes from Firestore — no mock data.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Grievance, GrievanceFilters } from '../types/grievance.types';

// ─── State Interface ─────────────────────────────────────────────────

interface GrievanceStoreState {
  // List state
  grievances: Grievance[];
  isLoading: boolean;
  error: string | null;

  // Active grievance
  activeGrievance: Grievance | null;
  activeGrievanceLoading: boolean;

  // Filters & Pagination
  filters: GrievanceFilters;
  hasMore: boolean;
  lastDocCursor: unknown;
  totalCount: number | null;

  // Actions
  setGrievances: (grievances: Grievance[]) => void;
  appendGrievances: (grievances: Grievance[]) => void;
  setActiveGrievance: (grievance: Grievance | null) => void;
  updateGrievanceInList: (id: string, updates: Partial<Grievance>) => void;
  removeGrievanceFromList: (id: string) => void;
  setFilters: (filters: Partial<GrievanceFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setActiveGrievanceLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setLastDocCursor: (cursor: unknown) => void;
  setTotalCount: (count: number | null) => void;
  reset: () => void;
}

// ─── Default Filters ─────────────────────────────────────────────────

const DEFAULT_FILTERS: GrievanceFilters = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

// ─── Store ───────────────────────────────────────────────────────────

export const useGrievanceStore = create<GrievanceStoreState>()(
  devtools(
    (set) => ({
      // Initial state
      grievances: [],
      isLoading: false,
      error: null,
      activeGrievance: null,
      activeGrievanceLoading: false,
      filters: DEFAULT_FILTERS,
      hasMore: true,
      lastDocCursor: null,
      totalCount: null,

      // Actions
      setGrievances: (grievances) =>
        set({ grievances }, false, 'grievance/setGrievances'),

      appendGrievances: (newGrievances) =>
        set(
          (state) => ({
            grievances: [...state.grievances, ...newGrievances],
          }),
          false,
          'grievance/appendGrievances'
        ),

      setActiveGrievance: (activeGrievance) =>
        set({ activeGrievance }, false, 'grievance/setActiveGrievance'),

      updateGrievanceInList: (id, updates) =>
        set(
          (state) => ({
            grievances: state.grievances.map((g) =>
              g.id === id ? { ...g, ...updates } : g
            ),
            activeGrievance:
              state.activeGrievance?.id === id
                ? { ...state.activeGrievance, ...updates }
                : state.activeGrievance,
          }),
          false,
          'grievance/updateGrievanceInList'
        ),

      removeGrievanceFromList: (id) =>
        set(
          (state) => ({
            grievances: state.grievances.filter((g) => g.id !== id),
          }),
          false,
          'grievance/removeGrievanceFromList'
        ),

      setFilters: (newFilters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters },
            grievances: [], // Reset list on filter change
            lastDocCursor: null,
            hasMore: true,
          }),
          false,
          'grievance/setFilters'
        ),

      resetFilters: () =>
        set(
          {
            filters: DEFAULT_FILTERS,
            grievances: [],
            lastDocCursor: null,
            hasMore: true,
          },
          false,
          'grievance/resetFilters'
        ),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'grievance/setLoading'),

      setActiveGrievanceLoading: (activeGrievanceLoading) =>
        set({ activeGrievanceLoading }, false, 'grievance/setActiveGrievanceLoading'),

      setError: (error) =>
        set({ error }, false, 'grievance/setError'),

      setHasMore: (hasMore) =>
        set({ hasMore }, false, 'grievance/setHasMore'),

      setLastDocCursor: (lastDocCursor) =>
        set({ lastDocCursor }, false, 'grievance/setLastDocCursor'),

      setTotalCount: (totalCount) =>
        set({ totalCount }, false, 'grievance/setTotalCount'),

      reset: () =>
        set(
          {
            grievances: [],
            isLoading: false,
            error: null,
            activeGrievance: null,
            activeGrievanceLoading: false,
            filters: DEFAULT_FILTERS,
            hasMore: true,
            lastDocCursor: null,
            totalCount: null,
          },
          false,
          'grievance/reset'
        ),
    }),
    { name: 'GrievanceStore' }
  )
);
