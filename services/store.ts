
import { LogEntry, Admin, RequestEntry, NotificationEntry, UserAuth, LoginRecord } from '../types';
import { INITIAL_LOGS, INITIAL_ADMINS, INITIAL_REQUESTS, INITIAL_NOTIFICATIONS, MOCK_USER } from '../constants';

const DB_KEYS = {
  LOGS: 'sentinel_db_logs',
  ADMINS: 'sentinel_db_admins',
  REQUESTS: 'sentinel_db_requests',
  NOTICES: 'sentinel_db_notices',
  USER: 'sentinel_db_current_user',
  LOGINS: 'sentinel_db_logins_history'
};

class SentinelDB {
  private static instance: SentinelDB;

  private constructor() {
    this.init();
  }

  public static getInstance(): SentinelDB {
    if (!SentinelDB.instance) {
      SentinelDB.instance = new SentinelDB();
    }
    return SentinelDB.instance;
  }

  private init() {
    // Garante que cada "arquivo" tenha pelo menos um array vazio ou dados iniciais
    if (!localStorage.getItem(DB_KEYS.LOGS)) localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    if (!localStorage.getItem(DB_KEYS.ADMINS)) localStorage.setItem(DB_KEYS.ADMINS, JSON.stringify(INITIAL_ADMINS));
    if (!localStorage.getItem(DB_KEYS.REQUESTS)) localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    if (!localStorage.getItem(DB_KEYS.NOTICES)) localStorage.setItem(DB_KEYS.NOTICES, JSON.stringify(INITIAL_NOTIFICATIONS));
    if (!localStorage.getItem(DB_KEYS.USER)) localStorage.setItem(DB_KEYS.USER, JSON.stringify(MOCK_USER));
    if (!localStorage.getItem(DB_KEYS.LOGINS)) localStorage.setItem(DB_KEYS.LOGINS, JSON.stringify([]));
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  private downloadJSON(data: any, fileName: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }

  public exportFile(fileName: 'logins.json' | 'admins.json' | 'logs.json' | 'full_backup.json') {
    switch(fileName) {
      case 'logins.json':
        this.downloadJSON(JSON.parse(localStorage.getItem(DB_KEYS.LOGINS) || '[]'), 'logins.json');
        break;
      case 'admins.json':
        this.downloadJSON(JSON.parse(localStorage.getItem(DB_KEYS.ADMINS) || '[]'), 'admins.json');
        break;
      case 'logs.json':
        this.downloadJSON(JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]'), 'logs.json');
        break;
      case 'full_backup.json':
        const full = {
          logins: JSON.parse(localStorage.getItem(DB_KEYS.LOGINS) || '[]'),
          admins: JSON.parse(localStorage.getItem(DB_KEYS.ADMINS) || '[]'),
          logs: JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]'),
          requests: JSON.parse(localStorage.getItem(DB_KEYS.REQUESTS) || '[]'),
          exportedAt: new Date().toISOString()
        };
        this.downloadJSON(full, 'sentinel_full_backup.json');
        break;
    }
  }

  public getRawFileContent(fileKey: 'LOGINS' | 'ADMINS' | 'LOGS'): string {
    const storageKey = DB_KEYS[fileKey];
    const content = localStorage.getItem(storageKey);
    // Sempre retorna um JSON válido (stringified)
    return content || '[]';
  }

  public getRawDBSize(): string {
    let total = 0;
    for (const key in DB_KEYS) {
      total += (localStorage.getItem((DB_KEYS as any)[key]) || "").length;
    }
    return (total / 1024).toFixed(2) + " KB";
  }

  async getLoginHistory(): Promise<LoginRecord[]> {
    return JSON.parse(localStorage.getItem(DB_KEYS.LOGINS) || '[]');
  }

  async recordLogin(record: Omit<LoginRecord, 'id' | 'timestamp'>): Promise<void> {
    const history = await this.getLoginHistory();
    const newRecord: LoginRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    history.unshift(newRecord);
    localStorage.setItem(DB_KEYS.LOGINS, JSON.stringify(history));
  }

  async getLogs(): Promise<LogEntry[]> {
    return JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
  }

  async saveLog(log: LogEntry): Promise<void> {
    const logs = await this.getLogs();
    const index = logs.findIndex(l => l.id === log.id);
    if (index > -1) logs[index] = log;
    else logs.unshift(log);
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
  }

  async deleteLog(id: string): Promise<void> {
    const logs = await this.getLogs();
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs.filter(l => l.id !== id)));
  }

  async getAdmins(): Promise<Admin[]> {
    return JSON.parse(localStorage.getItem(DB_KEYS.ADMINS) || '[]');
  }

  async saveAdmin(admin: Admin): Promise<void> {
    const admins = await this.getAdmins();
    const index = admins.findIndex(a => a.id === admin.id);
    if (index > -1) admins[index] = admin;
    else admins.push(admin);
    localStorage.setItem(DB_KEYS.ADMINS, JSON.stringify(admins));
  }

  async deleteAdmin(id: string): Promise<void> {
    const admins = await this.getAdmins();
    localStorage.setItem(DB_KEYS.ADMINS, JSON.stringify(admins.filter(a => a.id !== id)));
  }

  async getRequests(): Promise<RequestEntry[]> {
    return JSON.parse(localStorage.getItem(DB_KEYS.REQUESTS) || '[]');
  }

  async saveRequest(req: RequestEntry): Promise<void> {
    const requests = await this.getRequests();
    const index = requests.findIndex(r => r.id === req.id);
    if (index > -1) requests[index] = req;
    else requests.unshift(req);
    localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify(requests));
  }

  async getCurrentUser(): Promise<UserAuth> {
    const data = localStorage.getItem(DB_KEYS.USER);
    return data ? JSON.parse(data) : MOCK_USER;
  }

  async updateCurrentUser(user: UserAuth): Promise<void> {
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
  }

  async getNotifications(): Promise<NotificationEntry[]> {
    return JSON.parse(localStorage.getItem(DB_KEYS.NOTICES) || '[]');
  }

  async saveNotification(notice: NotificationEntry): Promise<void> {
    const notices = await this.getNotifications();
    notices.unshift(notice);
    localStorage.setItem(DB_KEYS.NOTICES, JSON.stringify(notices));
  }

  async deleteNotification(id: string): Promise<void> {
    const notices = await this.getNotifications();
    localStorage.setItem(DB_KEYS.NOTICES, JSON.stringify(notices.filter(n => n.id !== id)));
  }
}

export const db = SentinelDB.getInstance();
