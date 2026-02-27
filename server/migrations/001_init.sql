-- Playzle Database Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  loadout JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE currencies (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0)
);

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('skin', 'clothing')),
  cost INTEGER NOT NULL CHECK (cost > 0),
  image_url TEXT,
  description TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

CREATE TABLE inventory (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE transactions (
  idempotency_key UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  item_id UUID REFERENCES items(id),
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quest_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  checkpoint_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'code_passed', 'completed')),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, checkpoint_id)
);

-- Seed default shop items
INSERT INTO items (name, type, cost, image_url, description, rarity) VALUES
  ('Warrior Knight', 'skin', 100, '/assets/skins/warrior.png', 'A seasoned battle warrior', 'common'),
  ('Shadow Rogue', 'skin', 250, '/assets/skins/rogue.png', 'Moves like a ghost in the night', 'rare'),
  ('Dragon Mage', 'skin', 500, '/assets/skins/mage.png', 'Commands ancient dragon magic', 'epic'),
  ('Cosmic Hero', 'skin', 1000, '/assets/skins/cosmic.png', 'Born among the stars', 'legendary'),
  ('Iron Armor', 'clothing', 80, '/assets/clothing/iron.png', 'Sturdy protective armor', 'common'),
  ('Elven Cloak', 'clothing', 200, '/assets/clothing/elven.png', 'Woven from moonlight silk', 'rare');
