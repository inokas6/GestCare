-- Script para corrigir acesso administrativo
-- Execute este script no Supabase SQL Editor

-- Verificar se a tabela admin_authorized_emails existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_authorized_emails') THEN
        -- Criar tabela se não existir
        CREATE TABLE admin_authorized_emails (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            added_by UUID REFERENCES auth.users(id),
            added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE
        );
        
        -- Criar índices
        CREATE INDEX idx_admin_authorized_emails_email ON admin_authorized_emails(email);
        CREATE INDEX idx_admin_authorized_emails_active ON admin_authorized_emails(is_active);
        
        -- Inserir email padrão
        INSERT INTO admin_authorized_emails (email) 
        VALUES ('ineslaramiranda6@gmail.com')
        ON CONFLICT (email) DO NOTHING;
        
        -- Habilitar RLS
        ALTER TABLE admin_authorized_emails ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Admins can view authorized emails" ON admin_authorized_emails;
DROP POLICY IF EXISTS "Admins can insert authorized emails" ON admin_authorized_emails;
DROP POLICY IF EXISTS "Admins can update authorized emails" ON admin_authorized_emails;
DROP POLICY IF EXISTS "Admins can delete authorized emails" ON admin_authorized_emails;

-- Criar políticas que permitem acesso direto
CREATE POLICY "Allow all operations on admin_authorized_emails" ON admin_authorized_emails
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar se a tabela users existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Criar tabela users se não existir
        CREATE TABLE users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL,
            nome VARCHAR(255),
            foto_perfil TEXT,
            banned BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_users_created_at ON users(created_at);
        CREATE INDEX idx_users_banned ON users(banned);
        
        -- Habilitar RLS
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas para users que permitem acesso direto
        CREATE POLICY "Allow all operations on users" ON users
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Garantir que o email padrão está na lista
INSERT INTO admin_authorized_emails (email) 
VALUES ('ineslaramiranda6@gmail.com')
ON CONFLICT (email) DO NOTHING; 