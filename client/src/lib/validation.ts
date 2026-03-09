/**
 * Input validation schemas for API routes
 * Prevents SQL injection, invalid data, and malicious payloads
 */

import { z } from 'zod';

// ============ Client Schemas ============
export const CreateClientSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.string().email().toLowerCase(),
  phone: z.string().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  zipCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

// ============ Proposal Schemas ============
export const CreateProposalSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  title: z.string().min(1).max(500).trim(),
  description: z.string().max(5000).optional().nullable(),
  totalAmount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  validUntil: z.date().optional().nullable(),
});

export const UpdateProposalSchema = CreateProposalSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
});

// ============ Assignment Schemas ============
export const CreateAssignmentSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
  assignedTo: z.string().uuid('Invalid user ID'),
  title: z.string().min(1).max(500).trim(),
  description: z.string().max(5000).optional().nullable(),
  startDate: z.date(),
  dueDate: z.date(),
});

export const UpdateAssignmentSchema = CreateAssignmentSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

// ============ Work Progress Schemas ============
export const CreateWorkProgressSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment ID'),
  hoursWorked: z.number().positive('Hours must be positive'),
  description: z.string().max(2000).optional().nullable(),
});

export const UpdateWorkProgressSchema = z.object({
  status: z.enum(['SUBMITTED', 'APPROVED', 'REJECTED']),
  description: z.string().max(2000).optional().nullable(),
});

// ============ Invoice Schemas ============
export const CreateInvoiceSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
  clientId: z.string().uuid('Invalid client ID'),
  issueDate: z.date(),
  dueDate: z.date(),
  subtotal: z.number().positive('Subtotal must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative'),
  currency: z.string().length(3).default('USD'),
  notes: z.string().max(2000).optional().nullable(),
  lineItems: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })),
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
});

// ============ File Upload Schema ============
export const FileUploadSchema = z.object({
  fileName: z.string().min(1).max(255).trim(),
  fileSize: z.number().positive('File size must be positive').max(50 * 1024 * 1024, 'File size must be less than 50MB'),
  fileType: z.string(),
  proposalId: z.string().uuid().optional().nullable(),
  assignmentId: z.string().uuid().optional().nullable(),
});

// ============ Helper Function ============
export async function validateAndParse<T>(schema: z.Schema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}
