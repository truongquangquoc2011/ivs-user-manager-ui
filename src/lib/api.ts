import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
  UserRequest,
  GroupResponse,
  GroupRequest,
  GroupUserResponse,
  GroupPermission,
  ProfileResponse,
  FeatureResponse,
} from "@/src/types";

const BASE_URL = "http://localhost:8081";
export type PaginationResponse<T> = {
  items: T[];
  total: number;
  skip: number;
  take: number;
};

export type PaginationParams = {
  skip?: number;
  take?: number;
};
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    const msg = json.message || json.error || "Đã có lỗi xảy ra";

    // Chỉ redirect khi token hết hạn thật sự (401 ngoài auth route)
    if (res.status === 401 && !path.includes("/auth/")) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/";
      }
    }

    // 403 = không có quyền, throw để caller tự xử lý
    const err = new Error(msg) as any;
    err.status = res.status;
    throw err;
  }

  return json;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (body: LoginRequest) =>
    apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  register: (body: RegisterRequest) =>
    apiFetch<null>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: (params?: PaginationParams) => {
    const query = new URLSearchParams();

    if (params?.skip !== undefined) {
      query.set("skip", String(params.skip));
    }

    if (params?.take !== undefined) {
      query.set("take", String(params.take));
    }

    const queryString = query.toString();

    return apiFetch<PaginationResponse<UserResponse>>(
      `/api/v1/users${queryString ? `?${queryString}` : ""}`,
    );
  },
  getById: (id: number) => apiFetch<UserResponse>(`/api/v1/users/${id}`),
  update: (id: number, body: UserRequest) =>
    apiFetch<UserResponse>(`/api/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id: number) =>
    apiFetch<null>(`/api/v1/users/${id}`, { method: "DELETE" }),
};

// ─── Groups ───────────────────────────────────────────────────────────────────
export const groupApi = {
  getAll: () => apiFetch<GroupResponse[]>("/api/v1/groups"),
  create: (body: GroupRequest) =>
    apiFetch<GroupResponse>("/api/v1/groups", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: GroupRequest) =>
    apiFetch<GroupResponse>(`/api/v1/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id: number) =>
    apiFetch<null>(`/api/v1/groups/${id}`, { method: "DELETE" }),
  getUsers: (groupId: number) =>
    apiFetch<GroupUserResponse[]>(`/api/v1/groups/${groupId}/users`),
  addUser: (groupId: number, userId: number) =>
    apiFetch<null>(`/api/v1/groups/${groupId}/users/${userId}`, {
      method: "POST",
    }),
  removeUser: (groupId: number, userId: number) =>
    apiFetch<null>(`/api/v1/groups/${groupId}/users/${userId}`, {
      method: "DELETE",
    }),
  getPermissions: (groupId: number) =>
    apiFetch<GroupPermission[]>(`/api/v1/groups/${groupId}/permissions`),
  updatePermissions: (groupId: number, body: GroupPermission[]) =>
    apiFetch<null>(`/api/v1/groups/${groupId}/permissions`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => apiFetch<ProfileResponse>("/api/v1/profile"),
  update: (body: Partial<ProfileResponse>) =>
    apiFetch<ProfileResponse>("/api/v1/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  changePassword: (body: { oldPassword: string; newPassword: string }) =>
    apiFetch<null>("/api/v1/change-password", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// ─── Features ─────────────────────────────────────────────────────────────────
export const featureApi = {
  getAll: () => apiFetch<FeatureResponse[]>("/api/v1/features"),
};

// ─── Safe fetch helper ────────────────────────────────────────────────────────
// Trả về data nếu thành công, null nếu 403 (không có quyền), throw nếu lỗi khác
export async function safeCall<T>(
  fn: () => Promise<{ data: T }>,
  fallback: T,
): Promise<T> {
  try {
    const res = await fn();
    return res.data;
  } catch (err: any) {
    if (err?.status === 403) return fallback;
    throw err;
  }
}
