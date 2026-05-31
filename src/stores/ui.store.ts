/**
 * UI Store (Zustand)
 * -------------------
 * Manages global UI state: theme, sidebar, modals, toasts, and breadcrumbs.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Theme, ModalState, ToastMessage, BreadcrumbItem } from '../types/common.types';

// ─── State Interface ─────────────────────────────────────────────────

interface UIStoreState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // Modal
  modal: ModalState;
  openModal: (type: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;

  // Page Loading
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;

  // Mobile
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

// ─── Store ───────────────────────────────────────────────────────────

export const useUIStore = create<UIStoreState>()(
  devtools(
    persist(
      (set) => ({
        // Theme
        theme: 'dark',
        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),

        // Sidebar
        isSidebarOpen: true,
        isSidebarCollapsed: false,
        toggleSidebar: () =>
          set(
            (state) => ({ isSidebarOpen: !state.isSidebarOpen }),
            false,
            'ui/toggleSidebar'
          ),
        setSidebarOpen: (isSidebarOpen) =>
          set({ isSidebarOpen }, false, 'ui/setSidebarOpen'),
        setSidebarCollapsed: (isSidebarCollapsed) =>
          set({ isSidebarCollapsed }, false, 'ui/setSidebarCollapsed'),

        // Command Palette
        isCommandPaletteOpen: false,
        toggleCommandPalette: () =>
          set(
            (state) => ({
              isCommandPaletteOpen: !state.isCommandPaletteOpen,
            }),
            false,
            'ui/toggleCommandPalette'
          ),
        setCommandPaletteOpen: (isCommandPaletteOpen) =>
          set({ isCommandPaletteOpen }, false, 'ui/setCommandPaletteOpen'),

        // Modal
        modal: { isOpen: false, type: null, data: null },
        openModal: (type, data = {}) =>
          set(
            { modal: { isOpen: true, type, data } },
            false,
            'ui/openModal'
          ),
        closeModal: () =>
          set(
            { modal: { isOpen: false, type: null, data: null } },
            false,
            'ui/closeModal'
          ),

        // Toasts
        toasts: [],
        addToast: (toast) =>
          set(
            (state) => ({
              toasts: [
                ...state.toasts,
                { ...toast, id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}` },
              ],
            }),
            false,
            'ui/addToast'
          ),
        removeToast: (id) =>
          set(
            (state) => ({
              toasts: state.toasts.filter((t) => t.id !== id),
            }),
            false,
            'ui/removeToast'
          ),
        clearToasts: () => set({ toasts: [] }, false, 'ui/clearToasts'),

        // Breadcrumbs
        breadcrumbs: [],
        setBreadcrumbs: (breadcrumbs) =>
          set({ breadcrumbs }, false, 'ui/setBreadcrumbs'),

        // Page Loading
        isPageLoading: false,
        setPageLoading: (isPageLoading) =>
          set({ isPageLoading }, false, 'ui/setPageLoading'),

        // Mobile
        isMobileMenuOpen: false,
        setMobileMenuOpen: (isMobileMenuOpen) =>
          set({ isMobileMenuOpen }, false, 'ui/setMobileMenuOpen'),
      }),
      {
        name: 'grievancemap-ui',
        partialize: (state) => ({
          theme: state.theme,
          isSidebarCollapsed: state.isSidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);
