-- Função para incrementar o contador de respostas em um tópico
CREATE OR REPLACE FUNCTION incrementar_respostas(topico_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE topicos
    SET respostas = respostas + 1
    WHERE id = topico_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar o contador de reações em uma resposta
CREATE OR REPLACE FUNCTION incrementar_reacoes(resposta_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE respostas
    SET reacoes = reacoes + 1
    WHERE id = resposta_id;
END;
$$ LANGUAGE plpgsql; 