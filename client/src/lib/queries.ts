/**
 * Database query helpers for common operations
 */

import { query } from './db';

// ============ CLIENTS ============

export async function getClientsByUser(userId: string) {
  const result = await query(
    `SELECT c.*, json_agg(json_build_object('id', s.id, 'name', s.name, 'email', s.email, 'phone', s.phone)) 
            FILTER (WHERE s.id IS NOT NULL) as spocs,
            json_agg(json_build_object('id', p.id, 'status', p.status, 'amount', p.amount)) 
            FILTER (WHERE p.id IS NOT NULL) as proposals
     FROM client c
     LEFT JOIN "clientSpoc" s ON c.id = s."clientId"
     LEFT JOIN proposal p ON c.id = p."clientId"
     WHERE c."createdBy" = $1
     GROUP BY c.id
     ORDER BY c."createdAt" DESC`,
    [userId]
  );
  return result.rows;
}

export async function getClientById(clientId: string, userId: string) {
  const result = await query(
    `SELECT c.*, json_agg(json_build_object('id', s.id, 'name', s.name, 'email', s.email, 'phone', s.phone)) 
            FILTER (WHERE s.id IS NOT NULL) as spocs,
            json_agg(json_build_object('id', p.id, 'status', p.status)) 
            FILTER (WHERE p.id IS NOT NULL) as proposals,
            json_agg(json_build_object('id', a.id, 'status', a.status)) 
            FILTER (WHERE a.id IS NOT NULL) as assignments
     FROM client c
     LEFT JOIN "clientSpoc" s ON c.id = s."clientId"
     LEFT JOIN proposal p ON c.id = p."clientId"
     LEFT JOIN assignment a ON c.id = a."clientId"
     WHERE c.id = $1 AND c."createdBy" = $2
     GROUP BY c.id`,
    [clientId, userId]
  );
  return result.rows[0] || null;
}

// ============ PROPOSALS ============

export async function getProposalsByUser(userId: string) {
  const result = await query(
    `SELECT p.*, json_build_object('id', c.id, 'name', c.name) as client,
            json_agg(json_build_object('id', a.id, 'status', a.status)) 
            FILTER (WHERE a.id IS NOT NULL) as assignments
     FROM proposal p
     LEFT JOIN client c ON p."clientId" = c.id
     LEFT JOIN assignment a ON p.id = a."proposalId"
     WHERE p."createdBy" = $1
     GROUP BY p.id, c.id
     ORDER BY p."createdAt" DESC`,
    [userId]
  );
  return result.rows;
}

export async function getProposalById(proposalId: string, userId: string) {
  const result = await query(
    `SELECT p.*, json_build_object('id', c.id, 'name', c.name) as client,
            json_agg(json_build_object('id', a.id, 'status', a.status)) 
            FILTER (WHERE a.id IS NOT NULL) as assignments,
            json_agg(json_build_object('id', d.id, 'name', d.name, 'url', d.url)) 
            FILTER (WHERE d.id IS NOT NULL) as documents
     FROM proposal p
     LEFT JOIN client c ON p."clientId" = c.id
     LEFT JOIN assignment a ON p.id = a."proposalId"
     LEFT JOIN document d ON p.id = d."proposalId"
     WHERE p.id = $1 AND p."createdBy" = $2
     GROUP BY p.id, c.id`,
    [proposalId, userId]
  );
  return result.rows[0] || null;
}

// ============ ASSIGNMENTS ============

export async function getAssignmentsByProposal(proposalId: string) {
  const result = await query(
    `SELECT a.*, json_agg(json_build_object('id', w.id, 'status', w.status, 'hoursWorked', w."hoursWorked")) 
            FILTER (WHERE w.id IS NOT NULL) as workProgress,
            json_agg(json_build_object('id', d.id, 'name', d.name, 'url', d.url)) 
            FILTER (WHERE d.id IS NOT NULL) as documents
     FROM assignment a
     LEFT JOIN "workProgress" w ON a.id = w."assignmentId"
     LEFT JOIN document d ON a.id = d."assignmentId"
     WHERE a."proposalId" = $1
     GROUP BY a.id
     ORDER BY a."createdAt" DESC`,
    [proposalId]
  );
  return result.rows;
}

export async function getAssignmentById(assignmentId: string) {
  const result = await query(
    `SELECT a.*, json_build_object('id', p.id, 'name', p.name) as proposal,
            json_build_object('id', c.id, 'name', c.name) as client,
            json_agg(json_build_object('id', w.id, 'status', w.status)) 
            FILTER (WHERE w.id IS NOT NULL) as workProgress,
            json_agg(json_build_object('id', d.id, 'name', d.name, 'url', d.url)) 
            FILTER (WHERE d.id IS NOT NULL) as documents
     FROM assignment a
     LEFT JOIN proposal p ON a."proposalId" = p.id
     LEFT JOIN client c ON a."clientId" = c.id
     LEFT JOIN "workProgress" w ON a.id = w."assignmentId"
     LEFT JOIN document d ON a.id = d."assignmentId"
     WHERE a.id = $1
     GROUP BY a.id, p.id, c.id`,
    [assignmentId]
  );
  return result.rows[0] || null;
}

// ============ WORK PROGRESS ============

export async function getWorkProgressByUser(userId: string) {
  const result = await query(
    `SELECT w.*, json_build_object('id', a.id, 'name', a.name) as assignment
     FROM "workProgress" w
     LEFT JOIN assignment a ON w."assignmentId" = a.id
     WHERE w."submittedBy" = $1
     ORDER BY w."recordedAt" DESC`,
    [userId]
  );
  return result.rows;
}

export async function getWorkProgressByAssignment(assignmentId: string) {
  const result = await query(
    `SELECT w.*, json_build_object('id', u.id, 'name', u.name) as user
     FROM "workProgress" w
     LEFT JOIN "user" u ON w."submittedBy" = u.id
     WHERE w."assignmentId" = $1
     ORDER BY w."recordedAt" DESC`,
    [assignmentId]
  );
  return result.rows;
}

// ============ INVOICES ============

export async function getInvoices(filters?: { status?: string }) {
  let sqlQuery = `SELECT i.*, json_agg(json_build_object('id', l.id, 'description', l.description, 'amount', l.amount)) 
                  FILTER (WHERE l.id IS NOT NULL) as lineItems
                  FROM invoice i
                  LEFT JOIN "lineItem" l ON i.id = l."invoiceId"`;
  const params: unknown[] = [];

  if (filters?.status) {
    params.push(filters.status);
    sqlQuery += ` WHERE i.status = $${params.length}`;
  }

  sqlQuery += ` GROUP BY i.id ORDER BY i."issuedDate" DESC`;

  const result = await query(sqlQuery, params);
  return result.rows;
}

export async function getInvoiceById(invoiceId: string) {
  const result = await query(
    `SELECT i.*, json_agg(json_build_object('id', l.id, 'description', l.description, 'amount', l.amount)) 
            FILTER (WHERE l.id IS NOT NULL) as lineItems,
            json_agg(json_build_object('id', d.id, 'name', d.name, 'url', d.url)) 
            FILTER (WHERE d.id IS NOT NULL) as documents
     FROM invoice i
     LEFT JOIN "lineItem" l ON i.id = l."invoiceId"
     LEFT JOIN document d ON i.id = d."invoiceId"
     WHERE i.id = $1
     GROUP BY i.id`,
    [invoiceId]
  );
  return result.rows[0] || null;
}

// ============ DOCUMENTS ============

export async function getDocumentsByProposal(proposalId: string) {
  const result = await query(
    `SELECT * FROM document
     WHERE "proposalId" = $1
     ORDER BY "createdAt" DESC`,
    [proposalId]
  );
  return result.rows;
}

export async function getDocumentsByAssignment(assignmentId: string) {
  const result = await query(
    `SELECT * FROM document
     WHERE "assignmentId" = $1
     ORDER BY "createdAt" DESC`,
    [assignmentId]
  );
  return result.rows;
}
