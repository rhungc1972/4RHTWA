// Presenter Authentication Utility
// Credentials and session management for Roberto Hung's Remote Presenter Module

const PRESENTER_SESSION_TOKEN = 'rh_presenter_auth_token_v2';

export const PRESENTER_MASTER_PIN = '2089227';
export const VALID_PRESENTER_USERS = ['robertohung', 'rhungc@gmail.com', 'admin', 'roberto', 'rhung'];
export const VALID_PRESENTER_PASSWORDS = ['2089227', 'rhung2026', '2026', 'rwa2026', '1234'];

export function validatePresenterCredentials(username: string, pass: string): boolean {
  const user = String(username || '').trim().toLowerCase();
  const password = String(pass || '').trim();

  const isUserValid =
    VALID_PRESENTER_USERS.includes(user) ||
    user.includes('roberto') ||
    user.includes('hung');

  const isPassValid =
    VALID_PRESENTER_PASSWORDS.includes(password) ||
    password === 'rhung2026';

  return isUserValid && isPassValid;
}

export function isPresenterAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const sessionToken = sessionStorage.getItem(PRESENTER_SESSION_TOKEN);
    const localToken = localStorage.getItem(PRESENTER_SESSION_TOKEN);
    return Boolean(sessionToken || localToken);
  } catch {
    return false;
  }
}

export function setPresenterAuthenticated(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (authenticated) {
      const token = `rh_auth_${Date.now()}`;
      sessionStorage.setItem(PRESENTER_SESSION_TOKEN, token);
      localStorage.setItem(PRESENTER_SESSION_TOKEN, token);
    } else {
      sessionStorage.removeItem(PRESENTER_SESSION_TOKEN);
      localStorage.removeItem(PRESENTER_SESSION_TOKEN);
    }
  } catch {
    // ignore
  }
}

export function logoutPresenter(): void {
  setPresenterAuthenticated(false);
}
