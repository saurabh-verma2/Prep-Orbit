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
    badge: "Company → Role → Topic",
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
            <a href="/government" data-route="/government">Government Exams</a>
            <a href="/mnc" data-route="/mnc">MNC / IT</a>
            <button class="button button--ghost" type="button" disabled>
              Login
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section class="hero">
          <div class="container hero__grid">
            <div class="hero__content">
              <span class="eyebrow">Interactive preparation platform</span>
              <h1>Prepare smarter. Practice better. <span>Understand why.</span></h1>
              <p class="hero__lead">
                One connected platform for syllabus notes, practice, previous-year
                questions and MNC interview preparation.
              </p>

              <div class="hero__actions">
                <a class="button button--primary" href="/government" data-route="/government">
                  Start Government Prep
                </a>
                <a class="button button--secondary" href="/mnc" data-route="/mnc">
                  Explore MNC Prep
                </a>
              </div>

              <div class="hero__principles" aria-label="Product principles">
                <span>✓ Topic-linked notes</span>
                <span>✓ Hint before answer</span>
                <span>✓ Learn from mistakes</span>
              </div>
            </div>

            <aside class="hero-panel" aria-label="Question engine preview">
              <div class="hero-panel__header">
                <div>
                  <span class="hero-panel__label">Question engine</span>
                  <h2>Every question should teach.</h2>
                </div>
                <span class="status-dot" aria-label="Preview"></span>
              </div>

              <div class="question-preview">
                <span class="question-preview__meta">PYQ • Operating Systems</span>
                <h3>
                  Which scheduling algorithm selects the process with the shortest
                  CPU burst time?
                </h3>

                <div class="option-preview">
                  <span>A</span>
                  <span>FCFS</span>
                </div>
                <div class="option-preview option-preview--wrong">
                  <span>B</span>
                  <span>Round Robin</span>
                </div>
                <div class="option-preview option-preview--correct">
                  <span>C</span>
                  <span>Shortest Job First</span>
                </div>
                <div class="option-preview">
                  <span>D</span>
                  <span>Priority Scheduling</span>
                </div>

                <div class="question-preview__footer">
                  <span>💡 Hint</span>
                  <span>Explanation after answer</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section class="section section--tight">
          <div class="container">
            <div class="feature-strip">
              <article>
                <span class="feature-strip__icon">01</span>
                <h3>Learn</h3>
                <p>Connect notes directly to subjects and topics.</p>
              </article>
              <article>
                <span class="feature-strip__icon">02</span>
                <h3>Practice</h3>
                <p>Practice by topic, difficulty and preparation track.</p>
              </article>
              <article>
                <span class="feature-strip__icon">03</span>
                <h3>Understand</h3>
                <p>Use hints, explanations and option-level reasoning.</p>
              </article>
              <article>
                <span class="feature-strip__icon">04</span>
                <h3>Improve</h3>
                <p>Track mistakes and revisit weak topics.</p>
              </article>
            </div>
          </div>
        </section>

        <div class="container">
          ${renderTrackSection("Government Exam Preparation", governmentCards)}
          ${renderTrackSection("MNC / IT Interview Preparation", mncCards)}
        </div>

        <section class="section section--highlight">
          <div class="container">
            <div class="section-heading">
              <div>
                <span class="section-heading__eyebrow">Planned learning loop</span>
                <h2>Question → Hint → Explanation → Related Topic</h2>
              </div>
              <p>
                The public website will eventually be backed by an admin-managed
                content system, so questions and explanations can be corrected
                without changing frontend code.
              </p>
            </div>

            <div class="learning-loop">
              <span>Question</span>
              <i>→</i>
              <span>Answer</span>
              <i>→</i>
              <span>Hint</span>
              <i>→</i>
              <span>Explanation</span>
              <i>→</i>
              <span>Next Topic</span>
            </div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Foundation build • Step 1</span>
        </div>
      </footer>
    </div>
  `;
}
