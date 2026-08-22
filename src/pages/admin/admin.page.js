import { ensureAuthenticatedUser, getStoredUser, isAdminUser, loginUser } from "../../features/auth/auth.js";
import { getCustomStudyLibrary, saveCustomStudy } from "../../features/learning/learning.data.js";

export async function renderAdminPage(root) {
  const user = (await ensureAuthenticatedUser()) || getStoredUser();

  if (!user || !isAdminUser(user)) {
    root.innerHTML = `
      <div class="site-shell">
        <header class="site-header">
          <div class="container site-header__inner">
            <a class="brand" href="/" data-route="/">
              <span class="brand__mark">EP</span>
              <span><strong>Exam Prep</strong><small>Learn • Practice • Improve</small></span>
            </a>
            <nav class="site-nav" aria-label="Primary navigation">
              <a href="/" data-route="/">Home</a>
              <a href="/government" data-route="/government">Government</a>
              <a href="/mnc" data-route="/mnc">MNC</a>
              <a href="/login" data-route="/login">Login</a>
            </nav>
          </div>
        </header>

        <main>
          <section class="page-hero">
            <div class="container admin-gate">
              <div class="admin-panel admin-panel--wide">
                <span class="eyebrow">Admin access</span>
                <h1>Secure your admin workspace.</h1>
                <p>Use the assigned admin email and access code to open the content studio.</p>

                <form id="admin-login-form" class="auth-form">
                  <label>
                    <span>Admin name</span>
                    <input type="text" name="name" placeholder="Admin name" required />
                  </label>
                  <label>
                    <span>Email</span>
                    <input type="email" name="email" placeholder="admin@prep-orbit.com" required />
                  </label>
                  <label>
                    <span>Access code</span>
                    <input type="password" name="password" placeholder="Enter admin access code" required />
                  </label>
                  <button type="submit" class="button button--primary">Open admin panel</button>
                </form>
              </div>
            </div>
          </section>
        </main>
      </div>
    `;

    const form = root.querySelector("#admin-login-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        name: String(formData.get("name") || "Admin").trim(),
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || "").trim(),
        role: "admin",
      };

      try {
        await loginUser(payload);
        window.location.href = "/admin";
      } catch (error) {
        const existing = form.querySelector(".auth-error");
        if (existing) existing.remove();
        const node = document.createElement("div");
        node.className = "auth-error";
        node.textContent = error?.message || "Admin access denied.";
        form.querySelector("button").insertAdjacentElement("afterend", node);
      }
    });
    return;
  }

  const customLibrary = getCustomStudyLibrary();
  const entries = Object.entries(customLibrary);

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
            <a href="/admin" data-route="/admin">Admin</a>
            <a href="/account" data-route="/account">Account</a>
          </nav>
        </div>
      </header>

      <main>
        <section class="page-hero">
          <div class="container">
            <span class="eyebrow">Admin content studio</span>
            <h1>Add topic notes and questions for learners.</h1>
            <p>
              This panel is only for the admin account. It stores the material in the browser for this project and then the public pages read it immediately.
            </p>
          </div>
        </section>

        <section class="section">
          <div class="container admin-layout">
            <form id="admin-content-form" class="admin-panel admin-panel--form">
              <h2>Add learning item</h2>

              <label>
                <span>Topic title</span>
                <input type="text" name="title" placeholder="e.g. DB Transactions" required />
              </label>

              <label>
                <span>Notes (one per line)</span>
                <textarea name="notes" placeholder="Write one note per line" rows="5"></textarea>
              </label>

              <label>
                <span>Question prompt</span>
                <textarea name="questionPrompt" rows="3" placeholder="Question description" required></textarea>
              </label>

              <div class="option-grid">
                ${[0, 1, 2, 3].map((index) => `
                  <label>
                    <span>Option ${String.fromCharCode(65 + index)}</span>
                    <input type="text" name="option-${index}" placeholder="Answer option" required />
                  </label>
                `).join("")}
              </div>

              <label>
                <span>Correct option</span>
                <select name="correctIndex">
                  <option value="0">A</option>
                  <option value="1">B</option>
                  <option value="2">C</option>
                  <option value="3">D</option>
                </select>
              </label>

              <label>
                <span>Hint</span>
                <input type="text" name="hint" placeholder="Helpful hint" />
              </label>

              <label>
                <span>Explanation</span>
                <textarea name="explanation" rows="3" placeholder="Explain the correct answer"></textarea>
              </label>

              <button class="button button--primary" type="submit">Save content</button>
            </form>

            <aside class="admin-panel admin-panel--list">
              <h2>Saved items</h2>
              ${entries.length ? entries.map(([key, study]) => `
                <article class="admin-item">
                  <strong>${study.title}</strong>
                  <small>${study.notes?.length ?? 0} notes</small>
                  <span>${study.question?.prompt || "No question saved"}</span>
                </article>
              `).join("") : `<p class="empty-state">No custom items yet. Add one using the form.</p>`}
            </aside>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Admin content studio</span>
        </div>
      </footer>
    </div>
  `;

  const form = root.querySelector("#admin-content-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      questionPrompt: String(formData.get("questionPrompt") || "").trim(),
      hint: String(formData.get("hint") || "").trim(),
      explanation: String(formData.get("explanation") || "").trim(),
      correctIndex: Number(formData.get("correctIndex") || 0),
      options: Array.from({ length: 4 }, (_, index) => String(formData.get(`option-${index}`) || "").trim()),
    };

    if (!payload.title || !payload.questionPrompt || payload.options.some((option) => !option)) {
      return;
    }

    await saveCustomStudy(payload);
    renderAdminPage(root);
  });
}
