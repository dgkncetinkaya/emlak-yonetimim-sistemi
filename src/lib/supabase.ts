import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ohkzxhqgaijproqgwimt.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oa3p4aHFnYWlqcHJvcWd3aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDY4ODEsImV4cCI6MjA3MjQ4Mjg4MX0.V1D05-oRDAfMyxRASeqq1B1SkTSVrcNFw0dcmFz0bvI'

console.log('🔍 Supabase Config:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey.substring(0, 20) + '...' });

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// User profile types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: 'admin' | 'consultant'
  created_at: string
  updated_at: string
}