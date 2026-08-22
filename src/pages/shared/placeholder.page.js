export function renderPlaceholderPage(root, { eyebrow, title, description }) {
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
          </nav>
        </div>
      </header>

      <main class="placeholder-page">
        <div class="container">
          <span class="eyebrow">${eyebrow}</span>
          <h1>${title}</h1>
          <p>${description}</p>
          <a class="button button--primary" href="/" data-route="/">
            Back to Home
          </a>
        </div>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Module placeholder</span>
        </div>
      </footer>
    </div>
  `;
}
