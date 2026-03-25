import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import es from "./locales/es.json";
import en from "./locales/en.json";

// Recursos de traducción
const resources = {
  es: { translation: es },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es", // idioma por defecto
  fallbackLng: "es", // idioma de respaldo si falta una traducción
  interpolation: {
    escapeValue: false, // React ya escapa los valores
  },
});

export default i18n;