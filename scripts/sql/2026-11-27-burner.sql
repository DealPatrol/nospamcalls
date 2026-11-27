-- NoSpamCalls iOS "Pro + Burner" tier: one Twilio number per active subscription.
-- Additive only. Safe to run more than once.
CREATE TABLE IF NOT EXISTS burner_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  install_id text NOT NULL,
  token_hash text NOT NULL,
  original_transaction_id text NOT NULL,
  subscription_product_id text NOT NULL,
  twilio_sid text UNIQUE,
  phone_number text NOT NULL,
  area_code text,
  forward_to_number text,
  screening_mode text NOT NULL DEFAULT 'forward' CHECK (screening_mode IN ('forward', 'voicemail')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released')),
  monthly_minutes_used integer NOT NULL DEFAULT 0,
  usage_month text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  released_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS burner_numbers_one_active_per_install ON burner_numbers (install_id) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS burner_numbers_one_active_per_subscription ON burner_numbers (original_transaction_id) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS burner_numbers_active_phone ON burner_numbers (phone_number) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS burner_numbers_expires ON burner_numbers (expires_at) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS burner_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  burner_id uuid NOT NULL REFERENCES burner_numbers(id) ON DELETE CASCADE,
  twilio_sid text UNIQUE,
  from_number text NOT NULL,
  body text NOT NULL DEFAULT '',
  num_media integer NOT NULL DEFAULT 0,
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS burner_messages_by_burner ON burner_messages (burner_id, received_at DESC);

CREATE TABLE IF NOT EXISTS burner_voicemails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  burner_id uuid NOT NULL REFERENCES burner_numbers(id) ON DELETE CASCADE,
  recording_sid text UNIQUE,
  recording_url text,
  caller text,
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS burner_voicemails_by_burner ON burner_voicemails (burner_id, created_at DESC);
