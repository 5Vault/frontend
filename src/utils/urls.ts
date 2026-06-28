const rawBase =
  (import.meta.env.VITE_SERVER_URL ?? import.meta.env.VITE_LOCAL_URL ?? "").trim();

export const apiBaseUrl = rawBase.replace(/\/+$/, "");

export const buildApiUrl = (path: string): string => {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//")
  ) {
    return path;
  }
  return `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;
};
