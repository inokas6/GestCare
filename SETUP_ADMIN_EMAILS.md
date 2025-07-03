# Configuração da Gestão de Emails Autorizados para Admin

## ✅ Funcionalidade Implementada

A funcionalidade para gerenciar emails autorizados para acesso administrativo foi implementada com sucesso! Agora você pode:

1. **Ver todos os utilizadores registrados** na seção de configurações
2. **Adicionar emails à lista de autorização** clicando em "Autorizar" ao lado de qualquer utilizador
3. **Remover emails da lista de autorização** clicando em "Remover" na seção de emails autorizados
4. **Visualizar o status de autorização** de cada utilizador (Autorizado/Não autorizado)

## 🔧 Configuração Necessária

### 1. Executar Migração no Supabase

Execute o script `migrations/create_admin_authorized_emails_table.sql` no seu Supabase SQL Editor:

```sql
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
        EXISTS (
            SELECT 1 FROM admin_authorized_emails 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Política para permitir que apenas admins adicionem emails autorizados
CREATE POLICY "Admins can insert authorized emails" ON admin_authorized_emails
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_authorized_emails 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Política para permitir que apenas admins atualizem emails autorizados
CREATE POLICY "Admins can update authorized emails" ON admin_authorized_emails
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_authorized_emails 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Política para permitir que apenas admins removam emails autorizados
CREATE POLICY "Admins can delete authorized emails" ON admin_authorized_emails
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_authorized_emails 
            WHERE email = auth.jwt() ->> 'email'
        )
    );
```

## 🎯 Como Usar

### 1. Aceder à Gestão de Emails Autorizados

1. Faça login na área administrativa com um email já autorizado
2. Vá para **Configurações** no menu lateral
3. Role para baixo até a seção **"Gestão de Emails Autorizados"**

### 2. Adicionar um Email à Lista de Autorização

1. Na seção **"Utilizadores Registrados"**, procure o utilizador que deseja autorizar
2. Clique no botão **"Autorizar"** ao lado do email do utilizador
3. O email será adicionado à lista de autorização e o utilizador poderá fazer login na área administrativa

### 3. Remover um Email da Lista de Autorização

1. Na seção **"Emails Atualmente Autorizados"**, procure o email que deseja remover
2. Clique no botão **"Remover"** ao lado do email
3. O email será removido da lista de autorização

## 🔒 Segurança

- **Apenas administradores** podem gerenciar a lista de emails autorizados
- **Soft delete**: Os emails removidos são marcados como inativos, não são eliminados permanentemente
- **Auditoria**: Cada email autorizado registra quem o adicionou e quando
- **Fallback**: Se houver erro ao carregar a lista, o sistema usa o email padrão como fallback

## 📁 Arquivos Modificados

- `app/admin/configuracoes/page.js` - Interface para gerenciar emails autorizados
- `app/api/admin/authorized-emails/route.js` - API para gerenciar emails autorizados
- `app/admin/login/page.js` - Busca emails autorizados do banco de dados
- `app/admin/page.js` - Busca emails autorizados do banco de dados
- `app/admin/home/page.js` - Busca emails autorizados do banco de dados
- `migrations/create_admin_authorized_emails_table.sql` - Migração da tabela

## 🚀 Próximos Passos

1. Execute a migração no Supabase SQL Editor
2. Teste a funcionalidade fazendo login na área administrativa
3. Adicione novos emails à lista de autorização conforme necessário

A funcionalidade está pronta para uso! 🎉 