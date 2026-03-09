/**
 * TypeScript type definitions for PostgreSQL database models
 * (Replaced Mongoose models when migrating to raw SQL/pg)
 */

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  createdBy: string; // User ID (FK)
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  industry?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientSpoc {
  id: string;
  clientId: string; // Client ID (FK)
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proposal {
  id: string;
  createdBy: string; // User ID (FK)
  clientId: string; // Client ID (FK)
  title: string;
  description?: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil?: Date;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  proposalId: string; // Proposal ID (FK)
  assignedTo: string; // User ID (FK)
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkProgress {
  id: string;
  assignmentId: string; // Assignment ID (FK)
  hoursWorked: number;
  description?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedBy: string; // User ID (FK)
  submittedDate: Date;
  approvedBy?: string; // User ID (FK)
  approvedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  proposalId: string; // Proposal ID (FK)
  clientId: string; // Client ID (FK)
  issueDate: Date;
  dueDate: Date;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LineItem {
  id: string;
  invoiceId: string; // Invoice ID (FK)
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  proposalId?: string; // Proposal ID (FK)
  assignmentId?: string; // Assignment ID (FK)
  filename: string;
  s3Key: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string; // User ID (FK)
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
