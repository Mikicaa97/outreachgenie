import { createI18n } from 'vue-i18n'
import sr from './locales/sr.json'
import en from './locales/en.json'

export const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'sr',
    messages: { en, sr }
})
