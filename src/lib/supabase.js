import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btfbvdvbwbhcuqmaivlh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZmJ2ZHZid2JoY3VxbWFpdmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDA0NTAsImV4cCI6MjA4OTI3NjQ1MH0.NXksrLE_mlqBIPTONaThPo42oQbnOWwbMKbZUa25VUk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



