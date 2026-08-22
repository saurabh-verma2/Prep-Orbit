import { clearUser, ensureAuthenticatedUser, getDisplayName, getProgress, getStoredUser, getTestAnalytics } from "../../features/auth/auth.js";

export async function renderAccountPage(root) {
  const user = (await ensureAuthenticatedUser()) || getStoredUser();
  const progress = getProgress();
  const analytics = getTestAnalytics();

  if (!user) {
    window.location.href = "/login";
    return;
  }

  const bookmarkedTopics = progress.bookmarkedTopics ?? [];

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
            <a href="/notes" data-route="/notes">Notes</a>
            <a href="/practice" data-route="/practice">Practice</a>
            <a href="/tests" data-route="/tests">Tests</a>
            <a href="/dashboard" data-route="/dashboard">Dashboard</a>
            <a href="/admin" data-route="/admin">Admin</a>
            <a href="/account" data-route="/account">Account</a>
          </nav>
        </div>
      </header>

      <main>
        <section class="page-hero">
          <div class="container account-layout">
            <div class="account-card account-card--wide">
              <span class="eyebrow">Your account</span>
              <h1>Welcome back, ${getDisplayName()}.</h1>
              <p>${user.email}</p>

              <div class="account-stats">
                <article>
                  <strong>${progress.attemptedQuestions ?? 0}</strong>
                  <span>Questions attempted</span>
                </article>
                <article>
                  <strong>${progress.correctAnswers ?? 0}</strong>
                  <span>Correct answers</span>
                </article>
                <article>
                  <strong>${bookmarkedTopics.length}</strong>
                  <span>Bookmarked topics</span>
                </article>
                <article>
                  <strong>${analytics.totalTests ?? 0}</strong>
                  <span>Tests completed</span>
                </article>
                <article>
                  <strong>${analytics.bestScore ?? 0}%</strong>
                  <span>Best mock score</span>
                </article>
              </div>

              <div class="account-bookmarks">
                <h2>Saved topics</h2>
                ${bookmarkedTopics.length
                  ? `<ul class="bookmark-list">${bookmarkedTopics.map((topic) => `<li>${topic}</li>`).join("")}</ul>`
                  : `<p class="empty-state">No topics saved yet. Start with a practice card or study note.</p>`}
              </div>

              <button class="button button--secondary" type="button" id="logout-button">Logout</button>
            </div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Account dashboard • Step 5</span>
        </div>
      </footer>
    </div>
  `;

  const logoutButton = root.querySelector("#logout-button");
  logoutButton.addEventListener("click", async () => {
    await clearUser();
    window.location.href = "/login";
  });
}
