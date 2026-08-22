import {
  governmentExams,
  getExamById,
  getPost,
  getSubject,
} from "../../features/government/government.data.js";
import { getStudyForTopic } from "../../features/learning/learning.data.js";

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
    <div class="government-explorer" data-current-exam-id="${exam.id}" data-current-post-id="${post.id}">
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
        ${post.subjects.map((subject, index) => `
          <button class="subject-item" type="button" data-subject-id="${subject.id}">
            <div>
              <span class="subject-item__number">${String(index + 1).padStart(2, "0")}</span>
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

function renderStudyPanel(topicName) {
  const study = getStudyForTopic(topicName) ?? {
    title: topicName,
    notes: [
      "Use this topic as the anchor for notes, practice and revision planning.",
      "The next step is to add targeted practice and previous-year questions to this same topic.",
    ],
    question: {
      prompt: `Create a practice question for ${topicName}.`,
      options: ["This is the placeholder state", "Notes are connected", "Question model is ready", "All of the above"],
      correctIndex: 3,
      hint: "This study card is now linked to the topic-level learning model.",
      explanation: "The system is ready to connect real notes and question content to each topic without changing the route structure.",
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

function renderSubjectExplorer(exam, post, subject) {
  return `
    <div class="government-explorer" data-current-exam-id="${exam.id}" data-current-post-id="${post.id}" data-current-subject-id="${subject.id}">
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
          <div class="topic-item" data-topic-name="${topic}">
            <span class="topic-item__number">${String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>${topic}</strong>
              <small>Open notes and practice preview.</small>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="study-panel" data-study-panel></div>
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
            <a href="/notes" data-route="/notes">Notes</a>
            <a href="/practice" data-route="/practice">Practice</a>
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

        <nav class="track-switcher" aria-label="Government and MNC track switcher">
          <div class="container track-switcher__inner">
            <a class="track-switcher__item is-active" href="/government" data-route="/government">Government prep</a>
            <a class="track-switcher__item" href="/mnc" data-route="/mnc">MNC prep</a>
          </div>
        </nav>

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

        <nav class="bottom-track-nav" aria-label="Government and MNC quick navigation">
          <div class="container bottom-track-nav__inner">
            <a class="bottom-track-nav__item is-active" href="/government" data-route="/government">Government</a>
            <a class="bottom-track-nav__item" href="/mnc" data-route="/mnc">MNC</a>
            <a class="bottom-track-nav__item" href="/notes" data-route="/notes">Notes</a>
            <a class="bottom-track-nav__item" href="/practice" data-route="/practice">Practice</a>
          </div>
        </nav>
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
  const currentState = {
    examId: null,
    postId: null,
    subjectId: null,
  };

  function showExam(examId) {
    const exam = getExamById(examId);
    if (!exam) return;

    currentState.examId = exam.id;
    currentState.postId = null;
    currentState.subjectId = null;
    explorerRoot.innerHTML = renderExamExplorer(exam);
    explorerRoot.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showPost(examId, postId) {
    const exam = getExamById(examId);
    const post = getPost(examId, postId);
    if (!exam || !post) return;

    currentState.examId = exam.id;
    currentState.postId = post.id;
    currentState.subjectId = null;
    explorerRoot.innerHTML = renderPostExplorer(exam, post);
  }

  function showSubject(examId, postId, subjectId) {
    const exam = getExamById(examId);
    const post = getPost(examId, postId);
    const subject = getSubject(examId, postId, subjectId);
    if (!exam || !post || !subject) return;

    currentState.examId = exam.id;
    currentState.postId = post.id;
    currentState.subjectId = subject.id;
    explorerRoot.innerHTML = renderSubjectExplorer(exam, post, subject);
  }

  root.querySelectorAll("[data-exam-id]").forEach((button) => {
    button.addEventListener("click", () => showExam(button.dataset.examId));
  });

  explorerRoot.addEventListener("click", (event) => {
    const postButton = event.target.closest("[data-post-id]");
    if (postButton) {
      showPost(currentState.examId, postButton.dataset.postId);
      return;
    }

    const subjectButton = event.target.closest("[data-subject-id]");
    if (subjectButton) {
      showSubject(currentState.examId, currentState.postId, subjectButton.dataset.subjectId);
      return;
    }

    const topicItem = event.target.closest("[data-topic-name]");
    if (topicItem) {
      const studyPanel = explorerRoot.querySelector("[data-study-panel]");
      if (studyPanel) {
        studyPanel.innerHTML = renderStudyPanel(topicItem.dataset.topicName);
      }
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
      currentState.examId = null;
      currentState.postId = null;
      currentState.subjectId = null;
    }
  });
}
