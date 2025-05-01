-- Limpar dados existentes
TRUNCATE TABLE tamanhos_bebe CASCADE;

-- Inserir dados dos tamanhos do bebê
INSERT INTO tamanhos_bebe (semana, fruta) VALUES
    (1, 'semente de papoila'),
    (2, 'semente de sésamo'),
    (3, 'grão de arroz'),
    (4, 'feijão pequeno'),
    (5, 'amora'),
    (6, 'framboesa'),
    (7, 'uva'),
    (8, 'azeitona'),
    (9, 'morango'),
    (10, 'tâmara'),
    (11, 'figo'),
    (12, 'limão'),
    (13, 'pêssego'),
    (14, 'laranja'),
    (15, 'maçã'),
    (16, 'pêra'),
    (17, 'batata'),
    (18, 'pimenta'),
    (19, 'manga'),
    (20, 'banana'),
    (21, 'cenoura'),
    (22, 'abacate'),
    (23, 'papaia'),
    (24, 'milho'),
    (25, 'couve-flor'),
    (26, 'couve'),
    (27, 'alface'),
    (28, 'berinjela'),
    (29, 'ananás'),
    (30, 'meloa'),
    (31, 'repolho'),
    (32, 'côco'),
    (33, 'melão'),
    (34, 'ananás grande'),
    (35, 'melão'),
    (36, 'melancia pequena'),
    (37, 'alface romana'),
    (38, 'melancia'),
    (39, 'abóbora'),
    (40, 'melancia média');

-- Função para criar tamanhos padrão para um novo usuário
CREATE OR REPLACE FUNCTION criar_tamanhos_padrao_usuario(user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO tamanhos_bebe (user_id, semana, fruta) VALUES
        (user_id, 1, 'semente de papoila'),
        (user_id, 2, 'semente de sésamo'),
        (user_id, 3, 'grão de arroz'),
        (user_id, 4, 'feijão pequeno'),
        (user_id, 5, 'amora'),
        (user_id, 6, 'framboesa'),
        (user_id, 7, 'uva'),
        (user_id, 8, 'azeitona'),
        (user_id, 9, 'morango'),
        (user_id, 10, 'tâmara'),
        (user_id, 11, 'figo'),
        (user_id, 12, 'limão'),
        (user_id, 13, 'pêssego'),
        (user_id, 14, 'laranja'),
        (user_id, 15, 'maçã'),
        (user_id, 16, 'pêra'),
        (user_id, 17, 'batata'),
        (user_id, 18, 'pimenta'),
        (user_id, 19, 'manga'),
        (user_id, 20, 'banana'),
        (user_id, 21, 'cenoura'),
        (user_id, 22, 'abacate'),
        (user_id, 23, 'papaia'),
        (user_id, 24, 'milho'),
        (user_id, 25, 'couve-flor'),
        (user_id, 26, 'couve'),
        (user_id, 27, 'alface'),
        (user_id, 28, 'berinjela'),
        (user_id, 29, 'ananás'),
        (user_id, 30, 'meloa'),
        (user_id, 31, 'repolho'),
        (user_id, 32, 'côco'),
        (user_id, 33, 'melão'),
        (user_id, 34, 'ananás grande'),
        (user_id, 35, 'melão'),
        (user_id, 36, 'melancia pequena'),
        (user_id, 37, 'alface romana'),
        (user_id, 38, 'melancia'),
        (user_id, 39, 'abóbora'),
        (user_id, 40, 'melancia média');
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar tamanhos padrão quando um novo usuário se registra
CREATE OR REPLACE FUNCTION criar_tamanhos_padrao_on_signup()
RETURNS trigger AS $$
BEGIN
    PERFORM criar_tamanhos_padrao_usuario(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar o trigger na tabela de usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION criar_tamanhos_padrao_on_signup(); 