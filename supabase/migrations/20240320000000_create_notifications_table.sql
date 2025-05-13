-- Criar a tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    lida BOOLEAN DEFAULT false,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_evento TIMESTAMPTZ,
    evento_id UUID REFERENCES calendario(id) ON DELETE CASCADE
);

-- Criar índices para melhorar a performance
CREATE INDEX idx_notificacoes_user ON notificacoes(user_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);

-- Habilitar RLS
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Política para notificações
CREATE POLICY "Usuários podem ver apenas suas próprias notificações"
    ON notificacoes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Função para criar notificações de eventos
CREATE OR REPLACE FUNCTION criar_notificacao_evento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lembrete = true THEN
        INSERT INTO notificacoes (
            user_id,
            titulo,
            mensagem,
            tipo,
            data_evento,
            evento_id
        ) VALUES (
            NEW.user_id,
            NEW.titulo,
            CASE 
                WHEN NEW.lembrete_antecedencia = 0 THEN 'Evento hoje: ' || NEW.titulo
                WHEN NEW.lembrete_antecedencia = 1 THEN 'Evento amanhã: ' || NEW.titulo
                WHEN NEW.lembrete_antecedencia = 2 THEN 'Evento em 2 dias: ' || NEW.titulo
                WHEN NEW.lembrete_antecedencia = 3 THEN 'Evento em 3 dias: ' || NEW.titulo
                WHEN NEW.lembrete_antecedencia = 7 THEN 'Evento em 1 semana: ' || NEW.titulo
            END,
            'evento',
            NEW.inicio_data,
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificações quando um evento é criado
CREATE TRIGGER criar_notificacao_evento_trigger
    AFTER INSERT ON calendario
    FOR EACH ROW
    EXECUTE FUNCTION criar_notificacao_evento(); 