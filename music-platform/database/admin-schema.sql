CREATE TYPE admin_role AS ENUM ('OWNER', 'PRODUCER');

CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY,
  role admin_role NOT NULL DEFAULT 'PRODUCER',
  display_name VARCHAR(150) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
  session_hash VARCHAR(128) NOT NULL UNIQUE,
  device_label VARCHAR(150),
  ip_hash VARCHAR(128),
  user_agent_hash VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Identity/MFA credentials are managed by the authentication provider.
-- Application tables store authorization/profile data only.

-- All privileged actions should write to the existing audit_log table.
-- RLS policies must prevent client identities from reading or mutating these tables.
