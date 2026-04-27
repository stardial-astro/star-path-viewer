// src/lib/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const isTest = import.meta.env.VITEST;

const instance = i18n.use(LanguageDetector).use(initReactI18next);
if (!isTest) instance.use(Backend);

/* Export the initialization promise */
export const i18nPromise = instance.init({
  debug: !isTest && import.meta.env.DEV, // TODO: set false in prod
  // debug: false,
  fallbackLng: 'en',
  supportedLngs: ['en', 'zh', 'zh-HK'],
  load: 'all',
  // preload: ['en'], // Forces these to load immediately (do this if not useSuspense)
  ns: ['common', 'errors', 'notice', 'output'], // Initial namespaces to load
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  ...(!isTest
    ? { backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' } }
    : {
        resources: { en: { common: {}, errors: {}, notice: {}, output: {} } },
      }),
  react: {
    useSuspense: !isTest,
  },
});

export default i18n;
