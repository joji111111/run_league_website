const db = window.RUN_LEAGUE_SUPABASE;
const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const reviewsContainer = document.getElementById("adminReviews");

function setMessage(id, text, error = false) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.classList.toggle("error", error);
}

function showLogin() {
  loginPanel.classList.remove("hidden");
  adminPanel.classList.add("hidden");
}

function showAdmin(user) {
  loginPanel.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  document.getElementById("signedInUser").textContent = user.email || "";
}

async function requireAdmin() {
  const { data: { user } } = await db.auth.getUser();
  if (!user) { showLogin(); return false; }

  const { data: isAdmin, error } = await db.rpc("is_system_admin");
  if (error || !isAdmin) {
    await db.auth.signOut();
    showLogin();
    setMessage("loginMessage", "This account is not a system administrator.", true);
    return false;
  }

  showAdmin(user);
  await Promise.all([loadReviews(), loadApkUrl()]);
  return true;
}

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  setMessage("loginMessage", "Signing in...");

  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return setMessage("loginMessage", error.message, true);

  setMessage("loginMessage", "");
  await requireAdmin();
});

document.getElementById("logoutButton").addEventListener("click", async () => {
  await db.auth.signOut();
  showLogin();
});

async function loadReviews() {
  reviewsContainer.textContent = "Loading...";
  const { data, error } = await db.from("website_reviews").select("*").order("created_at", { ascending: false });
  if (error) { reviewsContainer.textContent = `Could not load reviews: ${error.message}`; return; }
  renderReviews(data || []);
}

function renderReviews(reviews) {
  reviewsContainer.replaceChildren();
  if (!reviews.length) { reviewsContainer.textContent = "No website reviews yet."; return; }

  reviews.forEach((review) => {
    const row = document.createElement("article"); row.className = "review-row";
    const info = document.createElement("div");
    const title = document.createElement("strong"); title.textContent = `${review.author_name} — ${"★".repeat(review.rating)}`;
    const body = document.createElement("p"); body.textContent = review.review_text;
    const status = document.createElement("small"); status.textContent = review.is_visible ? "Visible on website" : "Hidden";
    info.append(title, body, status);

    const actions = document.createElement("div"); actions.className = "review-actions";
    const toggle = document.createElement("button"); toggle.textContent = review.is_visible ? "Hide" : "Show";
    toggle.addEventListener("click", () => setVisibility(review.id, !review.is_visible));
    const remove = document.createElement("button"); remove.className = "danger"; remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteReview(review.id));
    actions.append(toggle, remove);
    row.append(info, actions);
    reviewsContainer.appendChild(row);
  });
}

async function setVisibility(id, visible) {
  const { error } = await db.from("website_reviews").update({ is_visible: visible, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return alert(error.message);
  await loadReviews();
}

async function deleteReview(id) {
  if (!confirm("Delete this review?")) return;
  const { error } = await db.from("website_reviews").delete().eq("id", id);
  if (error) return alert(error.message);
  await loadReviews();
}

document.getElementById("reviewForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    author_name: document.getElementById("reviewName").value.trim(),
    role_label: document.getElementById("reviewRole").value.trim() || "Runner",
    rating: Number(document.getElementById("reviewRating").value),
    review_text: document.getElementById("reviewText").value.trim(),
    is_visible: document.getElementById("reviewVisible").checked
  };
  const { error } = await db.from("website_reviews").insert(payload);
  if (error) return setMessage("reviewMessage", error.message, true);
  event.target.reset(); document.getElementById("reviewRole").value = "Runner";
  setMessage("reviewMessage", "Review added.");
  await loadReviews();
});

async function loadApkUrl() {
  const { data, error } = await db.from("site_settings").select("setting_value").eq("setting_key", "apk_url").maybeSingle();
  if (error) return setMessage("apkMessage", error.message, true);
  document.getElementById("apkUrl").value = data?.setting_value || "";
}

document.getElementById("apkForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = document.getElementById("apkUrl").value.trim();
  const { error } = await db.from("site_settings").upsert({ setting_key: "apk_url", setting_value: value, updated_at: new Date().toISOString() }, { onConflict: "setting_key" });
  if (error) return setMessage("apkMessage", error.message, true);
  setMessage("apkMessage", "APK URL updated.");
});

document.getElementById("refreshReviews").addEventListener("click", loadReviews);
requireAdmin();
