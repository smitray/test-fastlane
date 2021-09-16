import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
import i18n from 'i18n-js';

export const translate = memoize(
  (key, config) => {
    const translated = i18n.t(key, {
      ...config,
      defaults: [{message: 'No translation'}],
    });
    return translated;
  },
  (key, config) => (config ? key + JSON.stringify(config) : key),
);
