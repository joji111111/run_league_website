window.loadRunLeagueReviews = async function loadRunLeagueReviews() {
  const db = window.RUN_LEAGUE_SUPABASE;
  if (!db) throw new Error("Supabase is not configured");

  const { data, error } = await db
    .from("website_reviews")
    .select("id, author_name, role_label, rating, review_text, created_at")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) throw error;

  return (data || []).map((review) => ({
    id: review.id,
    name: review.author_name || "Run League User",
    role: review.role_label || "Runner",
    rating: Number(review.rating) || 0,
    text: review.review_text || ""
  }));
};

window.loadRunLeagueSiteSettings = async function loadRunLeagueSiteSettings() {
  const db = window.RUN_LEAGUE_SUPABASE;
  if (!db) throw new Error("Supabase is not configured");

  const { data, error } = await db
    .from("site_settings")
    .select("setting_key, setting_value")
    .eq("setting_key", "apk_url")
    .maybeSingle();

  if (error) throw error;
  return { apkUrl: data?.setting_value || "" };
};
