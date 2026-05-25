import { z } from 'zod';

// ── Password validation schema ──
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/\d/, 'Must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character (!@#$%^&*)');

// ── Login validation ──
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or username is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── Registration validation ──
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z
    .string()
    .email('Valid email is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Change password validation ──
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ── Resident registration validation ──
export const residentRegistrationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+\-\s()]+$/.test(val), 'Invalid phone number format'),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, 'Invalid email format'),
  kebele: z
    .string()
    .min(1, 'Kebele is required'),
  houseNo: z
    .string()
    .optional(),
});

export type ResidentRegistrationInput = z.infer<typeof residentRegistrationSchema>;

// ── Certificate request validation ──
export const certificateRequestSchema = z.object({
  type: z
    .enum(['birth', 'death', 'marriage', 'divorce'])
    .nullable()
    .refine((val) => val !== null, 'Certificate type is required'),
  description: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 500, 'Description must not exceed 500 characters'),
});

export type CertificateRequestInput = z.infer<typeof certificateRequestSchema>;

// ── Helper function to get password requirements ──
export const getPasswordRequirements = () => [
  'Minimum 8 characters',
  'At least 1 uppercase letter (A-Z)',
  'At least 1 lowercase letter (a-z)',
  'At least 1 number (0-9)',
  'At least 1 special character (!@#$%^&*)',
];
