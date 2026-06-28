type LogFn = (...args: unknown[]) => void;

/**
 * Logger seguro que suprime logs fora de desenvolvimento.
 *
 * Dupla proteção:
 * 1. Este wrapper só emite quando __LOGGER_DEV__ é true
 *    (definido via `define` no vite.config.ts)
 * 2. vite esbuild.drop remove todos os console.* no build de produção
 */
declare const __LOGGER_DEV__: boolean | undefined;

const isDev: boolean =
  typeof __LOGGER_DEV__ !== "undefined" ? __LOGGER_DEV__ : false;

const wrap =
  (fn: LogFn): LogFn =>
  (...args) => {
    if (isDev) fn(...args);
  };

export const logger = {
  log: wrap(console.log),
  warn: wrap(console.warn),
  error: wrap(console.error),
  debug: wrap(console.debug),
} as const;
