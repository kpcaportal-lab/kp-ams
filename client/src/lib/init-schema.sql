-- Create users table
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clerkId" TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER', 'CLIENT')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_clerkid ON "user"("clerkId");
CREATE INDEX idx_user_email ON "user"(email);

-- Create clients table
CREATE TABLE IF NOT EXISTS client (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  "zipCode" TEXT,
  country TEXT,
  industry TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  "createdBy" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_client_createdby ON client("createdBy");
CREATE INDEX idx_client_email ON client(email);
CREATE INDEX idx_client_name ON client(name);

-- Create client spocs table
CREATE TABLE IF NOT EXISTS "clientSpoc" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  "clientId" UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientspoc_clientid ON "clientSpoc"("clientId");

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  "clientId" UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  "createdBy" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
  "validUntil" TIMESTAMP,
  "totalAmount" FLOAT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proposal_clientid ON proposal("clientId");
CREATE INDEX idx_proposal_createdby ON proposal("createdBy");
CREATE INDEX idx_proposal_status ON proposal(status);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "proposalId" UUID NOT NULL REFERENCES proposal(id) ON DELETE CASCADE,
  "assignedTo" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  "startDate" TIMESTAMP,
  "dueDate" TIMESTAMP,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignment_proposalid ON assignment("proposalId");
CREATE INDEX idx_assignment_assignedto ON assignment("assignedTo");
CREATE INDEX idx_assignment_status ON assignment(status);

-- Create work progress table
CREATE TABLE IF NOT EXISTS "workProgress" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "assignmentId" UUID NOT NULL REFERENCES assignment(id) ON DELETE CASCADE,
  "hoursWorked" FLOAT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'APPROVED', 'REJECTED')),
  "submittedBy" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "submittedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" UUID REFERENCES "user"(id) ON DELETE SET NULL,
  "approvedDate" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workprogress_assignmentid ON "workProgress"("assignmentId");
CREATE INDEX idx_workprogress_submittedby ON "workProgress"("submittedBy");
CREATE INDEX idx_workprogress_status ON "workProgress"(status);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoiceNumber" TEXT UNIQUE NOT NULL,
  "proposalId" UUID REFERENCES proposal(id) ON DELETE SET NULL,
  "clientId" UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  "issueDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "dueDate" TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')),
  subtotal FLOAT DEFAULT 0,
  tax FLOAT DEFAULT 0,
  total FLOAT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  "createdBy" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_clientid ON invoice("clientId");
CREATE INDEX idx_invoice_proposalid ON invoice("proposalId");
CREATE INDEX idx_invoice_status ON invoice(status);

-- Create line items table
CREATE TABLE IF NOT EXISTS "lineItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoiceId" UUID NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity FLOAT NOT NULL,
  "unitPrice" FLOAT NOT NULL,
  total FLOAT NOT NULL
);

CREATE INDEX idx_lineitem_invoiceid ON "lineItem"("invoiceId");

-- Create documents table
CREATE TABLE IF NOT EXISTS document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "proposalId" UUID NOT NULL REFERENCES proposal(id) ON DELETE CASCADE,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileSize" INT,
  "mimeType" TEXT,
  "uploadedBy" UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "uploadedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_proposalid ON document("proposalId");
CREATE INDEX idx_document_uploadedby ON document("uploadedBy");
