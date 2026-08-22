import { governmentExams } from "../../features/government/government.data.js";

function examCardTemplate(exam) {
  const postCount = exam.posts.length;
  const subjectCount = exam.posts.reduce((total, post) => total + post.subjects.length, 0);

  return `
    <article class="government-exam-card">
      <div class="government-exam-card__top">
        <span class="track-card__badge">${postCount} post${postCount === 1 ? "" : "s"}</span>
        <span class="government-exam-card__icon">${exam.name.slice(0, 2).toUpperCase()}</span>
      </div>
      <h2>${exam.name}</h2>
      <p>${exam.description}</p>
      <div class="government-exam-card__meta">
        <span>${subjectCount} subject${subjectCount === 1 ? "" : "s"}</span>
        <span>Notes · Practice · PYQ</span>
      </div>
      <button class="button button--primary government-exam-card__button" type="button" data-exam-id="${exam.id}">
        View exam structure
      </button>
    </article>
  `;
}

function renderExamExplorer(exam) {
  return `
    <div class="government-explorer" data-current-exam-id="${exam.id}">
      <div class="government-explorer__header">
        <div>
          <span class="section-heading__eyebrow">Exam structure</span>
          <h2>${exam.name}</h2>
          <p>Select a post to continue to Subject → Topic.</p>
        </div>
        <button class="button button--secondary" type="button" data-close-explorer>Close</button>
      </div>

      <div class="post-list">
        ${exam.posts.map((post) => `
          <button class="post-item" type="button" data-post-id="${post.id}">
            <span>
              <strong>${post.name}</strong>
              <small>${post.description}</small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderPostExplorer(exam, post) {
  return `
    <div class="government-explorer">
      <div class="government-explorer__header">
        <div>
          <span class="section-heading__eyebrow">${exam.name} · ${post.name}</span>
          <h2>Select a subject</h2>
          <p>Subjects are the shared foundation for Notes, Practice and PYQ.</p>
        </div>
        <button class="button button--secondary" type="button" data-back-to-posts data-exam-id="${exam.id}">
          Back
        </button>
      </div>

      <div class="subject-grid">
        ${post.subjects.map((subject) => `
          <button class="subject-item" type="button" data-subject-id="${subject.id}">
            <div>
              <span class="subject-item__number">${String(subjectsIndex(post, subject) + 1).padStart(2, "0")}</span>
              <h3>${subject.name}</h3>
              <p>${subject.description}</p>
            </div>
            <span class="subject-item__count">${subject.topics.length} topics</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function subjectsIndex(post, subject) {
  return post.subjects.indexOf(subject);
}

function renderSubjectExplorer(exam, post, subject) {
  return `
    <div class="government-explorer">
      <div class="government-explorer__header">
        <div>
          <span class="section-heading__eyebrow">${exam.name} · ${post.name}</span>
          <h2>${subject.name}</h2>
          <p>${subject.description}</p>
        </div>
        <button class="button button--secondary" type="button" data-back-to-subjects data-exam-id="${exam.id}" data-post-id="${post.id}">
          Back
        </button>
      </div>

      <div class="topic-list">
        ${subject.topics.map((topic, index) => `
          <div class="topic-item">
            <span class="topic-item__number">${String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>${topic}</strong>
              <small>Notes · Practice · PYQ will connect here.</small>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

export function renderGovernmentPage(root) {
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

      <main>
        <section class="page-hero">
          <div class="container">
            <span class="eyebrow">Government Exams</span>
            <h1>Choose an exam and follow its real preparation hierarchy.</h1>
            <p>
              We are building the shared structure first: Exam → Post → Subject → Topic.
              Notes, Practice and PYQ will attach to these same topics later.
            </p>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="section-heading">
              <div>
                <span class="section-heading__eyebrow">Step 1</span>
                <h2>Government exam library</h2>
              </div>
              <p>${governmentExams.length} starter exams are included as seed data for the UI.</p>
            </div>

            <div class="government-exam-grid">
              ${governmentExams.map(examCardTemplate).join("")}
            </div>

            <div id="government-explorer-root" class="government-explorer-root" aria-live="polite"></div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Government module • Step 2</span>
        </div>
      </footer>
    </div>
  `;

  const explorerRoot = root.querySelector("#government-explorer-root");

  function showExam(examId) {
    const exam = governmentExams.find((item) => item.id === examId);
    if (!exam) return;
    explorerRoot.innerHTML = renderExamExplorer(exam);
    explorerRoot.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showPost(examId, postId) {
    const exam = governmentExams.find((item) => item.id === examId);
    const post = exam?.posts.find((item) => item.id === postId);
    if (!exam || !post) return;
    explorerRoot.innerHTML = renderPostExplorer(exam, post);
  }

  function showSubject(examId, postId, subjectId) {
    const exam = governmentExams.find((item) => item.id === examId);
    const post = exam?.posts.find((item) => item.id === postId);
    const subject = post?.subjects.find((item) => item.id === subjectId);
    if (!exam || !post || !subject) return;
    explorerRoot.innerHTML = renderSubjectExplorer(exam, post, subject);
  }

  root.querySelectorAll("[data-exam-id]").forEach((button) => {
    button.addEventListener("click", () => showExam(button.dataset.examId));
  });

  explorerRoot.addEventListener("click", (event) => {
    const postButton = event.target.closest("[data-post-id]");
    if (postButton) {
      const currentExam = explorerRoot.querySelector("[data-close-explorer]")
        ? governmentExams.find((item) => item.name === explorerRoot.querySelector("h2")?.textContent)
        : null;
      if (currentExam) showPost(currentExam.id, postButton.dataset.postId);
      return;
    }

    const subjectButton = event.target.closest("[data-subject-id]");
    if (subjectButton) {
      const header = explorerRoot.querySelector(".section-heading__eyebrow")?.textContent ?? "";
      const parts = header.split(" · ");
      const exam = governmentExams.find((item) => item.name === parts[0]);
      const post = exam?.posts.find((item) => item.name === parts[1]);
      if (exam && post) showSubject(exam.id, post.id, subjectButton.dataset.subjectId);
      return;
    }

    const backPosts = event.target.closest("[data-back-to-posts]");
    if (backPosts) {
      showExam(backPosts.dataset.examId);
      return;
    }

    const backSubjects = event.target.closest("[data-back-to-subjects]");
    if (backSubjects) {
      showPost(backSubjects.dataset.examId, backSubjects.dataset.postId);
      return;
    }

    if (event.target.closest("[data-close-explorer]")) {
      explorerRoot.innerHTML = "";
    }
  });
}
