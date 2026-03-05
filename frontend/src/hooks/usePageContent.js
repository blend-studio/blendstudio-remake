import { useState, useEffect } from 'react';
import { getContent } from '../services/api';

/**
 * Hook per recuperare i contenuti di una pagina da MongoDB.
 * Fa merge tra i dati di default (hardcoded) e quelli salvati su MongoDB.
 * In caso di errore o assenza di dati, usa il fallback.
 *
 * @param {string} slug - Slug della pagina (es. "home", "about")
 * @param {object} defaultData - Dati di default hardcoded come fallback
 * @returns {{ content: object, loading: boolean }}
 */
const usePageContent = (slug, defaultData) => {
  const [content, setContent] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getContent(slug)
      .then((res) => {
        if (cancelled) return;
        const mongoData = res?.data ?? res;
        if (mongoData && typeof mongoData === 'object') {
          // Deep merge: MongoDB sovrascrive i default chiave per chiave
          setContent((prev) => deepMerge(prev, mongoData));
        }
      })
      .catch(() => {
        // Fallback silenzioso ai dati hardcoded
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  return { content, loading };
};

/** Merge ricorsivo: i valori di `override` sovrascrivono quelli di `base` */
function deepMerge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) {
    return override !== undefined ? override : base;
  }
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      key in result &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key]) &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

export default usePageContent;
