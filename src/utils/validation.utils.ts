/**
 * Validation Schemas (Zod)
 * -------------------------
 * Zod validation schemas for all forms in the application.
 */

import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^[+]?[\d\s-]{10,15}$/, 'Please enter a valid phone number')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// ─── Grievance Schemas ───────────────────────────────────────────────

export const grievanceSubmissionSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(150, 'Title must be at most 150 characters'),
  description: z
    .string()
    .min(30, 'Description must be at least 30 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  subcategoryId: z.string().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(5, 'Please provide an address'),
    landmark: z.string().optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode')
      .optional()
      .or(z.literal('')),
  }),
  isAnonymous: z.boolean().default(false),
});

// ─── Comment Schema ──────────────────────────────────────────────────

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be at most 1000 characters'),
  isInternal: z.boolean().default(false),
});

// ─── Officer Assignment Schema ───────────────────────────────────────

export const assignmentSchema = z.object({
  assignedTo: z.string().min(1, 'Please select an officer'),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  note: z.string().max(500).optional(),
});

// ─── Resolution Schema ──────────────────────────────────────────────

export const resolutionSchema = z.object({
  resolutionNote: z
    .string()
    .min(10, 'Resolution note must be at least 10 characters')
    .max(2000, 'Resolution note must be at most 2000 characters'),
});

// ─── Profile Schema ─────────────────────────────────────────────────

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-]{10,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

// ─── Ward Schema (Admin) ────────────────────────────────────────────

export const wardSchema = z.object({
  name: z.string().min(2, 'Ward name is required'),
  code: z.string().min(1, 'Ward code is required'),
  center: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

// ─── Category Schema (Admin) ────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().min(5, 'Description is required'),
  icon: z.string().min(1, 'Please select an icon'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color'),
  slaHours: z.number().min(1, 'SLA must be at least 1 hour'),
  departmentId: z.string().min(1, 'Please select a department'),
});

// ─── Type Exports ────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type GrievanceFormData = z.infer<typeof grievanceSubmissionSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type ResolutionFormData = z.infer<typeof resolutionSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type WardFormData = z.infer<typeof wardSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
