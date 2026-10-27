window.loadRunLeagueReviews = async function loadRunLeagueReviews() {
  const configured = String(window.RUN_LEAGUE_API_URL || "").trim().replace(/\/+$/, "");
  if (!configured || configured.includes("YOUR-PUBLIC-BACKEND")) {
    throw new Error("Backend URL is not configured in config.js");
  }

  const response = await fetch(`${configured}/public/reviews?limit=6`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) throw new Error(`Review API returned HTTP ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload.reviews) ? payload.reviews : [];

  return rows.map((review) => ({
    id: review.reviewId,
    name: review.authorName || "Run League User",
    role: review.roleLabel || "Runner",
    rating: Number(review.rating) || 0,
    text: review.reviewText || ""
  }));
};
