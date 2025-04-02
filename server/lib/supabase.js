// lib/supabase.js
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Remove the previous implementation and use this instead
export const supabase = createClientComponentClient();