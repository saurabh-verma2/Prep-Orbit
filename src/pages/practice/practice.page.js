import { governmentExams } from "../../features/government/government.data.js";
import { mncCompanies } from "../../features/mnc/mnc.data.js";
import { studyLibrary, getStudyForTopic } from "../../features/learning/learning.data.js";
import { getProgress, toggleBookmark, updateProgress } from "../../features/auth/auth.js";

function collectPracticeEntries() {
  const entries = [];

  governmentExams.forEach((exam) => {
    exam.posts.forEach((post) => {
      post.subjects.forEach((subject) => {
        subject.topics.forEach((topic) => {
          const study = getStudyForTopic(topic) ?? { question: null };
          if (study.question) {
            entries.push({
              track: exam.name,
              group: post.name,
              subject: subject.name,
              label: topic,
              source: "Government",
              question: study.question,
            });
          }
        });
      });
    });
  });

  mncCompanies.forEach((company) => {
    company.roles.forEach((role) => {
      role.rounds.forEach((round) => {
        round.topics.forEach((topic) => {
          const study = getStudyForTopic(topic.name) ?? { question: null };
          if (study.question) {
            entries.push({
              track: company.name,
              group: role.name,
              subject: round.name,
              label: topic.name,
              source: "MNC / IT",
              question: study.question,
            });
          }
        });
      });
    });
  });

  return entries.length ? entries : Object.entries(studyLibrary).map(([key, study]) => ({
    track: "Study Library",
    group: "Core prep",
    subject: "Quick review",
    label: study.title,
    source: "Study library",
    question: study.question,
  }));
}

function renderPracticeCard(entry, index) {
  const progress = getProgress();
  const bookmarked = progress.bookmarkedTopics?.includes(entry.label);

  return `
    <article class="practice-card" data-practice-index="${index}">
      <div class="practice-card__meta">
        <span class="track-card__badge">${entry.source}</span>
        <span>${entry.track}</span>
      </div>

      <div class="practice-card__header">
        <h3>${entry.label}</h3>
        <button
          class="bookmark-button ${bookmarked ? "bookmark-button--active" : ""}"
          type="button"
          data-topic-label="${entry.label}"
          data-bookmarked="${bookmarked ? "true" : "false"}"
        >
          ${bookmarked ? "★ Saved" : "☆ Save topic"}
        </button>
      </div>

      <p>${entry.subject} · ${entry.group}</p>

      <div class="practice-question">
        <strong>${entry.question.prompt}</strong>
        <div class="practice-options">
          ${entry.question.options.map((option, optionIndex) => `
            <button class="practice-option" type="button" data-answer-index="${optionIndex}" data-correct-index="${entry.question.correctIndex}">
              <span>${String.fromCharCode(65 + optionIndex)}</span>
              <span>${option}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="practice-feedback" aria-live="polite"></div>
    </article>
  `;
}

export function renderPracticePage(root) {
  const entries = collectPracticeEntries();

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
            <a href="/login" data-route="/login">Login</a>
          </nav>
        </div>
      </header>

      <main>
        <section class="page-hero">
          <div class="container">
            <span class="eyebrow">Practice board</span>
            <h1>Test your understanding before moving to the next topic.</h1>
            <p>
              This practice layer connects topic-based questions to the same learning model used by notes and revision cards.
            </p>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="practice-grid">
              ${entries.map(renderPracticeCard).join("")}
            </div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Practice bank • Step 4</span>
        </div>
      </footer>
    </div>
  `;

  root.querySelectorAll(".bookmark-button").forEach((button) => {
    button.addEventListener("click", () => {
      const topic = button.dataset.topicLabel;
      const next = toggleBookmark(topic);
      const isBookmarked = next.bookmarkedTopics?.includes(topic);

      button.dataset.bookmarked = String(isBookmarked);
      button.classList.toggle("bookmark-button--active", isBookmarked);
      button.textContent = isBookmarked ? "★ Saved" : "☆ Save topic";
    });
  });

  root.querySelectorAll(".practice-option").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".practice-card");
      const feedback = card.querySelector(".practice-feedback");
      const selectedIndex = Number(button.dataset.answerIndex);
      const correctIndex = Number(button.dataset.correctIndex);
      const isCorrect = selectedIndex === correctIndex;
      const topic = card.querySelector(".bookmark-button")?.dataset.topicLabel;
      const message = isCorrect
        ? "Correct — well done."
        : `Incorrect — the correct answer is ${String.fromCharCode(65 + correctIndex)}.`;

      updateProgress({ topic, correct: isCorrect });

      feedback.innerHTML = `
        <div class="practice-feedback__inner ${isCorrect ? "practice-feedback__inner--success" : "practice-feedback__inner--error"}">
          <strong>${message}</strong>
        </div>
      `;

      button.parentElement.querySelectorAll(".practice-option").forEach((option) => {
        const optionIndex = Number(option.dataset.answerIndex);
        option.disabled = true;
        if (optionIndex === correctIndex) {
          option.classList.add("practice-option--correct");
        }
        if (optionIndex === selectedIndex && optionIndex !== correctIndex) {
          option.classList.add("practice-option--wrong");
        }
      });
    });
  });
}
