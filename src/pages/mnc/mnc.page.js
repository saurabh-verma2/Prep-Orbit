import {
  mncCompanies,
  getCompanyById,
  getRole,
  getRound,
} from "../../features/mnc/mnc.data.js";
import { getStudyForTopic } from "../../features/learning/learning.data.js";

function companyCardTemplate(company) {
  const roleCount = company.roles.length;
  const roundCount = company.roles.reduce((total, role) => total + role.rounds.length, 0);

  return `
    <article class="government-exam-card">
      <div class="government-exam-card__top">
        <span class="track-card__badge">${roleCount} role${roleCount === 1 ? "" : "s"}</span>
        <span class="government-exam-card__icon">${company.name.slice(0, 2).toUpperCase()}</span>
      </div>
      <h2>${company.name}</h2>
      <p>${company.description}</p>
      <div class="government-exam-card__meta">
        <span>${roundCount} round${roundCount === 1 ? "" : "s"}</span>
        <span>Interview · Coding · Design</span>
      </div>
      <button class="button button--primary government-exam-card__button" type="button" data-company-id="${company.id}">
        View company flow
      </button>
    </article>
  `;
}

function renderCompanyExplorer(company) {
  return `
    <div class="government-explorer" data-current-company-id="${company.id}">
      <div class="government-explorer__header">
        <div>
          <span class="section-heading__eyebrow">Company flow</span>
          <h2>${company.name}</h2>
          <p>Select a role to continue to Round → Topic.</p>
        </div>
        <button class="button button--secondary" type="button" data-close-explorer>Close</button>
      </div>

      <div class="post-list">
        ${company.roles.map((role) => `
          <button class="post-item" type="button" data-role-id="${role.id}">
            <span>
              <strong>${role.name}</strong>
              <small>${role.description}</small>
            </span>
            <span aria-hidden="true">→</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderRoleExplorer(company, role) {
  return `
    <div class="government-explorer" data-current-company-id="${company.id}" data-current-role-id="${role.id}">
      <div class="government-explorer__header">
        <div>
          <span class="section-heading__eyebrow">${company.name} · ${role.name}</span>
          <h2>Select a round</h2>
          <p>Rounds map directly to topics, notes and mock interview practice.</p>
        </div>
        <button class="button button--secondary" type="button" data-back-to-companies data-company-id="${company.id}">
          Back
        </button>
      </div>

      <div class="subject-grid">
        ${role.rounds.map((round, index) => `
          <button class="subject-item" type="button" data-round-id="${round.id}">
            <div>
              <span class="subject-item__number">${String(index + 1).padStart(2, "0")}</span>
              <h3>${round.name}</h3>
              <p>${round.description}</p>
            </div>
            <span class="subject-item__count">${round.topics.length} topics</span>
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
      "Use this topic as the anchor for interview preparation notes and mock discussion preparation.",
      "This topic area is ready for deeper behavioral and technical content as the content layer grows.",
    ],
    question: {
      prompt: `Prepare a practical interview question on ${topicName}.`,
      options: ["Use this as a revision topic", "Connect it to a mock answer", "Track it for future practice", "All of the above"],
      correctIndex: 3,
      hint: "Think of the whole interview prep cycle, not just a single fact.",
      explanation: "The learning model is now connected to the topic so notes, practice, and explanations can all be attached in one place.",
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

function renderRoundExplorer(company, role, round) {
  return `
    <div class="government-explorer" data-current-company-id="${company.id}" data-current-role-id="${role.id}" data-current-round-id="${round.id}">
      <div class="government-explorer__header">
        <div>
          <span class="section-heading__eyebrow">${company.name} · ${role.name}</span>
          <h2>${round.name}</h2>
          <p>${round.description}</p>
        </div>
        <button class="button button--secondary" type="button" data-back-to-roles data-company-id="${company.id}" data-role-id="${role.id}">
          Back
        </button>
      </div>

      <div class="topic-list">
        ${round.topics.map((topic, index) => `
          <div class="topic-item" data-topic-name="${topic.name}">
            <span class="topic-item__number">${String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>${topic.name}</strong>
              <small>${topic.description}</small>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="study-panel" data-study-panel></div>
    </div>
  `;
}

export function renderMncPage(root) {
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
            <span class="eyebrow">MNC / IT</span>
            <h1>Understand the company flow before you walk into the interview.</h1>
            <p>
              We are building the learning path as Company → Role → Round → Topic,
              so coding, system design, and behavioral prep stay connected.
            </p>
          </div>
        </section>

        <nav class="track-switcher" aria-label="Government and MNC track switcher">
          <div class="container track-switcher__inner">
            <a class="track-switcher__item" href="/government" data-route="/government">Government prep</a>
            <a class="track-switcher__item is-active" href="/mnc" data-route="/mnc">MNC prep</a>
          </div>
        </nav>

        <section class="section">
          <div class="container">
            <div class="section-heading">
              <div>
                <span class="section-heading__eyebrow">Step 2</span>
                <h2>MNC / IT interview library</h2>
              </div>
              <p>${mncCompanies.length} company-ready interview flows are included as seed data for the UI.</p>
            </div>

            <div class="government-exam-grid">
              ${mncCompanies.map(companyCardTemplate).join("")}
            </div>

            <div id="mnc-explorer-root" class="government-explorer-root" aria-live="polite"></div>
          </div>
        </section>

        <nav class="bottom-track-nav" aria-label="Government and MNC quick navigation">
          <div class="container bottom-track-nav__inner">
            <a class="bottom-track-nav__item" href="/government" data-route="/government">Government</a>
            <a class="bottom-track-nav__item is-active" href="/mnc" data-route="/mnc">MNC</a>
            <a class="bottom-track-nav__item" href="/notes" data-route="/notes">Notes</a>
            <a class="bottom-track-nav__item" href="/practice" data-route="/practice">Practice</a>
          </div>
        </nav>
      </main>
 
      <footer class="site-footer">
        <div class="container site-footer__inner">
          <span>Exam Prep Platform</span>
          <span>MNC module • Step 2</span>
        </div>
      </footer>
    </div>
  `;

  const explorerRoot = root.querySelector("#mnc-explorer-root");
  const currentState = {
    companyId: null,
    roleId: null,
    roundId: null,
  };

  function showCompany(companyId) {
    const company = getCompanyById(companyId);
    if (!company) return;

    currentState.companyId = company.id;
    currentState.roleId = null;
    currentState.roundId = null;
    explorerRoot.innerHTML = renderCompanyExplorer(company);
    explorerRoot.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showRole(companyId, roleId) {
    const company = getCompanyById(companyId);
    const role = getRole(companyId, roleId);
    if (!company || !role) return;

    currentState.companyId = company.id;
    currentState.roleId = role.id;
    currentState.roundId = null;
    explorerRoot.innerHTML = renderRoleExplorer(company, role);
  }

  function showRound(companyId, roleId, roundId) {
    const company = getCompanyById(companyId);
    const role = getRole(companyId, roleId);
    const round = getRound(companyId, roleId, roundId);
    if (!company || !role || !round) return;

    currentState.companyId = company.id;
    currentState.roleId = role.id;
    currentState.roundId = round.id;
    explorerRoot.innerHTML = renderRoundExplorer(company, role, round);
  }

  root.querySelectorAll("[data-company-id]").forEach((button) => {
    button.addEventListener("click", () => showCompany(button.dataset.companyId));
  });

  explorerRoot.addEventListener("click", (event) => {
    const roleButton = event.target.closest("[data-role-id]");
    if (roleButton) {
      showRole(currentState.companyId, roleButton.dataset.roleId);
      return;
    }

    const roundButton = event.target.closest("[data-round-id]");
    if (roundButton) {
      showRound(currentState.companyId, currentState.roleId, roundButton.dataset.roundId);
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

    const backCompanies = event.target.closest("[data-back-to-companies]");
    if (backCompanies) {
      showCompany(backCompanies.dataset.companyId);
      return;
    }

    const backRoles = event.target.closest("[data-back-to-roles]");
    if (backRoles) {
      showRole(backRoles.dataset.companyId, backRoles.dataset.roleId);
      return;
    }

    if (event.target.closest("[data-close-explorer]")) {
      explorerRoot.innerHTML = "";
      currentState.companyId = null;
      currentState.roleId = null;
      currentState.roundId = null;
    }
  });
}
