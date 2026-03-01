-- รวยเด้อสาธุ - Database Schema
-- Run this in Supabase SQL Editor

-- Table: rounds (งวดหวย)
CREATE TABLE IF NOT EXISTS rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  result_6digit TEXT,
  two_tail TEXT,
  three_tail TEXT,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: bets (รายการแทง)
CREATE TABLE IF NOT EXISTS bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  number TEXT NOT NULL,
  top_amount INTEGER DEFAULT 0,
  bottom_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: payout_rates (อัตราจ่าย)
CREATE TABLE IF NOT EXISTS payout_rates (
  id INTEGER PRIMARY KEY DEFAULT 1,
  two_digit_top INTEGER DEFAULT 70,
  two_digit_bottom INTEGER DEFAULT 70,
  three_digit_top INTEGER DEFAULT 500,
  three_digit_bottom INTEGER DEFAULT 150
);

-- Insert default payout rates
INSERT INTO payout_rates (id, two_digit_top, two_digit_bottom, three_digit_top, three_digit_bottom)
VALUES (1, 70, 70, 500, 150)
ON CONFLICT (id) DO NOTHING;

-- Insert initial round
INSERT INTO rounds (label)
VALUES ('งวด 1 มีนาคม 2568')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (optional, open access)
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_rates ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - add auth later if needed)
CREATE POLICY "Allow all rounds" ON rounds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all bets" ON bets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all payout_rates" ON payout_rates FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bets_round_id ON bets(round_id);
CREATE INDEX IF NOT EXISTS idx_bets_number ON bets(number);
CREATE INDEX IF NOT EXISTS idx_rounds_is_closed ON rounds(is_closed);
