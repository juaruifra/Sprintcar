import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Variables de entorno
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente Supabase
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {auth: {
    storage: AsyncStorage, // Donde se guarda la sesión
    autoRefreshToken: true, // Refrescar token automáticamente
    persistSession: true, // Mantener sesión entre reinicios
    detectSessionInUrl: false,
  }},
);
