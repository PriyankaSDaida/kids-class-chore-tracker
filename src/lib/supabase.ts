import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — running in offline mode');
}

export let supabase: any = null;

if (url && key && url.startsWith('http')) {
  try {
    supabase = createClient(url, key);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabase = null;
  }
} else if (url && !url.startsWith('http')) {
  console.error('Supabase URL must start with http:// or https://');
}