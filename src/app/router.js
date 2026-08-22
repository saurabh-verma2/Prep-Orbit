export const ROUTES = {
  HOME: "/",
  GOVERNMENT: "/government",
  MNC: "/mnc",
  NOTES: "/notes",
  PRACTICE: "/practice",
  TESTS: "/tests",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  ACCOUNT: "/account",
  ADMIN: "/admin",
};

export function navigate(path) {
  if (window.location.pathname === path) return;

  window.history.pushState({}, "", path);
}

export function getCurrentRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  switch (path) {
    case ROUTES.HOME:
      return { name: ROUTES.HOME };
    case ROUTES.GOVERNMENT:
      return { name: ROUTES.GOVERNMENT };
    case ROUTES.MNC:
      return { name: ROUTES.MNC };
    case ROUTES.NOTES:
      return { name: ROUTES.NOTES };
    case ROUTES.PRACTICE:
      return { name: ROUTES.PRACTICE };
    case ROUTES.TESTS:
      return { name: ROUTES.TESTS };
    case ROUTES.DASHBOARD:
      return { name: ROUTES.DASHBOARD };
    case ROUTES.LOGIN:
      return { name: ROUTES.LOGIN };
    case ROUTES.ACCOUNT:
      return { name: ROUTES.ACCOUNT };
    case ROUTES.ADMIN:
      return { name: ROUTES.ADMIN };
    default:
      return { name: ROUTES.HOME };
  }
}
