-- Coach Abu Rakhees Database Schema
-- PostgreSQL / Neon

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    identifier VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    protein_goal NUMERIC(7, 2) NOT NULL DEFAULT 0,
    carbs_goal NUMERIC(7, 2) NOT NULL DEFAULT 0,
    fat_goal NUMERIC(7, 2) NOT NULL DEFAULT 0,
    calories_goal NUMERIC(7, 2) NOT NULL DEFAULT 0,
    current_weight NUMERIC(6, 2) NOT NULL DEFAULT 0,
    target_weight NUMERIC(6, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type VARCHAR(30) NOT NULL,
    meal_name VARCHAR(150) NOT NULL,
    protein NUMERIC(7, 2) NOT NULL DEFAULT 0,
    carbs NUMERIC(7, 2) NOT NULL DEFAULT 0,
    fat NUMERIC(7, 2) NOT NULL DEFAULT 0,
    calories NUMERIC(7, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight NUMERIC(6, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at);
CREATE INDEX IF NOT EXISTS idx_weights_user_id ON weights(user_id);
CREATE INDEX IF NOT EXISTS idx_weights_created_at ON weights(created_at);
