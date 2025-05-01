-- Habilitar a extensão UUID se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar enum para tipos de humor
CREATE TYPE humor_type AS ENUM (
    'feliz',
    'cansada',
    'enjoada',
    'ansiosa',
    'energética',
    'emotiva'
);

-- Criar enum para tipos de eventos
CREATE TYPE evento_type AS ENUM (
    'consulta',
    'exame',
    'ovulacao',
    'parto',
    'importante',
    'marco',
    'lembrete'
);

-- Tabela para armazenar informações básicas da gravidez
CREATE TABLE gravidez_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_ultima_menstruacao DATE NOT NULL,
    data_inicio DATE NOT NULL,
    data_provavel_parto DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar informações semanais da gestação (compartilhada entre usuários)
CREATE TABLE info_gestacional (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 42),
    desenvolvimento_bebe TEXT NOT NULL,
    sintomas_comuns TEXT,
    dicas_mae TEXT,
    cuidados_especiais TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(semana)
);

-- Tabela para armazenar os tamanhos do bebê por semana (personalizada por usuário)
CREATE TABLE tamanhos_bebe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 42),
    fruta VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, semana)
);

-- Tabela para armazenar entradas do diário
CREATE TABLE diario_entradas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    semana_gestacao INTEGER NOT NULL CHECK (semana_gestacao BETWEEN 1 AND 42),
    humor humor_type NOT NULL,
    chutes INTEGER DEFAULT 0,
    bem_estar INTEGER CHECK (bem_estar BETWEEN 1 AND 10),
    notas TEXT,
    tamanho_bebe TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar sintomas registrados nas entradas do diário
CREATE TABLE diario_sintomas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrada_id UUID REFERENCES diario_entradas(id) ON DELETE CASCADE,
    sintoma TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar eventos do calendário
CREATE TABLE calendario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    inicio_data TIMESTAMPTZ NOT NULL,
    fim_data TIMESTAMPTZ,
    tipo_evento evento_type NOT NULL,
    lembrete BOOLEAN DEFAULT false,
    lembrete_antecedencia INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar medições do bebê (ultrassom)
CREATE TABLE medicoes_bebe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_ultrassom DATE NOT NULL,
    semana_gestacao INTEGER NOT NULL CHECK (semana_gestacao BETWEEN 1 AND 42),
    medida_feto DECIMAL(5,2),
    peso_estimado DECIMAL(6,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhorar a performance
CREATE INDEX idx_gravidez_user ON gravidez_info(user_id);
CREATE INDEX idx_tamanhos_user ON tamanhos_bebe(user_id);
CREATE INDEX idx_diario_user_data ON diario_entradas(user_id, data);
CREATE INDEX idx_calendario_user_data ON calendario(user_id, inicio_data);
CREATE INDEX idx_medicoes_user ON medicoes_bebe(user_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE gravidez_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_gestacional ENABLE ROW LEVEL SECURITY;
ALTER TABLE tamanhos_bebe ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_entradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_sintomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicoes_bebe ENABLE ROW LEVEL SECURITY;

-- Política para info_gestacional (todos podem ler, apenas admin pode modificar)
CREATE POLICY "Informações semanais são públicas para leitura"
    ON info_gestacional
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para gravidez_info
CREATE POLICY "Usuários podem ver e editar apenas seus próprios dados de gravidez"
    ON gravidez_info
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para tamanhos_bebe
CREATE POLICY "Usuários podem ver e editar apenas seus próprios tamanhos"
    ON tamanhos_bebe
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para diario_entradas
CREATE POLICY "Usuários podem ver e editar apenas suas próprias entradas"
    ON diario_entradas
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para diario_sintomas
CREATE POLICY "Usuários podem ver e editar apenas seus próprios sintomas"
    ON diario_sintomas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM diario_entradas
            WHERE id = diario_sintomas.entrada_id
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM diario_entradas
            WHERE id = diario_sintomas.entrada_id
            AND user_id = auth.uid()
        )
    );

-- Política para calendario
CREATE POLICY "Usuários podem ver e editar apenas seus próprios eventos"
    ON calendario
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para medicoes_bebe
CREATE POLICY "Usuários podem ver e editar apenas suas próprias medições"
    ON medicoes_bebe
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql'; 