
export interface Group {
  id: number;
  groupName: string;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  fullName: string;
  groupName: string;
  status: 'active' | 'locked';
}

export interface Permission {
  screenCode: string;
  screenName: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}