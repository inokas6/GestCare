-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    evento_id INTEGER REFERENCES calendario(id) ON DELETE CASCADE,
    tipo VARCHAR(50) DEFAULT 'lembrete',
    lida BOOLEAN DEFAULT FALSE,
    data_criacao DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON notificacoes(data_criacao);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- Adicionar RLS (Row Level Security)
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications" ON notificacoes
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem suas próprias notificações
CREATE POLICY "Users can create their own notifications" ON notificacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias notificações
CREATE POLICY "Users can update their own notifications" ON notificacoes
    FOR UPDATE USING (auth.uid() = user_id); 