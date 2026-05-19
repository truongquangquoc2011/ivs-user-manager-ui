import { Group, User, Permission } from "../types";

export const MOCK_GROUPS: Group[] = [
  { id: 1, groupName: "HR" },
  { id: 2, groupName: "Manager" },
  { id: 3, groupName: "Admin" },
];

export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: "admin_vivi",
    password: "123",
    fullName: "Mai Kỳ Vĩ",
    groupName: "Admin",
    status: "active",
  },
  {
    id: 2,
    username: "huy_tech",
    password: "456",
    fullName: "Anh Huy",
    groupName: "Manager",
    status: "active",
  },
  {
    id: 3,
    username: "user_test",
    password: "789",
    fullName: "Nguyễn Văn A",
    groupName: "HR",
    status: "locked",
  },
];

export const MOCK_PERMISSIONS: Permission[] = [
  {
    screenCode: "USER_MGMT",
    screenName: "Quản lý người dùng",
    canView: true,
    canAdd: false,
    canEdit: false,
    canDelete: false,
  },
  {
    screenCode: "GROUP_MGMT",
    screenName: "Quản lý nhóm",
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: false,
  },
  {
    screenCode: "REPORT",
    screenName: "Báo cáo hệ thống",
    canView: true,
    canAdd: false,
    canEdit: false,
    canDelete: false,
  },
  {
    screenCode: "PASSWORD",
    screenName: "Đổi mật khẩu",
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: true,
  },
];

export const ROLE_SETTINGS: any = {
  HR: {
    viewA: true,
    editA: false,
    viewB: true,
    editB: false,
    viewC: false,
    editC: false,
  },
  Manager: {
    viewA: true,
    editA: true,
    viewB: true,
    editB: false,
    viewC: true,
    editC: true,
  },
  Admin: {
    viewA: true,
    editA: true,
    viewB: true,
    editB: true,
    viewC: true,
    editC: true,
  },
};
