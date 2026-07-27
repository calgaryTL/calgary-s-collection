const app = document.getElementById("app");
const hero = document.getElementById("hero");
const backButton = document.getElementById("backButton");
const homeButton = document.getElementById("homeButton");
const modal = document.getElementById("itemModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

let view = "home";
let selectedArtist = "";
let selectedEra = "";
let activeType = "All";

function countForArtist(artist) {
  return collection.filter((item) => item.artist === artist).length;
}

function countForEra(era) {
  return collection.filter(
    (item) => item.artist === "Tate McRae" && item.era === era
  ).length;
}

function itemLabel(count) {
  return count === 1 ? "item" : "items";
}

function setView(nextView) {
  view = nextView;

  backButton.classList.toggle("hidden", view === "home");
  hero.classList.toggle("hidden", view !== "home");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  render();
}

function renderHome() {
  const tateCount = countForArtist("Tate McRae");
  const otherArtistsCount = countForArtist("Other Artists");

  app.innerHTML = `
    <div class="section-head">
      <div>
        <p class="eyebrow">BEGIN YOUR JOURNEY</p>
        <h2 class="section-title">Explore the archive</h2>
      </div>
    </div>

    <div class="choice-grid">
      <button class="choice-card" data-artist="Tate McRae">
        <div class="choice-visual">
          <div class="choice-title">Tate McRae</div>
        </div>

        <div class="choice-body">
          <span class="count">
            ${tateCount} ${itemLabel(tateCount)}
          </span>

          <p>
            Explore the archive by era, including vinyl, CDs, merchandise,
            magazines, passes and more.
          </p>
        </div>
      </button>

      <button class="choice-card" data-artist="Other Artists">
        <div class="choice-visual">
          <div class="choice-title">Other Artists</div>
        </div>

        <div class="choice-body">
          <span class="count">
            ${otherArtistsCount} ${itemLabel(otherArtistsCount)}
          </span>

          <p>
         This archive showcases a curated selection of vinyl records, CDs, and merchandise from other artists I enjoy listening to.
          </p>
        </div>
      </button>
    </div>
  `;

  document.querySelectorAll("[data-artist]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedArtist = button.dataset.artist;

      if (selectedArtist === "Tate McRae") {
        setView("eras");
      } else {
        setView("items");
      }
    });
  });
}

function renderEras() {
  app.innerHTML = `
    <div class="section-head">
      <div>
        <p class="eyebrow">TATE McRAE</p>
        <h2 class="section-title">Choose an era.</h2>
      </div>

      <p class="section-copy">
        Open an era to explore vinyl, CDs, merchandise, magazines,
        passes and other collectibles.
      </p>
    </div>

    <div class="era-grid">
      ${eras
        .map((era) => {
          const count = countForEra(era.id);

          return `
            <button class="era-card" data-era="${era.id}">
              <img
                class="era-image"
                src="${era.image}"
                alt="${era.title}"
              >

              <div class="era-body">
                <span class="count">
                  ${count} ${itemLabel(count)}
                </span>

                <h3>${era.title}</h3>
              </div>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  document.querySelectorAll("[data-era]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedEra = button.dataset.era;
      activeType = "All";
      setView("items");
    });
  });
}

function renderItems() {
  const base = collection.filter((item) => {
    const sameArtist = item.artist === selectedArtist;

    const sameEra =
      selectedArtist !== "Tate McRae" || item.era === selectedEra;

    return sameArtist && sameEra;
  });

  const types = ["All", ...new Set(base.map((item) => item.type))];

  let eyebrowText = "OTHER ARTISTS";

  if (selectedArtist === "Tate McRae") {
    const currentEra = eras.find((era) => era.id === selectedEra);
    eyebrowText = currentEra?.title || "TATE McRAE";
  }

  app.innerHTML = `
    <div class="section-head">
      <div>
        <p class="eyebrow">${eyebrowText}</p>
        <h2 class="section-title">The collection.</h2>
      </div>
    </div>

    <div class="controls">
      <div class="filters">
        ${types
          .map(
            (type) => `
              <button
                class="filter ${type === activeType ? "active" : ""}"
                data-type="${type}"
              >
                ${type}
              </button>
            `
          )
          .join("")}
      </div>

      <input
        id="search"
        type="search"
        placeholder="Search the collection"
        aria-label="Search the collection"
      >
    </div>

    <div class="item-grid" id="itemGrid"></div>
  `;

  const search = document.getElementById("search");

  document.querySelectorAll("[data-type]").forEach((button) => {
    button.addEventListener("click", () => {
      activeType = button.dataset.type;
      renderItems();
    });
  });

  search.addEventListener("input", () => {
    renderItemGrid(base, search.value);
  });

  renderItemGrid(base, "");
}

function renderItemGrid(base, term) {
  const grid = document.getElementById("itemGrid");
  const query = term.toLowerCase().trim();

  const items = base.filter((item) => {
    const matchesType =
      activeType === "All" || item.type === activeType;

    const searchableText = [
      item.title,
      item.type,
      item.edition,
      item.year,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(query);

    return matchesType && matchesSearch;
  });

  if (!items.length) {
    grid.innerHTML = `
      <p class="empty">
        No collectibles have been added here yet.
      </p>
    `;

    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
        <button class="item-card" data-id="${item.id}">
          <img
            class="item-image"
            src="${item.cover}"
            alt="${item.title}"
          >

          <div class="item-body">
            <div class="item-meta">
              <span>${item.type}</span>
              <span>${item.year}</span>
            </div>

            <h3>${item.title}</h3>
            <p>${item.edition}</p>
          </div>
        </button>
      `
    )
    .join("");

  document.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      showItem(Number(button.dataset.id));
    });
  });
}

function showItem(id) {
  const item = collection.find((entry) => entry.id === id);

  if (!item) {
    return;
  }

  modalContent.innerHTML = `
    <img
      class="modal-hero"
      src="${item.cover}"
      alt="${item.title}"
    >

    <div class="modal-body">
      <p class="eyebrow">${item.type}</p>
      <h2>${item.title}</h2>

      <div class="modal-details">
        <div class="detail">
          <span>Edition</span>
          <strong>${item.edition}</strong>
        </div>

        <div class="detail">
          <span>Year</span>
          <strong>${item.year}</strong>
        </div>

        <div class="detail">
          <span>Condition</span>
          <strong>${item.condition}</strong>
        </div>

        <div class="detail">
          <span>Signed</span>
          <strong>${item.signed}</strong>
        </div>
      </div>

      <p class="modal-story">${item.story}</p>

      <div class="gallery">
        ${item.images
          .map(
            (image) => `
              <img src="${image}" alt="${item.title}">
            `
          )
          .join("")}
      </div>
    </div>
  `;

  modal.showModal();
}

function render() {
  if (view === "home") {
    renderHome();
  } else if (view === "eras") {
    renderEras();
  } else {
    renderItems();
  }
}

backButton.addEventListener("click", () => {
  if (view === "items" && selectedArtist === "Tate McRae") {
    setView("eras");
  } else {
    setView("home");
  }
});

homeButton.addEventListener("click", () => {
  setView("home");
});

closeModal.addEventListener("click", () => {
  modal.close();
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.close();
  }
});

render();