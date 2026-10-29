function getDb() {
  const client = window.RUN_LEAGUE_SUPABASE;

  if (!client) {
    throw new Error(
      "Supabase client is not ready. Check that supabase-config.js loads before admin.js."
    );
  }

  return client;
}

const loginPanel = document.getElementById("login-panel");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const apkForm = document.getElementById("apk-form");
const reviewsContainer = document.getElementById("admin-reviews");

function setMessage(id, text, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("error", isError);
}

function showLogin() {
  loginPanel.classList.remove("hidden");
  adminPanel.classList.add("hidden");
}

function showAdmin(user) {
  loginPanel.classList.add("hidden");
  adminPanel.classList.remove("hidden");

  const signedInUser = document.getElementById("signed-in-user");
  if (signedInUser) {
    signedInUser.textContent = user?.email || "";
  }
}

async function requireAdmin() {
  try {
    const db = getDb();

    const {
      data: { user },
      error: userError
    } = await db.auth.getUser();

    if (userError) {
      console.error("Could not read current user:", userError);
    }

    if (!user) {
      showLogin();
      return false;
    }

    const { data: isAdmin, error } = await db.rpc("is_system_admin");

    if (error) {
      console.error("Admin check failed:", error);
      setMessage(
        "login-message",
        `Could not verify System Admin access: ${error.message}`,
        true
      );
      showLogin();
      return false;
    }

    if (!isAdmin) {
      await db.auth.signOut();
      showLogin();
      setMessage(
        "login-message",
        "This account is not registered as a System Admin.",
        true
      );
      return false;
    }

    showAdmin(user);
    await Promise.all([loadReviews(), loadApkUrl()]);
    return true;
  } catch (error) {
    console.error(error);
    showLogin();
    setMessage("login-message", error.message, true);
    return false;
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("login-message", "Signing in...");

  try {
    const db = getDb();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage("login-message", error.message, true);
      return;
    }

    setMessage("login-message", "");
    await requireAdmin();
  } catch (error) {
    console.error("Sign-in failed:", error);
    setMessage(
      "login-message",
      `Sign-in failed: ${error.message}`,
      true
    );
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    const db = getDb();
    await db.auth.signOut();
  } catch (error) {
    console.error("Sign-out failed:", error);
  }

  showLogin();
});

async function loadReviews() {
  reviewsContainer.textContent = "Loading...";

  try {
    const db = getDb();

    const { data, error } = await db
      .from("website_reviews")
      .select(
        "id, author_name, role_label, rating, review_text, is_visible, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      reviewsContainer.textContent =
        `Could not load reviews: ${error.message}`;
      return;
    }

    renderAdminReviews(data || []);
  } catch (error) {
    console.error("Could not load reviews:", error);
    reviewsContainer.textContent =
      `Could not load reviews: ${error.message}`;
  }
}

function renderAdminReviews(reviews) {
  reviewsContainer.innerHTML = "";

  if (!reviews.length) {
    reviewsContainer.textContent = "No reviews are available yet.";
    return;
  }

  const visibleCount = reviews.filter((review) => review.is_visible).length;

  const summary = document.createElement("p");
  summary.className = "review-summary";
  summary.textContent =
    `Currently showing ${visibleCount} review${visibleCount === 1 ? "" : "s"} on the website.`;

  reviewsContainer.appendChild(summary);

  for (const review of reviews) {
    const row = document.createElement("article");
    row.className = "admin-review";

    const content = document.createElement("div");

    const heading = document.createElement("strong");
    heading.textContent =
      `${review.author_name} — ` +
      `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;

    const role = document.createElement("small");
    role.textContent = review.role_label || "Runner";

    const text = document.createElement("p");
    text.textContent = review.review_text;

    const status = document.createElement("small");
    status.textContent = review.is_visible
      ? "Visible on website"
      : "Hidden from website";

    content.append(
      heading,
      document.createElement("br"),
      role,
      text,
      status
    );

    const actions = document.createElement("div");
    actions.className = "review-actions";

    const toggle = document.createElement("button");
    toggle.textContent = review.is_visible
      ? "Hide from Website"
      : "Show on Website";

    toggle.addEventListener("click", () =>
      setReviewVisibility(review.id, !review.is_visible)
    );

    actions.appendChild(toggle);
    row.append(content, actions);
    reviewsContainer.appendChild(row);
  }
}

async function setReviewVisibility(id, isVisible) {
  try {
    const db = getDb();

    const { error } = await db
      .from("website_reviews")
      .update({
        is_visible: isVisible,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadReviews();
  } catch (error) {
    console.error("Could not update review visibility:", error);
    alert(error.message);
  }
}

async function loadApkUrl() {
  try {
    const db = getDb();

    const { data, error } = await db
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "apk_url")
      .maybeSingle();

    if (error) {
      setMessage("apk-message", error.message, true);
      return;
    }

    document.getElementById("apk-url").value =
      data?.setting_value || "";
  } catch (error) {
    console.error("Could not load APK URL:", error);
    setMessage("apk-message", error.message, true);
  }
}

apkForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const db = getDb();
    const value = document.getElementById("apk-url").value.trim();

    const { error } = await db
      .from("site_settings")
      .upsert(
        {
          setting_key: "apk_url",
          setting_value: value,
          updated_at: new Date().toISOString()
        },
        { onConflict: "setting_key" }
      );

    if (error) {
      setMessage("apk-message", error.message, true);
      return;
    }

    setMessage(
      "apk-message",
      "APK URL updated. The public QR code will update automatically."
    );
  } catch (error) {
    console.error("Could not update APK URL:", error);
    setMessage("apk-message", error.message, true);
  }
});

document
  .getElementById("refresh-reviews")
  .addEventListener("click", loadReviews);

window.addEventListener("load", async () => {
  try {
    const db = getDb();

    db.auth.onAuthStateChange(() => {
      setTimeout(requireAdmin, 0);
    });

    await requireAdmin();
  } catch (error) {
    console.error("Admin page initialization failed:", error);
    setMessage("login-message", error.message, true);
  }
});
