-- Criar tabela para emails autorizados para acesso administrativo
CREATE TABLE IF NOT EXISTS admin_authorized_emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_admin_authorized_emails_email ON admin_authorized_emails(email);
CREATE INDEX IF NOT EXISTS idx_admin_authorized_emails_active ON admin_authorized_emails(is_active);

-- Inserir email padrão autorizado
INSERT INTO admin_authorized_emails (email) 
VALUES ('ineslaramiranda6@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE admin_authorized_emails ENABLE ROW LEVEL SECURITY;

-- Política para permitir que apenas admins vejam os emails autorizados
CREATE POLICY "Admins can view authorized emails" ON admin_authorized_emails
    FOR SELECT USING (
        email = auth.jwt() ->> 'email'
        OR 
        EXISTS (
            SELECT 1 FROM admin_authorized_emails 
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Política para permitir que apenas admins adicionem emails autorizados
CREATE POLICY "Admins can insert authorized emails" ON admin_authorized_emails
    FOR INSERT WITH CHECK (
        email = auth.jwt() ->> 'email'
        OR 
        EXISTS (
            SELECT 1 FROM admin_authorized_emails 
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Política para permitir que apenas admins atualizem emails autorizados
CREATE POLICY "Admins can update authorized emails" ON admin_authorized_emails
    FOR UPDATE USING (
        email = auth.jwt() ->> 'email'
        OR 
        EXISTS (
            SELECT 1 FROM admin_authorized_emails 
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Política para permitir que apenas admins removam emails autorizados
CREATE POLICY "Admins can delete authorized emails" ON admin_authorized_emails
    FOR DELETE USING (
        email = auth.jwt() ->> 'email'
        OR 
        EXISTS (
            SELECT 1 FROM admin_authorized_emails 
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    ); 