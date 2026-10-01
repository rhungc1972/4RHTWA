// Presenter Authentication Utility
// Credentials and session management for Roberto Hung's Remote Presenter Module with 6-Hour Expiration

export const PRESENTER_MASTER_PIN = '2089227';
const PRESENTER_SESSION_KEY = 'rh_presenter_session_v3';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export interface PresenterSessionPayload {
  timestamp: number;
  expiresAt: number;
  role: 'presenter';
}

export function isPresenterAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(PRESENTER_SESSION_KEY) || localStorage.getItem(PRESENTER_SESSION_KEY);
    if (!raw) return false;

    const session: PresenterSessionPayload = JSON.parse(raw);
    const now = Date.now();

    if (session && session.role === 'presenter' && session.expiresAt && now < session.expiresAt) {
      // Sync both storages for persistence across tab reloads
      if (!sessionStorage.getItem(PRESENTER_SESSION_KEY)) {
        sessionStorage.setItem(PRESENTER_SESSION_KEY, raw);
      }
      return true;
    }

    // Session has expired (> 6 hours)
    logoutPresenter();
    return false;
  } catch {
    return false;
  }
}

export function setPresenterAuthenticated(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (authenticated) {
      const now = Date.now();
      const session: PresenterSessionPayload = {
        timestamp: now,
        expiresAt: now + SIX_HOURS_MS,
        role: 'presenter',
      };
      const serialized = JSON.stringify(session);
      sessionStorage.setItem(PRESENTER_SESSION_KEY, serialized);
      localStorage.setItem(PRESENTER_SESSION_KEY, serialized);
    } else {
      sessionStorage.removeItem(PRESENTER_SESSION_KEY);
      localStorage.removeItem(PRESENTER_SESSION_KEY);
    }
    window.dispatchEvent(new CustomEvent('rwa_presenter_auth_changed', { detail: { authenticated } }));
  } catch {
    // ignore
  }
}

export function checkSessionValidity(): boolean {
  const valid = isPresenterAuthenticated();
  if (!valid) {
    logoutPresenter();
  }
  return valid;
}

export function logoutPresenter(): void {
  setPresenterAuthenticated(false);
}

export function getSessionRemainingTimeMs(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = sessionStorage.getItem(PRESENTER_SESSION_KEY) || localStorage.getItem(PRESENTER_SESSION_KEY);
    if (!raw) return 0;
    const session: PresenterSessionPayload = JSON.parse(raw);
    return Math.max(0, (session.expiresAt || 0) - Date.now());
  } catch {
    return 0;
  }
}
