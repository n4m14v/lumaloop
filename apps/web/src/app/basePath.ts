export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

const PRODUCT_HUB_PATH = (import.meta.env.VITE_HUB_PATH ?? "/lumaloop").replace(/\/$/, "");

function runtimeBasePath() {
  if (BASE_PATH) {
    return BASE_PATH;
  }

  if (typeof window === "undefined" || !PRODUCT_HUB_PATH) {
    return "";
  }

  const { pathname } = window.location;

  if (pathname === PRODUCT_HUB_PATH || pathname.startsWith(`${PRODUCT_HUB_PATH}/`)) {
    return PRODUCT_HUB_PATH;
  }

  return "";
}

export function withBasePath(path: string) {
  const basePath = runtimeBasePath();

  if (!path.startsWith("/")) {
    return basePath ? `${basePath}/${path}` : `/${path}`;
  }

  return `${basePath}${path}`;
}

export function withoutBasePath(pathname: string) {
  const basePath = runtimeBasePath();

  if (basePath && pathname === basePath) {
    return "/";
  }

  if (basePath && pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length) || "/";
  }

  return pathname;
}
