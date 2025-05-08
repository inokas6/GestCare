-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'tamanhos_bebe'
);

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'tamanhos_bebe';

-- Verificar os dados na tabela
SELECT * FROM tamanhos_bebe ORDER BY semana;

-- Verificar se há dados para todas as semanas
SELECT COUNT(*) as total_semanas,
       COUNT(DISTINCT semana) as semanas_unicas,
       MIN(semana) as semana_minima,
       MAX(semana) as semana_maxima
FROM tamanhos_bebe; 