import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const body = await readBody(event)
  const { userId, mes, url, descricao } = body

  try {
    const { data, error } = await client
      .from('user_fotos_barriga')
      .upsert({
        user_id: userId,
        mes,
        url,
        descricao
      }, {
        onConflict: 'user_id,mes'
      })

    if (error) throw error
    return data

  } catch (error) {
    console.error('Erro ao salvar foto:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao salvar foto da barriga'
    })
  }
}) 