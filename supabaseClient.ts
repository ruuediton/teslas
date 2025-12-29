import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fycskldchqqqohgvioal.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5Y3NrbGRjaHFxcW9oZ3Zpb2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MDQxOTMsImV4cCI6MjA4MjQ4MDE5M30.vC5GkVPi9mZwkSNQG_ajVcRnWN8pyYGD0xQbl8Uhco0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
