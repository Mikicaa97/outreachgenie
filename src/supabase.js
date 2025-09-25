import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,       // čuva sesiju u localStorage
        autoRefreshToken: true,     // automatski osvežava refresh token
        detectSessionInUrl: true,   // hvata token iz URL-a posle signup/login
    },
})
