
export enum PunishmentType {
  BAN = 'BAN',
  IP_BAN = 'IP_BAN',
  PRISON = 'PRISON',
  MUTE = 'MUTE',
  WARN = 'WARN',
  ORG_WARN = 'ORG_WARN'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum NotificationCategory {
  UPDATE = 'UPDATE',
  PATCH = 'PATCH',
  NOTICE = 'NOTICE',
  NEWS = 'NEWS',
  MAINTENANCE = 'MAINTENANCE'
}

export type AdminLevel = 1 | 2 | 3 | 4 | 5;

export interface LoginRecord {
  id: string;
  username: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED';
  details: string;
}

export interface LogEntry {
  id: string;
  type: PunishmentType;
  user: string;
  orgName?: string;
  ip?: string;
  reason: string;
  duration?: string;
  server?: string;
  admin: string;
  adminLevel: AdminLevel;
  adminIp: string;
  timestamp: string;
  description: string;
  evidenceUrl?: string;
  warnLevel?: string;
  staffDecision?: string;
  isRequest?: boolean;
}

export interface RequestEntry extends Omit<LogEntry, 'adminIp'> {
  status: RequestStatus;
  reviewedBy?: string;
  reviewDate?: string;
  reviewComment?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  level: AdminLevel;
  actionsCount: number;
  lastActive: string;
  avatar?: string;
  mainServer?: string;
  status: 'Online' | 'Offline' | 'Inativo';
  efficiency: number;
  joinedDate: string;
  lastLoginIp: string;
}

export interface UserAuth {
  name: string;
  email: string;
  level: AdminLevel;
  avatar?: string;
  status: 'Online' | 'Offline';
  mainServer: string;
  lastLogin: {
    date: string;
    time: string;
    ip: string;
  };
  efficiency: {
    punishmentsApplied: number;
    requestsCreated: number;
    requestsApproved: number;
    requestsRejected: number;
    avgResponseTime: string;
    precision: number;
  };
}

export interface NotificationEntry {
  id: string;
  title: string;
  content: string;
  category: NotificationCategory;
  author: string;
  authorLevel: AdminLevel;
  timestamp: string;
  isPinned?: boolean;
}
