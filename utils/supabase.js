import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function saveMood(userId, moodType) {
  const { data, error } = await supabase
    .from('moods')
    .insert([
      { user_id: userId, mood_type: moodType }
    ])
  
  if (error) throw error
  return data
}

export async function getMoodHistory(userId) {
  const { data, error } = await supabase
    .from('moods')
    .select('mood_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(7)
  
  if (error) throw error
  return data
}

export async function getTodayMood(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('moods')
    .select('mood_type')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
  return data?.mood_type
} 