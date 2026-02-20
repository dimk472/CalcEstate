const FALLBACK_ROUTE = "/tabs";

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
    const rawPath = (path ?? "").trim();

    if (!rawPath || rawPath === "/" || rawPath === "//" || rawPath === "///") {
        return FALLBACK_ROUTE;
    }

    const withoutScheme = rawPath.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
    const slashIndex = withoutScheme.indexOf("/");
    const routePath = slashIndex >= 0 ? withoutScheme.slice(slashIndex) : "";

    if (!routePath || routePath === "/") {
        return FALLBACK_ROUTE;
    }

    return routePath.startsWith("/") ? routePath : `/${routePath}`;
}