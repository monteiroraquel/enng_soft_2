const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001";
const TOKEN_KEY = "bytehub-api-token";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "president";
  area?: string | null;
};

export type ApiGuild = {
  id: string;
  name: string;
  short: string;
  level: string;
  color: string;
  memberCount: number;
};

export type ApiEvent = {
  id: string;
  title: string;
  category: string;
  startsAt: string;
  location: string;
  description: string;
  isDemo: boolean;
};

export type ApiIdea = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "Pendente" | "Aprovada" | "Recusada";
  createdAt: string;
  author: { id: string; name: string; email: string };
};

export type ApiCertificate = {
  id: string;
  name: string;
  size: string;
  mimeType: string | null;
  addedAt: string;
};

type AuthResponse = { user: ApiUser; token: string };

export function getApiToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveApiToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearApiToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getApiToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("Não foi possível conectar à API. Confira se o backend está rodando na porta 3001.");
  }

  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    if (response.status === 401 && token) {
      clearApiToken();
      window.dispatchEvent(new Event("bytehub:auth-expired"));
    }
    throw new Error(payload.error ?? `Erro na API (${response.status}).`);
  }
  return payload as T;
}

export async function login(login: string, password: string) {
  const result = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
  saveApiToken(result.token);
  return result.user;
}

export async function registerStudent(name: string, email: string, password: string) {
  const result = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  saveApiToken(result.token);
  return result.user;
}

export function currentUser() {
  return apiRequest<ApiUser>("/auth/me");
}
