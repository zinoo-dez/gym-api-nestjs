const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(
  /\/api\/?$/,
  "",
);

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  const uriDecoded = (() => {
    try {
      return decodeURIComponent(trimmed);
    } catch {
      return trimmed;
    }
  })();

  const decoded = decodeHtmlEntities(uriDecoded);

  if (/^https?:\/\//i.test(decoded) || decoded.startsWith("data:") || decoded.startsWith("blob:")) {
    return decoded;
  }

  // Keep protocol-relative URLs for known host patterns.
  if (/^\/\/((localhost|127\.0\.0\.1|::1)(:\d+)?|[a-z0-9.-]+\.[a-z]{2,}(:\d+)?)/i.test(decoded)) {
    return decoded;
  }

  const normalizedPath = decoded.replace(/^\/{2,}/, "/");
  return `${API_BASE}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
};

