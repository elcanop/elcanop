CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE order_status AS ENUM (
  'DRAFT', 'AWAITING_PAYMENT', 'PAID', 'QUEUED', 'IN_PRODUCTION',
  'QUALITY_REVIEW', 'READY_FOR_CLIENT_REVIEW', 'CORRECTION_REQUESTED',
  'IN_REVISION', 'READY_FINAL', 'DELIVERED', 'ACCESS_EXPIRED',
  'PAYMENT_FAILED', 'CANCELLED', 'REFUNDED', 'PRODUCTION_BLOCKED'
);

CREATE TYPE product_tier AS ENUM ('EXPRESS', 'SEMI_PRO');
CREATE TYPE correction_status AS ENUM ('REQUESTED', 'IN_REVIEW', 'COMPLETED', 'REJECTED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'APPROVED', 'FAILED', 'REFUNDED');
CREATE TYPE delivery_asset_kind AS ENUM ('MP3', 'WAV', 'LYRICS_PDF', 'COVER', 'STEMS_ZIP');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(32) NOT NULL UNIQUE,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  product_tier product_tier NOT NULL,
  genre VARCHAR(100) NOT NULL,
  mood VARCHAR(100) NOT NULL,
  occasion VARCHAR(100) NOT NULL,
  story_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  key_phrases TEXT[] NOT NULL DEFAULT '{}',
  rhythm_reference_path TEXT,
  vocal_reference_path TEXT,
  client_audio_notes TEXT,
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'COP',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_provider VARCHAR(50),
  payment_provider_reference VARCHAR(255),
  order_status order_status NOT NULL DEFAULT 'DRAFT',
  corrections_allowed SMALLINT NOT NULL DEFAULT 1 CHECK (corrections_allowed >= 0),
  corrections_used SMALLINT NOT NULL DEFAULT 0 CHECK (corrections_used >= 0),
  download_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  CONSTRAINT corrections_not_exceeded CHECK (corrections_used <= corrections_allowed)
);

CREATE TABLE order_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status correction_status NOT NULL DEFAULT 'REQUESTED',
  category VARCHAR(50),
  description TEXT NOT NULL,
  timestamp_hint VARCHAR(100),
  reference_path TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE delivery_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  kind delivery_asset_kind NOT NULL,
  asset_path TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  version VARCHAR(30) NOT NULL DEFAULT 'FINAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, kind, version)
);

CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  provider_event_id VARCHAR(255) NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  payload_hash VARCHAR(128) NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE(provider, provider_event_id)
);

CREATE TABLE download_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES delivery_assets(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  max_downloads INTEGER NOT NULL DEFAULT 3 CHECK (max_downloads > 0),
  downloads_used INTEGER NOT NULL DEFAULT 0 CHECK (downloads_used >= 0),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  actor_type VARCHAR(30) NOT NULL,
  actor_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  ip_hash VARCHAR(128),
  user_agent_hash VARCHAR(128),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_corrections_order ON order_corrections(order_id);
CREATE INDEX idx_delivery_assets_order ON delivery_assets(order_id);
CREATE INDEX idx_download_grants_order ON download_grants(order_id);
CREATE INDEX idx_audit_order_created ON audit_log(order_id, created_at DESC);

CREATE TABLE pricing_tiers (
  tier_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  current_price NUMERIC(12,2) NOT NULL CHECK (current_price >= 0),
  regular_price NUMERIC(12,2) NOT NULL CHECK (regular_price >= 0),
  discount_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  discount_badge VARCHAR(50),
  delivery_hours INTEGER,
  format_description VARCHAR(150),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO pricing_tiers (tier_id, name, current_price, regular_price, discount_enabled, discount_badge, delivery_hours, format_description)
VALUES
  ('EXPRESS', 'Express', 120000, 160000, true, '25% OFF', 48, 'MP3 320kbps'),
  ('SEMI_PRO', 'Semi-Pro', 280000, 350000, true, '20% OFF', 72, 'MP3 + WAV Studio (24-bit) + PDF'),
  ('STEMS_ADDON', 'Stems Multipista (ZIP)', 50000, 70000, true, 'Ahorra $20.000 COP', NULL, 'Pistas separadas en ZIP')
ON CONFLICT (tier_id) DO NOTHING;

-- RLS debe habilitarse en producción cuando Supabase sea la capa de acceso.
-- El backend privilegiado es el único componente autorizado para generar
-- grants de descarga y modificar estados operativos.
-- La ventana comercial de descarga es de 7 días desde DELIVERED.
-- STEMS se entrega como un único asset de tipo STEMS_ZIP.
