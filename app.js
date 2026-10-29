(() => {
  const grid = document.getElementById("reviewsGrid");
  const dots = document.getElementById("dots");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const apkBtn = document.getElementById("apkBtn");
  const qrContainer = document.getElementById("apkQr");
  let reviews = [];
  let page = 0;

  const perPage = () => innerWidth <= 680 ? 1 : innerWidth <= 980 ? 2 : 3;
  const pages = () => Math.max(1, Math.ceil(reviews.length / perPage()));
  const stars = (value) => {
    const rating = Math.max(0, Math.min(5, Number(value) || 0));
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  function card(review) {
    const article = document.createElement("article");
    article.className = "review-card";
    const starEl = document.createElement("div");
    starEl.className = "stars";
    starEl.textContent = stars(review.rating);
    const quote = document.createElement("p");
    quote.className = "quote";
    quote.textContent = `“${review.text}”`;
    const author = document.createElement("div");
    author.className = "author";
    author.textContent = review.name;
    const role = document.createElement("div");
    role.className = "role";
    role.textContent = review.role || "";
    article.append(starEl, quote, author, role);
    return article;
  }

  function renderDots() {
    dots.replaceChildren();
    for (let i = 0; i < pages(); i += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dot" + (i === page ? " active" : "");
      button.setAttribute("aria-label", `Show review page ${i + 1}`);
      button.addEventListener("click", () => { page = i; render(); });
      dots.appendChild(button);
    }
  }

  function render() {
    if (!reviews.length) {
      grid.innerHTML = "<p>No featured reviews are available yet.</p>";
      dots.replaceChildren();
      return;
    }
    if (page >= pages()) page = pages() - 1;
    const count = perPage();
    const start = page * count;
    grid.replaceChildren(...reviews.slice(start, start + count).map(card));
    renderDots();
  }

  prev.addEventListener("click", () => {
    if (!reviews.length) return;
    page = (page - 1 + pages()) % pages();
    render();
  });
  next.addEventListener("click", () => {
    if (!reviews.length) return;
    page = (page + 1) % pages();
    render();
  });
  addEventListener("resize", () => { page = 0; render(); });

  async function loadReviews() {
    try {
      reviews = await window.loadRunLeagueReviews();
      page = 0;
      render();
    } catch (error) {
      console.error("Review loading failed:", error);
      grid.innerHTML = "<p>Reviews are temporarily unavailable.</p>";
      dots.replaceChildren();
    }
  }

  async function loadDownload() {
    try {
      const { apkUrl } = await window.loadRunLeagueSiteSettings();

      if (!apkUrl) {
        apkBtn.removeAttribute("href");
        apkBtn.setAttribute("aria-disabled", "true");
        apkBtn.textContent = "Download Coming Soon";
        qrContainer.textContent = "APK QR code is not available yet.";
        return;
      }

      apkBtn.href = apkUrl;
      apkBtn.target = "_blank";
      apkBtn.rel = "noopener";
      apkBtn.removeAttribute("aria-disabled");
      apkBtn.textContent = "Download Run League";

      qrContainer.replaceChildren();
      new QRCode(qrContainer, {
        text: apkUrl,
        width: 180,
        height: 180,
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (error) {
      console.error("APK settings loading failed:", error);
      apkBtn.removeAttribute("href");
      apkBtn.setAttribute("aria-disabled", "true");
      qrContainer.textContent = "Download information is temporarily unavailable.";
    }
  }

  loadReviews();
  loadDownload();
})();
