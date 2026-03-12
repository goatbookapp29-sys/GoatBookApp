-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Professional Users Schema for GoatBook
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    
    -- Profile Information
    avatar_url TEXT,
    bio TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    
    -- System Information
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'employee', 'user'
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);

-- Basic Roles/Categories for Phase 1 Dashboard
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    color_code VARCHAR(10)
);

-- Seed initial categories for Dashboard
INSERT INTO categories (name, icon_name, color_code) VALUES 
('Breed', 'Ghost', '#FF5A0F'),
('Employee', 'Users', '#10B981'),
('Animal', 'Bug', '#6366F1')
ON CONFLICT (name) DO NOTHING;
