import { createClient } from '@supabase/supabase-js';

import { SUPABASE_SERVICE_ROLE_API_KEY, SUPABASE_URL } from './env.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_API_KEY);
