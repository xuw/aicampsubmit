import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh-CN.json';

// Get saved language from localStorage or default to Chinese
const savedLanguage = localStorage.getItem('i18nextLng') || 'zh-CN';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      'zh-CN': {
        translation: zhTranslations,
      },
    },
    lng: savedLanguage, // Use saved language or default to Chinese
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Save language preference whenever it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
