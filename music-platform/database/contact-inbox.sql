CREATE TYPE contact_status AS ENUM ('NEW', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED');
CREATE TYPE contact_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(320) NOT NULL,
  order_id UUID NULL,
  category VARCHAR(80) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  status contact_status NOT NULL DEFAULT 'NEW',
  priority contact_priority NOT NULL DEFAULT 'NORMAL',
  assigned_admin_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_contact_messages_status_created
  ON contact_messages(status, created_at DESC);

CREATE INDEX idx_contact_messages_email
  ON contact_messages(customer_email);

CREATE INDEX idx_contact_messages_order
  ON contact_messages(order_id);

CREATE TABLE contact_message_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_message_id UUID NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS must deny public/client reads and permit only authorized admin access.
-- Public submission must use a server-side endpoint with anti-spam/rate limiting.
