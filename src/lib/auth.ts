import { cfg } from './config';

export interface AuthSession {
  loggedIn: boolean;
  timestamp: number;
}

const AUTH_STORAGE_KEY = 'vgu_blood_finder_auth';

export const auth = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!session) return false;
      
      const data: AuthSession = JSON.parse(session);
      return data.loggedIn === true;
    } catch {
      return false;
    }
  },

  // Login with email and password
  login(email: string, password: string): boolean {
    // Validate against environment variables
    if (email.trim() !== cfg.adminEmail || password !== cfg.adminPassword) {
      return false;
    }

    // Store session
    const session: AuthSession = {
      loggedIn: true,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return true;
  },

  // Logout
  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Get session data
  getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!session) return null;
      
      return JSON.parse(session);
    } catch {
      return null;
    }
  }
};