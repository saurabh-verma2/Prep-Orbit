import { ROUTES, navigate, getCurrentRoute } from "./router.js";
import { renderHomePage } from "../pages/home/home.page.js";
import { renderGovernmentPage } from "../pages/government/government.page.js";
import { renderMncPage } from "../pages/mnc/mnc.page.js";
import { renderNotesPage } from "../pages/notes/notes.page.js";
import { renderPracticePage } from "../pages/practice/practice.page.js";
import { renderAuthPage } from "../pages/auth/auth.page.js";
import { renderAccountPage } from "../pages/account/account.page.js";
import { renderAdminPage } from "../pages/admin/admin.page.js";
import { renderMockTestsPage } from "../pages/tests/tests.page.js";
import { renderDashboardPage } from "../pages/dashboard/dashboard.page.js";
import { hydrateCustomStudyLibraryFromSupabase } from "../features/learning/learning.data.js";

async function renderCurrentPage(root) {
  await hydrateCustomStudyLibraryFromSupabase();
  const route = getCurrentRoute();

  switch (route.name) {
    case ROUTES.HOME:
      renderHomePage(root);
      break;

    case ROUTES.GOVERNMENT:
      renderGovernmentPage(root);
      break;

    case ROUTES.MNC:
      renderMncPage(root);
      break;

    case ROUTES.NOTES:
      renderNotesPage(root);
      break;

    case ROUTES.PRACTICE:
      renderPracticePage(root);
      break;

    case ROUTES.TESTS:
      renderMockTestsPage(root);
      break;

    case ROUTES.DASHBOARD:
      renderDashboardPage(root);
      break;

    case ROUTES.LOGIN:
      renderAuthPage(root);
      break;

    case ROUTES.ACCOUNT:
      renderAccountPage(root);
      break;

    case ROUTES.ADMIN:
      renderAdminPage(root);
      break;

    default:
      navigate(ROUTES.HOME);
  }
}

export function renderApp(root) {
  window.addEventListener("popstate", () => renderCurrentPage(root));

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-route]");
    if (!link) return;

    event.preventDefault();
    navigate(link.dataset.route);
    renderCurrentPage(root);
  });

  renderCurrentPage(root);
}
