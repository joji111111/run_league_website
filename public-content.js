async function loadPublicWebsiteContent() {
  const db = window.supabaseClient;

  const [{ data: reviews, error: reviewsError },
         { data: apkSetting, error: settingsError }] = await Promise.all([
    db
      .from("website_reviews")
      .select("id, author_name, role_label, rating, review_text, created_at")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(6),

    db
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "apk_url")
      .maybeSingle()
  ]);

  if (reviewsError) console.error("Could not load reviews:", reviewsError);
  else renderReviews(reviews || []);

  if (settingsError) console.error("Could not load APK URL:", settingsError);
  else renderApkDownload(apkSetting?.setting_value || "");
}

function renderReviews(reviews) {
  const container = document.getElementById("reviews-container");
  if (!container) return;

  container.innerHTML = "";

  if (!reviews.length) {
    container.innerHTML = "<p>No featured reviews yet.</p>";
    return;
  }

  for (const review of reviews) {
    const card = document.createElement("article");
    card.className = "review-card";

    const name = document.createElement("h3");
    name.textContent = review.author_name;

    const role = document.createElement("p");
    role.className = "review-role";
    role.textContent = review.role_label || "Runner";

    const rating = document.createElement("div");
    rating.className = "review-stars";
    rating.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

    const body = document.createElement("p");
    body.textContent = review.review_text;

    card.append(name, role, rating, body);
    container.appendChild(card);
  }
}

function renderApkDownload(apkUrl) {
  const link = document.getElementById("apk-download-link");
  const qrContainer = document.getElementById("apk-qr");

  if (link) {
    link.href = apkUrl || "#";
    link.style.pointerEvents = apkUrl ? "auto" : "none";
    link.textContent = apkUrl ? "Download Run League" : "APK not available";
  }

  if (!qrContainer) return;
  qrContainer.innerHTML = "";

  if (!apkUrl) {
    qrContainer.textContent = "APK QR code is not available yet.";
    return;
  }

  new QRCode(qrContainer, {
    text: apkUrl,
    width: 180,
    height: 180
  });
}

document.addEventListener("DOMContentLoaded", loadPublicWebsiteContent);
