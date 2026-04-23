// src/utils/devMode.js

/** The fragment identifier list from the hash of the URL (lowercase). */
const hashSet = new Set(
  window.location.hash.substring(1).toLowerCase().split('&'),
);

/** `true` if hash includes `'cn'`, `'baidu'`, `'qq'`, or `'tianditu'`. */
export const forceInCn = ['cn', 'baidu', 'qq', 'tianditu'].some((item) =>
  hashSet.has(item),
);
/** `true` if hash includes `'baidu'`. */
export const forceBaidu = hashSet.has('baidu'); // use Baidu for both search and reverse geocoding
/** `true` if hash includes `'qq'`, overriding `'baidu'`. */
export const forceQq = hashSet.has('qq'); // use QQ for both search and reverse geocoding
/** `true` if hash includes `'tianditu'`, overriding others when setting the reverse geocoding service. */
export const forceTianditu = hashSet.has('tianditu'); // use Tianditu for reverse geocoding

/** `true` if in development environment or hashes include `'dev'`. */
export const isDevMode = import.meta.env.DEV || hashSet.has('dev');

/** `true` if hashes include `'today'`. */
export const isToday = hashSet.has('today');
