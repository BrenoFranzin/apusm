import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vkvdhregsejaecdhyrud.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdmRocmVnc2VqYWVjZGh5cnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzQxNzAsImV4cCI6MjEwMTcxMDE3MH0.hVPY_kw5WXnHMcpb8r3NJn-qjE6BeFIoCAmBvSgKyH4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);