-- Criar a tabela tamanhos_bebe
CREATE TABLE IF NOT EXISTS tamanhos_bebe (
    id BIGSERIAL PRIMARY KEY,
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 42),
    fruta TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(semana)
);

-- Inserir os tamanhos padrão
INSERT INTO tamanhos_bebe (semana, fruta) VALUES
    (1, 'Semente de papoila'),
    (2, 'Semente de papoila'),
    (3, 'Semente de papoila'),
    (4, 'Semente de papoila'),
    (5, 'Semente de maçã'),
    (6, 'Grão de arroz'),
    (7, 'Mirtilo'),
    (8, 'Framboesa'),
    (9, 'Azeitona'),
    (10, 'Morango'),
    (11, 'Lima'),
    (12, 'Limão'),
    (13, 'Pêssego'),
    (14, 'Limão'),
    (15, 'Maçã'),
    (16, 'Abacate'),
    (17, 'Pêra'),
    (18, 'Batata doce'),
    (19, 'Manga'),
    (20, 'Banana'),
    (21, 'Cenoura'),
    (22, 'Espiga de milho'),
    (23, 'Manga grande'),
    (24, 'Milho'),
    (25, 'Nabo'),
    (26, 'Cebola roxa'),
    (27, 'Couve-flor'),
    (28, 'Beringela'),
    (29, 'Abóbora'),
    (30, 'Repolho'),
    (31, 'Coco'),
    (32, 'Couve-flor grande'),
    (33, 'Abacaxi'),
    (34, 'Melão'),
    (35, 'Melão cantaloupe'),
    (36, 'Alface romana'),
    (37, 'Acelga'),
    (38, 'Abóbora'),
    (39, 'Mini melancia'),
    (40, 'Melancia pequena'),
    (41, 'Melancia'),
    (42, 'Melancia grande');

-- Criar política de segurança para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios tamanhos de bebê"
    ON tamanhos_bebe
    FOR SELECT
    USING (auth.uid() = user_id);

-- Criar política de segurança para permitir que usuários insiram seus próprios dados
CREATE POLICY "Usuários podem inserir seus próprios tamanhos de bebê"
    ON tamanhos_bebe
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tamanhos_bebe ENABLE ROW LEVEL SECURITY; 