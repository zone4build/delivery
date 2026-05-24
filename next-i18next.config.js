const invariant = require('tiny-invariant');
const path = require('path');

// Defaults if env vars are missing
const DEFAULT_LANGUAGE = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';
const AVAILABLE_LANGUAGES = process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES || 'en';

const isMultilangEnable =
  process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === 'true' &&
  !!AVAILABLE_LANGUAGES;

function generateLocales() {
  if (isMultilangEnable) {
    return AVAILABLE_LANGUAGES.split(',');
  }

  return [DEFAULT_LANGUAGE];
}

module.exports = {
  i18n: {
    defaultLocale: DEFAULT_LANGUAGE,
    locales: generateLocales(),
    localeDetection: isMultilangEnable,
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
