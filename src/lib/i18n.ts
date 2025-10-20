import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Dynamic import of translation files
const loadResources = async () => {
  const enTranslation = await import('@/locales/en/translation.json');
  const swTranslation = await import('@/locales/sw/translation.json');
  const arTranslation = await import('@/locales/ar/translation.json');

  return {
    en: {
      translation: enTranslation.default
    },
    sw: {
      translation: swTranslation.default
    },
    ar: {
      translation: arTranslation.default
    }
  };
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    // RTL support for Arabic
    react: {
      useSuspense: false
    }
  });

// Load resources and add them to i18n
loadResources().then(resources => {
  Object.keys(resources).forEach(lang => {
    i18n.addResourceBundle(lang, 'translation', resources[lang as keyof typeof resources].translation);
  });
  
  // Set initial language from localStorage or default to 'en'
  const savedLanguage = localStorage.getItem('language') || 'en';
  i18n.changeLanguage(savedLanguage);
  document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = savedLanguage;
});

export default i18n;