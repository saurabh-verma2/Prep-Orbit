import { ensureAuthenticatedUser, getStoredUser, loginUser } from "../../features/auth/auth.js";

export async function renderAuthPage(root) {
  const currentUser = (await ensureAuthenticatedUser()) || getStoredUser();

  if (currentUser) {
    window.location.href = currentUser.role === "admin" ? "/admin" : "/account";
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
            <a href="/government" data-route="/government">Government</a>
            <a href="/mnc" data-route="/mnc">MNC</a>
            <a href="/admin" data-route="/admin">Admin</a>
            <a href="/login" data-route="/login">Login</a>
          </nav>
        </div>
      </header>

      <main>
        <section class="page-hero">
          <div class="container auth-container">
            <div class="auth-card">
              <span class="eyebrow">Prep access</span>
              <h1>Sign in as a learner or admin.</h1>
              <form id="auth-form" class="auth-form">
                <label>
                  <span>Name</span>
                  <input type="text" name="name" placeholder="Your name" />
                </label>

                <label>
                  <span>Login as</span>
                  <select name="role">
                    <option value="user">Learner</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label>
                  <span>Email</span>
                  <input type="email" name="email" placeholder="you@example.com" required />
                </label>

                <label>
                  <span>Password</span>
                  <input type="password" name="password" placeholder="••••••••" required />
                </label>

                <small class="auth-note">Use the dedicated admin access route for admin sign-in and content updates.</small>
                <button class="button button--primary" type="submit">Continue</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Clear access flow</span>
        </div>
      </footer>
    </div>
  `;

  const form = root.querySelector("#auth-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      role: String(formData.get("role") || "user").trim(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "").trim(),
    };

    if (!payload.email || !payload.password) {
      return;
    }

    try {
      const user = await loginUser(payload);
      window.location.href = user.role === "admin" ? "/admin" : "/account";
    } catch (error) {
      const button = form.querySelector("button[type='submit']");
      const message = error?.message || "Unable to sign in. Please check your credentials.";
      const existing = form.querySelector(".auth-error");
      if (existing) existing.remove();
      const errorNode = document.createElement("div");
      errorNode.className = "auth-error";
      errorNode.textContent = message;
      button.insertAdjacentElement("afterend", errorNode);
    }
  });
}
