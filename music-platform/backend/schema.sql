-- 1. PEDIDOS (tabla principal)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  product_tier TEXT NOT NULL DEFAULT 'SEMI_PRO',
  genre TEXT,
  mood TEXT,
  occasion TEXT,
  story_details JSONB DEFAULT '{}',
  key_phrases TEXT[] DEFAULT '{}',
  client_audio_notes TEXT,
  rhythm_audio_data TEXT,
  voice_audio_data TEXT,
  current_lyrics TEXT,
  lyrics_status TEXT DEFAULT 'PENDING_PROPOSAL',
  lyrics_feedback TEXT,
  version_a_url TEXT,
  version_b_url TEXT,
  production_notes TEXT,
  total_amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'COP',
  has_stems BOOLEAN DEFAULT FALSE,
  payment_status TEXT DEFAULT 'PENDING',
  payment_provider TEXT DEFAULT 'MERCADO_PAGO',
  payment_provider_reference TEXT,
  order_status TEXT DEFAULT 'AWAITING_PAYMENT',
  corrections_allowed INTEGER DEFAULT 1,
  corrections_used INTEGER DEFAULT 0,
  delivery_assets JSONB DEFAULT '{}',
  delivered_at TIMESTAMPTZ,
  download_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MENSAJES DE CONTACTO
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT DEFAULT 'SERVICIOS',
  order_number TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'NEW',
  is_approved_review BOOLEAN DEFAULT FALSE,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REGISTRO DE AUDITORÍA
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONFIGURACIÓN DE PRECIOS
CREATE TABLE IF NOT EXISTS pricing_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  express JSONB NOT NULL,
  semi_pro JSONB NOT NULL,
  stems_addon JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CANCIONES DE MARKETING
CREATE TABLE IF NOT EXISTS marketing_songs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  tempo TEXT,
  audio_url TEXT,
  lyrics TEXT,
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de optimización
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- Limpiar tablas si ya existen (para que el script sea idempotente)
TRUNCATE TABLE pricing_config;
TRUNCATE TABLE marketing_songs;

-- Configuración Inicial Precios
INSERT INTO pricing_config (id, express, semi_pro, stems_addon) VALUES (
  'default',
  '{"name":"Express","regular_price":160000,"current_price":120000,"discount_enabled":true,"discount_badge":"25% OFF","delivery_hours":48}',
  '{"name":"Semi-Pro","regular_price":350000,"current_price":280000,"discount_enabled":true,"discount_badge":"20% OFF","delivery_hours":48}',
  '{"name":"Stems Multipista (ZIP)","regular_price":70000,"current_price":50000,"discount_enabled":true,"discount_badge":"Ahorra $20.000 COP"}'
);

-- Estilos Musicales de Marketing Iniciales
INSERT INTO marketing_songs (id, name, tagline, tempo, audio_url, lyrics, sort_order) VALUES
  ('balada', 'Balada Pop Acústica', 'Emotiva, íntima y profunda', '85 BPM', '', '', 1),
  ('pop', 'Pop Latino Moderno', 'Alegre, brillante y pegajosa', '115 BPM', '', '', 2),
  ('urbano', 'Urbano / Reggaetón Flow', 'Ritmo moderno, bajo potente y fresco', '96 BPM', '', '', 3),
  ('vallenato', 'Vallenato Romántico', 'Sentimiento puro, acordeón y tradición', '90 BPM', '', '', 4),
  ('rock', 'Rock Acústico Orgánico', 'Guitarras potentes, orgánico y auténtico', '120 BPM', '', '', 5);
