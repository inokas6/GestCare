-- Políticas de segurança para a tabela notificacoes
-- Execute este script no seu Supabase SQL Editor

-- Habilitar RLS (Row Level Security) na tabela notificacoes
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias notificações
CREATE POLICY "Usuários podem ver suas próprias notificações" ON public.notificacoes
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram suas próprias notificações
CREATE POLICY "Usuários podem inserir suas próprias notificações" ON public.notificacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias notificações
CREATE POLICY "Usuários podem atualizar suas próprias notificações" ON public.notificacoes
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários eliminem suas próprias notificações
CREATE POLICY "Usuários podem eliminar suas próprias notificações" ON public.notificacoes
    FOR DELETE USING (auth.uid() = user_id);

-- Índices adicionais para melhor performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes USING btree (tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON public.notificacoes USING btree (data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida ON public.notificacoes USING btree (user_id, lida);

-- Índice único para prevenir notificações duplicadas no mesmo dia
CREATE UNIQUE INDEX IF NOT EXISTS idx_notificacoes_user_evento_dia 
ON public.notificacoes (user_id, evento_id, DATE(data_criacao)) 
WHERE evento_id IS NOT NULL AND tipo = 'lembrete';

-- Função para limpar notificações antigas (opcional)
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas()
RETURNS void AS $$
BEGIN
    -- Eliminar notificações com mais de 30 dias
    DELETE FROM public.notificacoes 
    WHERE data_criacao < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Agendar limpeza automática (opcional - descomente se quiser)
-- SELECT cron.schedule('limpar-notificacoes', '0 2 * * *', 'SELECT limpar_notificacoes_antigas();'); 