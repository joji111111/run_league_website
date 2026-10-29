// Supabase project settings for the marketing website.
// Use ONLY the browser-safe Publishable / anon key here.
// Never place a service_role / secret key in this file.

window.RUN_LEAGUE_SUPABASE_URL = "https://epjonitnhzauaoxhwevi.supabase.co";
window.RUN_LEAGUE_SUPABASE_KEY = "sb_publishable_ST1rz4no88IK-O4VFhNymQ_SWwR_2-E";

window.RUN_LEAGUE_SUPABASE = window.supabase.createClient(
  window.RUN_LEAGUE_SUPABASE_URL,
  window.RUN_LEAGUE_SUPABASE_KEY
  {
    auth: {
      persistSession: false
    }
  }
);
