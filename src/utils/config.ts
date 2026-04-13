// src/utils/config.ts
const config = {
  BASE_URL: 'https://star-path-viewer.pages.dev/',
  HEAD_TITLE: 'Star Path Viewer: Trace Planets & Stars',
  TEAM_NAME: 'Stardial',
  TEAM_URL: 'https://github.com/stardial-astro',
  REPO_URL: 'https://github.com/stardial-astro/star-path-viewer',
  APP_CARD_URL: 'https://stardial-astro.github.io/star-path-data/images/star-path-viewer_card.jpg',
  STAR_NAMES_URL: '/data/hip_ident_zh.json',
  /** Defaults to 2. */
  MAX_RETRIES: parseInt(import.meta.env.VITE_MAX_RETRIES) || 2,
  /** Defaults to 500ms. */
  RETRY_DELAY: parseInt(import.meta.env.VITE_RETRY_DELAY) || 500,
  /** 30 seconds */
  RETRY_DELAY_MAX: 30_000,
  /** Resumed query delay after reconnect: 500ms */
  RESUME_DELAY: 500,
  /** Online status delay for queries: 500ms */
  ONLINE_DELAY: 500,
  /** Defaults to 1 minute. */
  SERVER_TIMEOUT: parseInt(import.meta.env.VITE_SERVER_TIMEOUT) || 60_000,
  /** Defaults to 1 minute. */
  SERVER_DIAGRAM_TIMEOUT:
    parseInt(import.meta.env.VITE_SERVER_DIAGRAM_TIMEOUT) || 60_000,
  /** Defaults to 300ms. */
  TYPING_DELAY: parseInt(import.meta.env.VITE_TYPING_DELAY) || 300,
  /** 10 times */
  TRIGGER_DEV_CLICK_COUNT: 10,
} as const;

export default config;
