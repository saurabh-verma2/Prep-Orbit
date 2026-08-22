import { governmentExams } from "../../features/government/government.data.js";
import { mncCompanies } from "../../features/mnc/mnc.data.js";
import { getStudyForTopic } from "../../features/learning/learning.data.js";

function collectTopics() {
  const topics = [];

  governmentExams.forEach((exam) => {
    exam.posts.forEach((post) => {
      post.subjects.forEach((subject) => {
        subject.topics.forEach((topic) => {
          topics.push({
            track: exam.name,
            trackGroup: post.name,
            subject: subject.name,
            label: topic,
            source: "Government",
          });
        });
      });
    });
  });

  mncCompanies.forEach((company) => {
    company.roles.forEach((role) => {
      role.rounds.forEach((round) => {
        round.topics.forEach((topic) => {
          topics.push({
            track: company.name,
            trackGroup: role.name,
            subject: round.name,
            label: topic.name,
            source: "MNC / IT",
          });
        });
      });
    });
  });

  return topics;
}

function buildStudyMarkup(topicName) {
  const study = getStudyForTopic(topicName) ?? {
    title: topicName,
    notes: [
      "Create concise revision notes for this topic as the content layer expands.",
      "Use this as the place to connect practice material and concept summaries.",
    ],
    question: {
      prompt: `How would you study ${topicName} most efficiently?`,
      options: ["Skip it", "Summarize key ideas", "Memorize without context", "Both A and C"],
      correctIndex: 1,
      hint: "Goal-first learning beats passive memorization.",
      explanation: "A strong study system starts with quick notes, key ideas, and recall practice instead of raw memorization.",
    },
  };

  return `
    <div class="study-panel">
      <div class="study-panel__header">
        <div>
          <span class="section-heading__eyebrow">Study preview</span>
          <h3>${study.title}</h3>
        </div>
      </div>

      <div class="study-grid">
        <article class="study-card">
          <h4>Key notes</h4>
          <ul>
            ${study.notes.map((note) => `<li>${note}</li>`).join("")}
          </ul>
        </article>

        <article class="question-card">
          <span class="question-preview__meta">Practice question</span>
          <h4>${study.question.prompt}</h4>

          <div class="option-preview-list">
            ${study.question.options.map((option, index) => `
              <div class="option-preview ${index === study.question.correctIndex ? "option-preview--correct" : ""}">
                <span>${String.fromCharCode(65 + index)}</span>
                <span>${option}</span>
              </div>
            `).join("")}
          </div>

          <div class="question-preview__footer">
            <span>💡 ${study.question.hint}</span>
            <span>${study.question.explanation}</span>
          </div>
        </article>
      </div>
    </div>
  `;
}

export function renderNotesPage(root) {
  const topics = collectTopics();

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
          </nav>
        </div>
      </header>

      <main>
        <section class="page-hero">
          <div class="container">
            <span class="eyebrow">Notes hub</span>
            <h1>One place for topic notes, revision, and quick practice.</h1>
            <p>
              This page aggregates the study content across the Government and MNC flows so every topic becomes a reusable learning unit.
            </p>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="notes-grid">
              ${topics.map((topic) => `
                <article class="notes-card" data-topic-name="${topic.label}">
                  <div class="notes-card__top">
                    <span class="track-card__badge">${topic.source}</span>
                    <span class="notes-card__meta">${topic.track}</span>
                  </div>
                  <h3>${topic.label}</h3>
                  <p>${topic.subject}</p>
                  <small>${topic.trackGroup}</small>
                  <button class="button button--secondary notes-card__button" type="button">Open note</button>
                </article>
              `).join("")}
            </div>

            <div id="notes-study-root" class="notes-study-root"></div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Notes hub • Step 3</span>
        </div>
      </footer>
    </div>
  `;

  const studyRoot = root.querySelector("#notes-study-root");

  root.querySelectorAll("[data-topic-name]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        const topicName = card.dataset.topicName;
        studyRoot.innerHTML = buildStudyMarkup(topicName);
        studyRoot.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}
