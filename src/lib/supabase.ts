import { createClient } from '@supabase/supabase-js';
import { appConfig } from '@/config/appConfig';

// main.tsx only loads the app after missingConfig() is empty, so both values are present here.
export const supabase = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
