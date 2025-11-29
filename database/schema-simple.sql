-- Nano Marketer Pro Database Schema
-- Simple version without comments for Neon Console

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  brand_vibe TEXT,
  consistency_guide TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  description TEXT NOT NULL,
  aspect_ratio VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_campaign_id ON assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_assets_phase ON assets(phase);
