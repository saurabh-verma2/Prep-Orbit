import { ROUTES, navigate, getCurrentRoute } from "./router.js";
import { renderHomePage } from "../pages/home/home.page.js";
import { renderPlaceholderPage } from "../pages/shared/placeholder.page.js";
import { renderGovernmentPage } from "../pages/government/government.page.js";

function renderCurrentPage(root) {
  const route = getCurrentRoute();

  switch (route.name) {
    case ROUTES.HOME:
      renderHomePage(root);
      break;

    case ROUTES.GOVERNMENT:
      renderGovernmentPage(root);
      break;

    case ROUTES.MNC:
      renderPlaceholderPage(root, {
        eyebrow: "MNC / IT",
        title: "MNC & Interview Preparation",
        description:
          "This section will connect Company → Role → Round → Topic → Questions in the next build step.",
      });
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
