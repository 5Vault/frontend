export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    googleRedirect: "/auth/google",
    legacyLogin: "/login/try",
  },
  user: {
    me: "/user/",
    create: "/user/",
    byId: (id: string) => `/user/${id}`,
  },
  key: {
    create: "/key/",
    reset: "/key/reset",
    validate: "/key/validate",
  },
  file: {
    upload: "/file/upload",
    list: "/file/",
    byId: (id: string) => `/file/${id}`,
    stats: "/file/stats",
  },
  bucket: {
    info: "/bucket/",
    setup: "/bucket/setup",
    domainCheck: "/bucket/domain/check",
    files: "/bucket/files",
    fileByKey: (key: string) => `/bucket/files/${encodeURIComponent(key)}`,
  },
  tier: {
    list: "/tier/",
  },
} as const;
