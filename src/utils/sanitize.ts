const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const ESCAPE_RE = /[&<>"'/`]/g;

export const escapeHtml = (str: string): string =>
  str.replace(ESCAPE_RE, (char) => HTML_ESCAPE_MAP[char] || char);

export const stripHtml = (str: string): string =>
  str.replace(/<[^>]*>/g, "");

export const sanitizeText = (str: string): string => escapeHtml(stripHtml(str));

export const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export const isAllowedRedirectUrl = (
  url: string,
  allowedDomains: string[],
): boolean => {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      allowedDomains.some(
        (domain) =>
          parsed.hostname === domain ||
          parsed.hostname.endsWith(`.${domain}`),
      )
    );
  } catch {
    return false;
  }
};

export const ALLOWED_PAYMENT_DOMAINS = [
  "stripe.com",
  "js.stripe.com",
  "5keepr.app",
  "cloudflare.com",
];
