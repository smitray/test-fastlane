import i18n from 'i18n-js'
import RNLocalize from 'react-native-localize'
import en from './translations/en.json'
import { translate } from './translate'
import { I18nManager } from 'react-native'

const DEFAULT_RTL = false
const DEFAULT_LOCALE = 'en'
const translationGetters = {
  en,
}

export const setI18nConfig = () => {
  // fallback if no available language fits
  const fallback = { languageCode: DEFAULT_LOCALE, isRTL: DEFAULT_RTL }

  const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback

  // clear translation cache
  translate.cache.clear()
  // update layout direction
  I18nManager.forceRTL(isRTL)
  // set i18n-js config
  i18n.translations = { [languageTag]: translationGetters[languageTag] }
  i18n.locale = languageTag
}

export const getLocale = () => {
  // fallback if no available language fits
  const fallback = { languageTag: DEFAULT_LOCALE, isRTL: DEFAULT_RTL }
  const { languageTag } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback
  return languageTag
}
