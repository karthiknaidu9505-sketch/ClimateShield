// ─────────────────────────────────────────────────────────────
//  ClimateShield API client — with automatic offline fallback
//  If the backend is unreachable, all requests use mock data.
// ─────────────────────────────────────────────────────────────

// ── Fix 2: Environment-Aware API Base URL Resolution ──────────
// 1. Explicit VITE_API_BASE_URL (for separate frontend/backend deployments like Vercel + Render)
// 2. Production same-origin default: '/api' (when frontend and backend share an origin)
// 3. Local development fallback: 'http://localhost:5000/api'
const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const BASE_URL = envBaseUrl
  ? envBaseUrl.replace(/\/+$/, '')
  : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Singleton: undefined = not yet probed, true/false = known state
let _offlineMode: boolean | undefined = undefined;
let _probePromise: Promise<boolean> | null = null;

/** Probe the backend once per session and cache the result. */
async function probeBackend(): Promise<boolean> {
  if (_offlineMode !== undefined) return _offlineMode;
  if (_probePromise) return _probePromise;

  _probePromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 s timeout
      });
      _offlineMode = !res.ok;
    } catch {
      _offlineMode = true;
    }
    return _offlineMode as boolean;
  })();

  return _probePromise;
}

/** Returns true when the backend is unreachable and mock data should be used. */
export async function isOfflineMode(): Promise<boolean> {
  return probeBackend();
}

/** Returns the cached offline status synchronously (after first probe). */
export function isOfflineModeSync(): boolean {
  return _offlineMode === true;
}

/** Force-refresh the backend probe (useful after network changes). */
export function resetProbe(): void {
  _offlineMode = undefined;
  _probePromise = null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('climateshield_token');
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // no JSON body
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
