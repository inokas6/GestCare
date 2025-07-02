# Configuração do Sistema de Notificações

## ✅ Tabela de Notificações Já Criada

A tabela `notificacoes` já existe no seu banco de dados com a seguinte estrutura:

```sql
create table public.notificacoes (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  titulo character varying(255) not null,
  mensagem text not null,
  tipo character varying(50) not null,
  lida boolean null default false,
  data_criacao timestamp with time zone null default now(),
  data_evento timestamp with time zone null,
  evento_id uuid null,
  constraint notificacoes_pkey primary key (id),
  constraint notificacoes_evento_id_fkey foreign KEY (evento_id) references calendario (id) on delete CASCADE,
  constraint notificacoes_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
);
```

## 🔧 Configuração Necessária

### 1. Executar Políticas de Segurança

Execute o script `migrations/setup_notificacoes_policies.sql` no seu Supabase SQL Editor para configurar as políticas de segurança:

```sql
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
```

### 2. Índices Adicionais (Opcional)

Para melhor performance e prevenir duplicações, execute também:

```sql
-- Índices adicionais para melhor performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes USING btree (tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON public.notificacoes USING btree (data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida ON public.notificacoes USING btree (user_id, lida);

-- Índice único para prevenir notificações duplicadas no mesmo dia
CREATE UNIQUE INDEX IF NOT EXISTS idx_notificacoes_user_evento_dia 
ON public.notificacoes (user_id, evento_id, DATE(data_criacao)) 
WHERE evento_id IS NOT NULL AND tipo = 'lembrete';
```

## 🚀 Como Funciona

### Sistema de Lembretes

1. **Verificação Automática**: O calendário verifica lembretes a cada 15 minutos
2. **Cálculo de Antecedência**: O sistema calcula exatamente quando cada lembrete deve aparecer baseado na configuração do utilizador
3. **Criação de Notificações**: Quando é o dia exato do lembrete, uma notificação é criada na tabela `notificacoes`
4. **Exibição na Navbar**: As notificações aparecem no ícone de sino na navbar
5. **Marcação como Lida**: Ao clicar numa notificação, ela é marcada como lida e o utilizador é redirecionado para o calendário

### Como Funciona a Antecedência

- **0 dias**: Lembrete aparece no próprio dia do evento
- **1 dia**: Lembrete aparece 1 dia antes do evento
- **2 dias**: Lembrete aparece 2 dias antes do evento  
- **3 dias**: Lembrete aparece 3 dias antes do evento
- **7 dias**: Lembrete aparece 1 semana antes do evento

**Exemplo**: Se um evento está marcado para 15 de Janeiro e o utilizador escolhe "2 dias antes", o lembrete aparecerá exatamente no dia 13 de Janeiro.

### Prevenção de Duplicações

O sistema inclui múltiplas camadas de proteção contra notificações duplicadas:

1. **Verificação antes da criação**: Verifica se já existe uma notificação para o mesmo evento no mesmo dia
2. **Limpeza automática**: Remove notificações duplicadas existentes a cada verificação
3. **Índice único**: Previne duplicações a nível de banco de dados
4. **Uma notificação por evento por dia**: Garante que cada evento só gere uma notificação por dia

### Tipos de Notificações

- **Lembretes**: Criadas automaticamente para eventos com lembretes ativos
- **Antecedência**: Configurável (no dia, 1 dia antes, 2 dias antes, 3 dias antes, 1 semana antes)

### Campos da Tabela

- `id`: UUID único da notificação
- `user_id`: ID do utilizador (referência para auth.users)
- `titulo`: Título da notificação
- `mensagem`: Mensagem detalhada
- `tipo`: Tipo da notificação (ex: "lembrete")
- `lida`: Boolean indicando se foi lida
- `data_criacao`: Timestamp de criação
- `data_evento`: Data do evento relacionado
- `evento_id`: Referência para o evento no calendário

## 🧪 Teste do Sistema

1. Crie um evento no calendário com lembrete ativo
2. Configure o lembrete para "No dia" ou "1 dia antes"
3. Aguarde até à data do lembrete
4. Verifique se a notificação aparece na navbar
5. Clique na notificação para marcá-la como lida

## 🔧 Manutenção

### Limpeza Automática (Opcional)

Para evitar acumulação de notificações antigas, pode configurar uma limpeza automática:

```sql
-- Função para limpar notificações antigas
CREATE OR REPLACE FUNCTION limpar_notificacoes_antigas()
RETURNS void AS $$
BEGIN
    DELETE FROM public.notificacoes 
    WHERE data_criacao < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Agendar limpeza diária às 2h da manhã
SELECT cron.schedule('limpar-notificacoes', '0 2 * * *', 'SELECT limpar_notificacoes_antigas();');
```

## ✅ Status

- ✅ Tabela de notificações criada
- ✅ Código do calendário atualizado
- ✅ Código da navbar atualizado
- ⏳ Políticas de segurança (executar no Supabase)
- ⏳ Índices de performance (opcional)

Após executar as políticas de segurança, o sistema de notificações estará totalmente funcional! 