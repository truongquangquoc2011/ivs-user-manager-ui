// ─── API Wrapper ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  message: string;
  data: T;
  success: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullname: string;
  phoneNumber: string;
  groupId: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

export interface UserGroupResponse {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  fullname: string;
  phoneNumber: string;
  status: UserStatus;
  groups: UserGroupResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  email?: string;
  password?: string;
  fullname?: string;
  phoneNumber?: string;
  status?: UserStatus;
  groupIds?: number[];
}

// ─── Group ────────────────────────────────────────────────────────────────────
export interface GroupResponse {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface GroupUserResponse {
  id: number;
  email: string;
  fullname: string;
  phoneNumber: string;
  status: UserStatus;
}

// ─── Permission ───────────────────────────────────────────────────────────────
export interface PermissionResponse {
  featureCode: string;
  featureName: string;
  featurePath: string;
  canView: boolean;
  canEdit: boolean;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface ProfileGroupResponse {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface ProfileResponse {
  id: number;
  email: string;
  fullname: string;
  phoneNumber: string;
  avatar?: string;
  status: UserStatus;
  groups: ProfileGroupResponse[];
  permissions: PermissionResponse[];
}

// ─── Feature ──────────────────────────────────────────────────────────────────
export interface FeatureResponse {
  id: number;
  code: string;
  name: string;
  path: string;
  isActive: boolean;
}

export interface GroupPermission {
  featureCode: string;
  featureName: string;
  featurePath: string;
  canView: boolean;
  canEdit: boolean;
}