import { getTestAnalytics, getTestHistory, saveTestResult } from "../../features/auth/auth.js";
import { getStudyForTopic, studyLibrary } from "../../features/learning/learning.data.js";

const testBlueprints = [
  {
    title: "Core Fundamentals",
    description: "Quick checks across process, CPU, and data structures.",
    topics: ["Process Management", "CPU Scheduling", "Data Structures & Algorithms"],
  },
  {
    title: "System Design Sprint",
    description: "Measure your design instincts and trade-off thinking.",
    topics: ["System Design", "CPU Scheduling", "Process Management"],
  },
  {
    title: "Interview Readiness",
    description: "Scenario and concept checks tuned for prep rounds.",
    topics: ["Data Structures & Algorithms", "System Design", "CPU Scheduling"],
  },
];

function buildQuizQuestions(blueprint) {
  const selected = [];

  blueprint.topics.forEach((topic) => {
    const study = getStudyForTopic(topic);
    if (study?.question) {
      selected.push({
        id: topic,
        prompt: study.question.prompt,
        options: study.question.options,
        correctIndex: study.question.correctIndex,
        explanation: study.question.explanation,
        hint: study.question.hint,
      });
    }
  });

  if (selected.length < 3) {
    Object.values(studyLibrary).forEach((study) => {
      if (!selected.some((item) => item.id === study.title)) {
        selected.push({
          id: study.title,
          prompt: study.question.prompt,
          options: study.question.options,
          correctIndex: study.question.correctIndex,
          explanation: study.question.explanation,
          hint: study.question.hint,
        });
      }
      if (selected.length >= 3) return;
    });
  }

  return selected.slice(0, 3);
}

function renderQuestionSet(quiz) {
  const questionIndex = quiz.currentIndex;
  const question = quiz.questions[questionIndex];

  return `
    <div class="quiz-panel">
      <div class="quiz-panel__header">
        <div>
          <span class="eyebrow">Question ${questionIndex + 1}/${quiz.questions.length}</span>
          <h2>${quiz.title}</h2>
        </div>
        <strong>${Math.max(0, quiz.timeLeft)}s</strong>
      </div>

      <div class="quiz-question">
        <p>${question.prompt}</p>
        <div class="quiz-options">
          ${question.options
            .map(
              (option, optionIndex) => `
                <button
                  type="button"
                  class="quiz-option ${quiz.answers[question.id] === optionIndex ? "quiz-option--selected" : ""}"
                  data-question-id="${question.id}"
                  data-option-index="${optionIndex}"
                >
                  <span>${String.fromCharCode(65 + optionIndex)}</span>
                  <span>${option}</span>
                </button>
              `
            )
            .join("")}
        </div>
      </div>

      <div class="quiz-actions">
        <button class="button button--secondary" type="button" data-quiz-nav="prev" ${questionIndex === 0 ? "disabled" : ""}>Previous</button>
        <button class="button button--primary" type="button" data-quiz-nav="next">${questionIndex === quiz.questions.length - 1 ? "Finish test" : "Next question"}</button>
      </div>
    </div>
  `;
}

export function renderMockTestsPage(root) {
  const history = getTestHistory();
  const analytics = getTestAnalytics();

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
            <a href="/admin" data-route="/admin">Admin</a>
            <a href="/login" data-route="/login">Login</a>
          </nav>
        </div>
      </header>

      <main>
        <section class="page-hero">
          <div class="container">
            <span class="eyebrow">Mock tests</span>
            <h1>Measure readiness with short, topic-focused practice rounds.</h1>
            <p>
              Run a quick mock test, review your score, and use the analytics to spot which ready-to-learn topics need more attention.
            </p>
          </div>
        </section>

        <section class="section">
          <div class="container tests-overview">
            <article class="stat-block">
              <strong>${analytics.totalTests}</strong>
              <span>Tests completed</span>
            </article>
            <article class="stat-block">
              <strong>${analytics.averageScore}%</strong>
              <span>Average score</span>
            </article>
            <article class="stat-block">
              <strong>${analytics.bestScore}%</strong>
              <span>Best score</span>
            </article>
          </div>
        </section>

        <section class="section">
          <div class="container test-grid">
            ${testBlueprints
              .map(
                (blueprint, index) => `
                  <article class="test-card">
                    <span class="track-card__badge">${blueprint.title}</span>
                    <h3>${blueprint.title}</h3>
                    <p>${blueprint.description}</p>
                    <ul>
                      ${blueprint.topics.map((topic) => `<li>${topic}</li>`).join("")}
                    </ul>
                    <button class="button button--primary" type="button" data-launch-test="${index}">Start test</button>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="section" id="quiz-section">
          <div class="container" id="quiz-container"></div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>Mock tests • Analytics</span>
        </div>
      </footer>
    </div>
  `;

  const quizContainer = root.querySelector("#quiz-container");
  const launchButtons = root.querySelectorAll("[data-launch-test]");

  launchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const blueprint = testBlueprints[Number(button.dataset.launchTest)];
      const questions = buildQuizQuestions(blueprint);
      const quizState = {
        title: blueprint.title,
        questions,
        currentIndex: 0,
        timeLeft: 180,
        answers: {},
      };

      const renderQuiz = () => {
        quizContainer.innerHTML = renderQuestionSet(quizState);

        quizContainer.querySelectorAll(".quiz-option").forEach((optionButton) => {
          optionButton.addEventListener("click", () => {
            const questionId = optionButton.dataset.questionId;
            const optionIndex = Number(optionButton.dataset.optionIndex);
            quizState.answers[questionId] = optionIndex;
            renderQuiz();
          });
        });

        quizContainer.querySelectorAll("[data-quiz-nav]").forEach((actionButton) => {
          actionButton.addEventListener("click", () => {
            const direction = actionButton.dataset.quizNav;
            const isNext = direction === "next";
            const lastIndex = quizState.questions.length - 1;

            if (isNext && quizState.currentIndex === lastIndex) {
              const total = quizState.questions.length;
              const correct = quizState.questions.filter((question) => quizState.answers[question.id] === question.correctIndex).length;
              const percentage = Math.round((correct / total) * 100);
              const updatedHistory = saveTestResult({
                title: quizState.title,
                score: correct,
                total,
                percentage,
              });

              const metrics = {
                totalTests: updatedHistory.length,
                averageScore: Math.round(updatedHistory.reduce((sum, item) => sum + Number(item.percentage ?? 0), 0) / updatedHistory.length),
                bestScore: Math.max(...updatedHistory.map((item) => Number(item.percentage ?? 0))),
              };

              quizContainer.innerHTML = `
                <div class="quiz-summary">
                  <span class="eyebrow">Test complete</span>
                  <h2>${quizState.title}</h2>
                  <div class="score-ring">
                    <strong>${percentage}%</strong>
                  </div>
                  <p>You scored ${correct} out of ${total}.</p>
                  <div class="summary-grid">
                    <article><strong>${metrics.totalTests}</strong><span>Tests</span></article>
                    <article><strong>${metrics.averageScore}%</strong><span>Average</span></article>
                    <article><strong>${metrics.bestScore}%</strong><span>Best</span></article>
                  </div>
                  <button class="button button--primary" type="button" data-reset-tests>Try another test</button>
                </div>
              `;

              const resetButton = root.querySelector("[data-reset-tests]");
              if (resetButton) {
                resetButton.addEventListener("click", () => renderMockTestsPage(root));
              }

              return;
            }

            const nextIndex = direction === "next" ? quizState.currentIndex + 1 : quizState.currentIndex - 1;
            quizState.currentIndex = Math.max(0, Math.min(nextIndex, lastIndex));
            renderQuiz();
          });
        });
      };

      renderQuiz();
    });
  });
}
