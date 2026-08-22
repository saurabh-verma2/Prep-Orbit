const governmentCards = [
  {
    title: "Government Exams",
    description:
      "Prepare exam-wise with notes, practice questions and previous-year questions.",
    route: "/government",
    badge: "Exam → Subject → Topic",
  },
];

const mncCards = [
  {
    title: "MNC / IT Interviews",
    description:
      "Prepare company-wise with role, interview-round and topic-based questions.",
    route: "/mnc",
    badge: "Company → Role → Round → Topic",
  },
];

function cardTemplate(card) {
  return `
    <a class="track-card" href="${card.route}" data-route="${card.route}">
      <div class="track-card__top">
        <span class="track-card__badge">${card.badge}</span>
        <span class="track-card__arrow" aria-hidden="true">↗</span>
      </div>
      <h3>${card.title}</h3>
      <p>${card.description}</p>
      <span class="track-card__link">Explore preparation</span>
    </a>
  `;
}

function renderTrackSection(title, cards) {
  return `
    <section class="section">
      <div class="section-heading">
        <div>
          <span class="section-heading__eyebrow">Choose your path</span>
          <h2>${title}</h2>
        </div>
      </div>
      <div class="track-grid">
        ${cards.map(cardTemplate).join("")}
      </div>
    </section>
  `;
}

export function renderHomePage(root) {
  root.innerHTML = `
    <div class="site-shell">
      <header class="site-header">
        <div class="container site-header__inner">
          <a class="brand" href="/" data-route="/">
            <span class="brand__mark">EP</span>
            <span>
              <strong>Exam Prep</strong>
              <small>Learn • Practice • Improve</small>
            </span>
          </a>

          <nav class="site-nav" aria-label="Primary navigation">
            <a href="/" data-route="/">Home</a>
            <a href="/government" data-route="/government">Government</a>
            <a href="/mnc" data-route="/mnc">MNC</a>
            <a href="/notes" data-route="/notes">Notes</a>
            <a href="/practice" data-route="/practice">Practice</a>
            <a href="/admin" data-route="/admin">Admin</a>
            <a href="/login" data-route="/login">Login</a>
          </nav>
        </div>
      </header>

      <main>
        <section class="hero home-hero">
          <div class="container hero__grid">
            <div class="hero__content">
              <span class="eyebrow">Choose your prep track</span>
              <h1>Government or MNC prep. <span>One focused path at a time.</span></h1>
              <p class="hero__lead">
                Pick the track you want to study. Each path stays separate and shows only the content relevant to that preparation type.
              </p>
            </div>

            <div class="home-track-grid">
              <a class="home-track home-track--government" href="/government" data-route="/government">
                <span class="eyebrow">Government</span>
                <h2>Government exam preparation</h2>
                <p>Exam → Post → Subject → Topic</p>
                <span class="button button--primary">Open government prep</span>
              </a>

              <a class="home-track home-track--mnc" href="/mnc" data-route="/mnc">
                <span class="eyebrow">MNC / IT</span>
                <h2>MNC interview preparation</h2>
                <p>Company → Role → Round → Topic</p>
                <span class="button button--secondary">Open MNC prep</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Focused prep paths</span>
        </div>
      </footer>
    </div>
  `;
}
