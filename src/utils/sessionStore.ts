import type { UserType } from "../@types/UserTypes";

type SessionSnapshot = {
  user: UserType | null;
  userToken: string | null;
};

const STORAGE_KEY = "@fivekeepr/session";

const loadSnapshot = (): SessionSnapshot => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore parse errors — start fresh
  }

  // Migrate from the old "token" key used by the previous auth system
  const legacyToken = localStorage.getItem("token");
  if (legacyToken) {
    localStorage.removeItem("token");
    return { user: null, userToken: legacyToken };
  }

  return { user: null, userToken: null };
};

const snapshot: SessionSnapshot = loadSnapshot();

const saveSnapshot = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

export const sessionStore = {
  getUser: (): UserType | null => snapshot.user,
  setUser: (user: UserType | null) => {
    snapshot.user = user;
    saveSnapshot();
  },
  getUserToken: (): string | null => snapshot.userToken,
  setUserToken: (token: string | null) => {
    snapshot.userToken = token;
    saveSnapshot();
  },
  clearAll: () => {
    snapshot.user = null;
    snapshot.userToken = null;
    localStorage.removeItem(STORAGE_KEY);
  },
};
