import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://yqzqorlqjwfbppntaefh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxenFvcmxxandmYnBwbnRhZWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMzQxOTUsImV4cCI6MjA5OTgxMDE5NX0.2bZiLhuuL0yCcgBkTCT1mwFU0IIqTXtmRQikeuLVLww'
export const supabase = createClient(supabaseUrl, supabaseKey)
