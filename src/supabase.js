import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://airfdstsupzphuhlyozn.supabase.co'
const supabaseKey = 'sb_publishable_-9B2rM5vBs0o-z7MFXbYVQ_jHv3N3D6'

export const supabase = createClient(supabaseUrl, supabaseKey)
