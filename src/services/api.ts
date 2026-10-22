interface ApiErrorBody { code?: string; message?: string }
export interface AuthUser { id: string; email: string; displayName: string; avatarUrl?: string; level: number; createdAt: string }

function readCsrfCookie(): string | null {
  const cookie = document.cookie.split("; ").find((item) => item.startsWith("XSRF-TOKEN="));
  return cookie ? decodeURIComponent(cookie.slice("XSRF-TOKEN=".length)) : null;
}

async function loadCsrfToken(): Promise<string> {
  const response = await fetch("/api/auth/csrf", { credentials: "include" });
  if (!response.ok) throw new Error("Không lấy được mã bảo vệ CSRF. Hãy tải lại trang rồi thử lại.");
  const body = await response.json().catch(() => null) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token : readCsrfCookie();
  if (!token) throw new Error("Không khởi tạo được bảo vệ CSRF. Hãy tải lại trang rồi thử lại.");
  return token;
}

export async function apiRequest<TResponse>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  payload?: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<TResponse> {
  const headers: Record<string, string> = { ...extraHeaders };
  const isFormData = payload instanceof FormData;
  if (method !== "GET") {
    headers["X-XSRF-TOKEN"] = await loadCsrfToken();
    if (payload !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  }
  const response = await fetch(path, {
    method,
    credentials: "include",
    headers,
    body: payload === undefined ? undefined : isFormData ? payload : JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorBody;
    throw new Error(body.message ?? "Yêu cầu chưa thực hiện được. Vui lòng thử lại.");
  }
  return response.status === 204 ? undefined as TResponse : response.json() as Promise<TResponse>;
}

export const authApi = {
  login(email: string, password: string): Promise<AuthUser> {
    return apiRequest<AuthUser>("/api/auth/login", "POST", { email, password });
  },
  register(email: string, password: string, displayName: string): Promise<AuthUser> {
    return apiRequest<AuthUser>("/api/auth/register", "POST", { email, password, displayName })
  },
  me(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/api/auth/me", "GET")
  },
};