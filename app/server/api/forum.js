import { supabase } from '../lib/supabase';

export const forum = {
    async getTopicos(categoria = null, id = null) {
        try {
            let query = supabase
                .from('topicos')
                .select(`
                    *,
                    users:user_id (*),
                    categorias:categoria_id (*),
                    comentarios:comentarios(count)
                `);

            if (categoria) {
                query = query.eq('categoria_id', categoria);
            }

            if (id) {
                query = query.eq('id', id);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            const topicosProcessados = data.map(topico => ({
                ...topico,
                totalComentarios: topico.comentarios?.[0]?.count || 0
            }));

            return { data: topicosProcessados, error: null };
        } catch (error) {
            console.error('Erro ao buscar tópicos:', error);
            return { data: null, error: error.message };
        }
    },

    async getRespostas(topicId) {
        try {
            const { data, error } = await supabase
                .from('respostas')
                .select(`
                    *,
                    users:user_id (
                        id,
                        nome,
                        foto_perfil
                    )
                `)
                .eq('topico_id', topicId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Erro ao buscar respostas:', error);
            return { data: null, error: error.message };
        }
    },

    async addResposta(conteudo, topicoId, userId) {
        try {
            const { data, error } = await supabase
                .from('respostas')
                .insert([
                    {
                        conteudo,
                        topico_id: topicoId,
                        user_id: userId
                    }
                ])
                .select();

            if (error) throw error;

            // Atualizar contador de respostas no tópico
            await supabase.rpc('incrementar_respostas', { topico_id: topicoId });

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao adicionar resposta:', error);
            return { data: null, error: error.message };
        }
    },

    async addReacao(tipo, respostaId) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { data, error } = await supabase
                .from('reacoes')
                .insert([
                    {
                        tipo,
                        resposta_id: respostaId,
                        user_id: user.id
                    }
                ])
                .select();

            if (error) throw error;

            // Atualizar contador de reações na resposta
            await supabase.rpc('incrementar_reacoes', { resposta_id: respostaId });

            return { data, error: null };
        } catch (error) {
            console.error('Erro ao adicionar reação:', error);
            return { data: null, error: error.message };
        }
    }
}; 