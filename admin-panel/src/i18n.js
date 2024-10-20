import i18 from "i18next";
import { initReactI18next } from "react-i18next";
import i18nBackend from "i18next-http-backend";
import Dashboard from "./views/dashboard/Dashboard";

i18.use(i18nBackend).use(initReactI18next).init({
    lng: "ar",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    backend: {
        loadPath: "http://localhost:3000/i18n/{{lng}}.json",
      }, 
    
  });
export default i18;
