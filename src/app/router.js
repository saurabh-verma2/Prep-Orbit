export const ROUTES = {
  HOME: "/",
  GOVERNMENT: "/government",
  MNC: "/mnc",
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
    default:
      return { name: ROUTES.HOME };
  }
}
