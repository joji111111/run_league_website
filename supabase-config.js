// Supabase project settings for the marketing website.
// Use ONLY the browser-safe Publishable / anon key here.
// Never place a service_role / secret key in this file.

window.RUN_LEAGUE_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
window.RUN_LEAGUE_SUPABASE_KEY = "YOUR_PUBLISHABLE_OR_ANON_KEY";

window.RUN_LEAGUE_SUPABASE = window.supabase.createClient(
  window.RUN_LEAGUE_SUPABASE_URL,
  window.RUN_LEAGUE_SUPABASE_KEY
);
