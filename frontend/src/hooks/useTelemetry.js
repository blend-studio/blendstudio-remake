import { useCallback } from 'react';

/**
 * Hook per tracciare le azioni dell'utente.
 * Invia eventi al backend .NET che li salva su MongoDB.
 */
export const useTelemetry = () => {
    const track = useCallback(async (action, metadata = {}, elementId = null) => {
        try {
            const sessionId = sessionStorage.getItem('blend_session_id') ||
                Math.random().toString(36).substring(7);
            sessionStorage.setItem('blend_session_id', sessionId);

            const payload = {
                action,
                page: window.location.pathname,
                element_id: elementId,
                metadata,
                session_id: sessionId
            };

            // Chiamata fire-and-forget al backend .NET
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/telemetry/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }).catch(err => console.error("Telemetry failed:", err));

        } catch (e) {
            // Silenzioso per l'utente
        }
    }, []);

    return { track };
};
