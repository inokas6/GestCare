-- Adiciona a coluna conteudo à tabela noticias
ALTER TABLE public.noticias
ADD COLUMN conteudo TEXT;

-- Atualiza a definição da tabela
COMMENT ON TABLE public.noticias IS 'Tabela de notícias do sistema';
COMMENT ON COLUMN public.noticias.id IS 'Identificador único da notícia';
COMMENT ON COLUMN public.noticias.titulo IS 'Título da notícia';
COMMENT ON COLUMN public.noticias.imagem IS 'URL da imagem da notícia';
COMMENT ON COLUMN public.noticias.data IS 'Data de publicação da notícia';
COMMENT ON COLUMN public.noticias.conteudo IS 'Conteúdo completo da notícia'; 