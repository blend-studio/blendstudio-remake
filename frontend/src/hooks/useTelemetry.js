import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ANALYTICS_BASE = import.meta.env.VITE_ANALYTICS_BASE_URL || 'http://localhost:8001';

/**
 * Genera un session ID stabile per la sessione browser.
 * Formato: 8 caratteri hex casuali.
 */
function getOrCreateSessionId() {
    let id = sessionStorage.getItem('blend_session_id');
    if (!id) {
        id = Array.from(crypto.getRandomValues(new Uint8Array(4)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        sessionStorage.setItem('blend_session_id', id);
    }
    return id;
}

/**
 * Hook per tracciare azioni utente + page view automatici.
 * Salva su MongoDB via backend .NET (fire-and-forget).
 */
export const useTelemetry = () => {
    const location = useLocation();
    const lastPage = useRef(null);

    const track = useCallback((action, metadata = {}, elementId = null) => {
        try {
            const sessionId = getOrCreateSessionId();
            const payload = {
                action,
                page: window.location.pathname,
                elementId: elementId ?? undefined,
                metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
                sessionId,
                referrer: document.referrer || undefined,
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenW: window.screen.width,
                screenH: window.screen.height,
            };

            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/telemetry/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }).catch(() => {}); // silenzioso
        } catch (_) {
            // mai bloccare l'UI
        }
    }, []);

    // Auto page-view ad ogni cambio di route
    useEffect(() => {
        const page = location.pathname;
        if (page === lastPage.current) return;
        lastPage.current = page;
        track('page_view', { title: document.title });
    }, [location.pathname, track]);

    return { track };
};

// ── API lettura analytics (dal servizio Python) ───────────────────────────
export const fetchAnalyticsStats = () =>
    fetch(`${ANALYTICS_BASE}/stats`).then(r => r.ok ? r.json() : null).catch(() => null);

export const fetchAnalyticsTrends = (days = 30) =>
    fetch(`${ANALYTICS_BASE}/trends?days=${days}`).then(r => r.ok ? r.json() : []).catch(() => []);

export const fetchTopPages = (limit = 10) =>
    fetch(`${ANALYTICS_BASE}/top-pages?limit=${limit}`).then(r => r.ok ? r.json() : []).catch(() => []);

export const fetchTopActions = (limit = 10) =>
    fetch(`${ANALYTICS_BASE}/top-actions?limit=${limit}`).then(r => r.ok ? r.json() : []).catch(() => []);

export const fetchRecentEvents = (page = 1, limit = 50) =>
    fetch(`${ANALYTICS_BASE}/events?page=${page}&limit=${limit}`).then(r => r.ok ? r.json() : null).catch(() => null);

export const fetchDeviceStats = () =>
    fetch(`${ANALYTICS_BASE}/device-stats`).then(r => r.ok ? r.json() : null).catch(() => null);

export const fetchSessionStats = () =>
    fetch(`${ANALYTICS_BASE}/session-stats`).then(r => r.ok ? r.json() : null).catch(() => null);

export const fetchReferrerStats = (limit = 10) =>
    fetch(`${ANALYTICS_BASE}/referrer-stats?limit=${limit}`).then(r => r.ok ? r.json() : []).catch(() => []);

export const fetchFunnelStats = () =>
    fetch(`${ANALYTICS_BASE}/funnel`).then(r => r.ok ? r.json() : null).catch(() => null);

/**
 * Hook per tracciare la profondità di scroll della pagina.
 * Emette un evento "scroll_depth" la prima volta che l'utente raggiunge
 * il 25%, 50%, 75% e 100% della pagina. Si resetta ad ogni cambio route.
 */
export const useScrollDepth = () => {
    const location = useLocation();
    const { track } = useTelemetry();
    const reached = useRef(new Set());

    useEffect(() => {
        // Reset ad ogni cambio di pagina
        reached.current = new Set();

        const checkDepth = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            const pct = Math.round((scrollTop / docHeight) * 100);

            for (const milestone of [25, 50, 75, 100]) {
                if (pct >= milestone && !reached.current.has(milestone)) {
                    reached.current.add(milestone);
                    track('scroll_depth', { depth: milestone, page: window.location.pathname });
                }
            }
        };

        window.addEventListener('scroll', checkDepth, { passive: true });
        return () => window.removeEventListener('scroll', checkDepth);
    }, [location.pathname, track]);
};
