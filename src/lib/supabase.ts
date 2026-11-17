import { createClient } from '@supabase/supabase-js';
import { publicConfig } from '@/lib/public-config';

export const supabase = createClient(publicConfig('VITE_SUPABASE_URL'), publicConfig('VITE_SUPABASE_ANON_KEY'));
