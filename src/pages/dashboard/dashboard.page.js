import { ensureAuthenticatedUser, getDisplayName, getProgress, getStoredUser, getTestAnalytics, getTestHistory } from "../../features/auth/auth.js";

function getSuggestedTopics() {
  const progress = getProgress();
  const bookmarks = progress.bookmarkedTopics ?? [];
  const history = getTestHistory();
  const topicPool = [
    "Process Management",
    "CPU Scheduling",
    "Data Structures & Algorithms",
    "System Design",
    "Database Transactions",
  ];

  const priority = [...bookmarks, ...history.map((item) => item.title).filter(Boolean)];
  const suggestions = [...new Set(priority.length ? priority : topicPool)];
  return suggestions.slice(0, 4);
}

export async function renderDashboardPage(root) {
  const user = (await ensureAuthenticatedUser()) || getStoredUser();
  const progress = getProgress();
  const analytics = getTestAnalytics();
  const history = getTestHistory();
  const suggestions = getSuggestedTopics();

  if (!user) {
    window.location.href = "/login";
    return;
  }

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
            <a href="/account" data-route="/account">Account</a>
          </nav>
        </div>
      </header>

      <main>
        <section class="page-hero">
          <div class="container">
            <span class="eyebrow">Your learning dashboard</span>
            <h1>Hello ${getDisplayName()}, here is your prep pulse.</h1>
            <p>
              Review your practice performance, saved topics, and the next revision targets before starting the next study block.
            </p>
          </div>
        </section>

        <section class="section">
          <div class="container dashboard-grid">
            <article class="dashboard-card">
              <span class="eyebrow">Attempts</span>
              <strong>${progress.attemptedQuestions ?? 0}</strong>
              <small>Questions practiced</small>
            </article>
            <article class="dashboard-card">
              <span class="eyebrow">Accuracy</span>
              <strong>${analytics.averageScore ?? 0}%</strong>
              <small>Average mock score</small>
            </article>
            <article class="dashboard-card">
              <span class="eyebrow">Saved</span>
              <strong>${progress.bookmarkedTopics?.length ?? 0}</strong>
              <small>Bookmarked topics</small>
            </article>
            <article class="dashboard-card">
              <span class="eyebrow">Best</span>
              <strong>${analytics.bestScore ?? 0}%</strong>
              <small>Best test score</small>
            </article>
          </div>
        </section>

        <section class="section">
          <div class="container dashboard-columns">
            <div class="dashboard-panel">
              <h2>Priority topics</h2>
              <ul class="revision-list">
                ${suggestions.map((topic) => `<li>${topic}</li>`).join("")}
              </ul>
            </div>

            <div class="dashboard-panel">
              <h2>Recent tests</h2>
              ${history.length ? `
                <ul class="history-list">
                  ${history
                    .slice(0, 5)
                    .map(
                      (result) => `
                        <li>
                          <div>
                            <strong>${result.title}</strong>
                            <small>${result.score}/${result.total} · ${new Date(result.createdAt).toLocaleDateString()}</small>
                          </div>
                          <span>${result.percentage}%</span>
                        </li>
                      `
                    )
                    .join("")}
                </ul>
              ` : `<p class="empty-state">No tests taken yet. Start a mock test to unlock analytics.</p>`}
            </div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Revision dashboard</span>
        </div>
      </footer>
    </div>
  `;
}
