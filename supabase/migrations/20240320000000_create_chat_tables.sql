-- Criação da tabela de categorias se não existir
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    nome TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cor TEXT DEFAULT '#4ADE80',
    icone TEXT DEFAULT '📝',
    ordem INTEGER DEFAULT 0,
    ativa BOOLEAN DEFAULT TRUE
);

-- Inserir categoria de chat se não existir
INSERT INTO categorias (id, nome)
VALUES (1, 'Chat')
ON CONFLICT (id) DO NOTHING;

-- Criação da tabela de tópicos se não existir
CREATE TABLE IF NOT EXISTS topicos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criação da tabela de respostas se não existir
CREATE TABLE IF NOT EXISTS respostas (
    id SERIAL PRIMARY KEY,
    conteudo TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topico_id INTEGER REFERENCES topicos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criação da tabela de utilizadores se não existir
CREATE TABLE IF NOT EXISTS utilizadores (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    foto_perfil TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utilizadores_updated_at
    BEFORE UPDATE ON utilizadores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar trigger para sincronizar utilizadores com auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.utilizadores (id, nome)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Adicionar políticas de segurança
ALTER TABLE topicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilizadores ENABLE ROW LEVEL SECURITY;

-- Políticas para utilizadores
CREATE POLICY "Utilizadores podem ver todos os utilizadores"
    ON utilizadores FOR SELECT
    USING (true);

CREATE POLICY "Utilizadores podem atualizar seus próprios dados"
    ON utilizadores FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para tópicos
CREATE POLICY "Qualquer um pode ver tópicos"
    ON topicos FOR SELECT
    USING (true);

CREATE POLICY "Utilizadores autenticados podem criar tópicos"
    ON topicos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem atualizar seus próprios tópicos"
    ON topicos FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para respostas
CREATE POLICY "Qualquer um pode ver respostas"
    ON respostas FOR SELECT
    USING (true);

CREATE POLICY "Utilizadores autenticados podem criar respostas"
    ON respostas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem atualizar suas próprias respostas"
    ON respostas FOR UPDATE
    USING (auth.uid() = user_id); 