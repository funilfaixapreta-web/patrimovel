import { createClient } from "@supabase/supabase-js";
import { supabaseChave, supabaseUrl } from "../config";

// Cliente do navegador. O anunciante só alcança as tabelas site_* (RLS no banco).
export const supabase = createClient(supabaseUrl, supabaseChave, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "padm:sessao" },
});
