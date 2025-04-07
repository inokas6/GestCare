import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções auxiliares para o fórum
export const forum = {
  // Buscar tópicos
  async getTopicos(categoriaId = null) {
    let query = supabase
      .from('topicos')
      .select(`
        *,
        users!inner (
          id,
          nome,
          foto_perfil
        ),
        categorias!inner (
          id,
          nome
        ),
        respostas:respostas(count)
      `)
      .order('created_at', { ascending: false })

    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId)
    }

    const { data, error } = await query

    if (data) {
      // Transformar os objetos count em números
      data.forEach(topico => {
        topico.respostas = topico.respostas?.[0]?.count || 0
      })
    }

    return { data, error }
  },

  // Buscar categorias
  async getCategorias() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome')
    return { data, error }
  },

  // Criar novo tópico
  async createTopico(titulo, conteudo, categoriaId, userId) {
    const { data, error } = await supabase
      .from('topicos')
      .insert([
        {
          titulo,
          conteudo,
          categoria_id: categoriaId,
          user_id: userId
        }
      ])
      .select()
    return { data, error }
  },

  // Buscar respostas de um tópico
  async getRespostas(topicoId) {
    const { data, error } = await supabase
      .from('respostas')
      .select(`
        *,
        users:nome,
        reacoes:reacoes(count)
      `)
      .eq('topico_id', topicoId)
      .order('created_at', { ascending: true })

    if (data) {
      // Transformar os objetos count em números
      data.forEach(resposta => {
        resposta.reacoes = resposta.reacoes?.[0]?.count || 0
      })
    }

    return { data, error }
  },

  // Adicionar resposta
  async addResposta(conteudo, topicoId, userId) {
    const { data, error } = await supabase
      .from('respostas')
      .insert([
        {
          conteudo,
          topico_id: topicoId,
          user_id: userId
        }
      ])
      .select()
    return { data, error }
  },

  // Adicionar reação
  async addReacao(tipo, userId, topicoId = null, respostaId = null) {
    const { data, error } = await supabase
      .from('reacoes')
      .insert([
        {
          tipo,
          user_id: userId,
          topico_id: topicoId,
          resposta_id: respostaId
        }
      ])
      .select()
    return { data, error }
  },

  // Buscar usuários mais ativos
  async getTopUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        topicos:topicos(count),
        respostas:respostas(count)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) {
      // Transformar os objetos count em números
      data.forEach(user => {
        user.topicos = user.topicos?.[0]?.count || 0
        user.respostas = user.respostas?.[0]?.count || 0
      })
    }

    return { data, error }
  }
} 