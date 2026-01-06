
import React from 'react';
import { PunishmentType, LogEntry, Admin, AdminLevel, NotificationEntry, NotificationCategory, RequestEntry, RequestStatus, UserAuth } from './types';
import { Shield, Ban, Lock, MicOff, AlertTriangle, Settings, Download, Trophy, LayoutDashboard, Users2, Bell, Gavel, ClipboardList, Clock, History, UserCheck, PlusCircle, User, Search, ShieldAlert, MonitorCheck } from 'lucide-react';

export const LEVEL_NAMES: Record<AdminLevel, string> = {
  1: 'Moderador Básico (LV1)',
  2: 'Moderador Avançado (LV2)',
  3: 'Supervisor (LV3)',
  4: 'Gerente (LV4)',
  5: 'Staff Geral (MASTER)',
};

export const SERVERS = [
  "Servidor 1",
  "Servidor 2",
  "Servidor RP Principal",
  "Servidor de Testes"
];

export const MOCK_USER: UserAuth = {
  name: 'Admin Master',
  email: 'master@sentinel.io',
  level: 5,
  avatar: '',
  status: 'Online',
  mainServer: 'Servidor RP Principal',
  lastLogin: {
    date: '06/01/2026',
    time: '18:42',
    ip: '189.124.55.201'
  },
  efficiency: {
    punishmentsApplied: 142,
    requestsCreated: 45,
    requestsApproved: 38,
    requestsRejected: 7,
    avgResponseTime: '3min',
    precision: 84
  }
};

export const MENU_GROUPS = [
  {
    label: 'Pessoal',
    items: [
      { label: 'Meu Perfil', icon: <User size={18} />, path: '/profile' },
      { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
      { label: 'Notificações', icon: <Bell size={18} />, path: '/notifications' },
    ]
  },
  {
    label: 'Segurança & Auditoria',
    items: [
      { label: 'Log de Acessos', icon: <MonitorCheck size={18} />, path: '/security/logins' },
      { label: 'Ranking Staff', icon: <Trophy size={18} />, path: '/ranking' },
    ]
  },
  {
    label: 'Sessão Punição',
    items: [
      { label: 'Banimentos', icon: <Ban size={18} />, path: '/logs/ban' },
      { label: 'Prisão / Mute', icon: <Gavel size={18} />, path: '/logs/disciplinary' },
      { label: 'WARN (Jogador)', icon: <AlertTriangle size={18} />, path: '/logs/warn' },
      { label: 'WARN Org / Facção', icon: <Users2 size={18} />, path: '/logs/org' },
    ]
  },
  {
    label: 'Solicitações',
    items: [
      { label: 'Solicitar Punição', icon: <PlusCircle size={18} />, path: '/requests/new' },
      { label: 'Pendentes', icon: <Clock size={18} />, path: '/requests/pending' },
      { label: 'Histórico', icon: <History size={18} />, path: '/requests/history' },
    ]
  },
  {
    label: 'Sistema',
    items: [
      { label: 'Configurações JSON', icon: <Settings size={18} />, path: '/settings' },
    ]
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: '1',
    type: PunishmentType.BAN,
    user: 'PlayerOne',
    ip: '192.168.1.10',
    reason: 'Uso de hack (Fly/Speed/Aimbot)',
    admin: 'Admin Master',
    adminLevel: 5,
    adminIp: '10.0.0.1',
    timestamp: new Date().toISOString(),
    description: 'O jogador foi pego voando na arena principal.',
    server: 'Servidor RP Principal',
    duration: 'Permanente'
  }
];

export const INITIAL_REQUESTS: RequestEntry[] = [
  {
    id: 'req-1',
    type: PunishmentType.BAN,
    user: 'Toxic_Gamer_22',
    reason: 'Uso de hack (Fly/Speed/Aimbot)',
    duration: 'Permanente',
    server: 'Servidor RP Principal',
    admin: 'Admin Master',
    adminLevel: 5,
    timestamp: new Date().toISOString(),
    description: 'Solicito banimento após flagrante de speed hack na corrida ilegal.',
    status: RequestStatus.PENDING,
    evidenceUrl: 'https://drive.google.com/file/d/demo/view'
  }
];

export const INITIAL_ADMINS: Admin[] = [
  { 
    id: '1', 
    name: 'Admin Master', 
    email: 'master@sentinel.io', 
    level: 5, 
    actionsCount: 1542, 
    lastActive: 'Hoje às 18:42', 
    mainServer: 'Principal',
    status: 'Online',
    efficiency: 98,
    joinedDate: '01/01/2024',
    lastLoginIp: '189.124.55.201'
  },
  { 
    id: '2', 
    name: 'Gerente Carlos', 
    email: 'carlos@sentinel.io', 
    level: 4, 
    actionsCount: 850, 
    lastActive: 'Hoje às 16:30', 
    mainServer: 'Principal',
    status: 'Online',
    efficiency: 91,
    joinedDate: '15/03/2024',
    lastLoginIp: '177.45.22.10'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationEntry[] = [
  {
    id: 'n1',
    title: 'Manutenção do Banco de Dados',
    content: 'O sistema passará por manutenção preventiva no próximo domingo às 04:00 AM.',
    category: NotificationCategory.MAINTENANCE,
    author: 'Staff Master',
    authorLevel: 5,
    timestamp: new Date().toISOString(),
    isPinned: true
  }
];

export const canExecuteAction = (level: AdminLevel, action: PunishmentType): boolean => {
  if (level === 5) return true;
  switch (action) {
    case PunishmentType.MUTE:
    case PunishmentType.PRISON:
      return level >= 1;
    case PunishmentType.BAN:
    case PunishmentType.WARN:
    case PunishmentType.ORG_WARN:
      return level >= 2;
    default:
      return false;
  }
};

export const ORG_WARN_LEVELS = [
  "Advertência Leve",
  "Advertência Média",
  "Advertência Grave",
  "Último Aviso",
  "Advertência Administrativa"
];

export const ORG_SUGGESTIONS = [
  "Comando Vermelho",
  "PCC",
  "Ballas",
  "Grove Street",
  "Vagos",
  "Mafia Italiana",
  "Yakuza",
  "Cartel de Medellin"
];

export const PREDEFINED_REASONS = {
  ADMINISTRATIVO: ["Quebra de regras", "Desobediência"],
  TRAPACAS: ["Uso de hack", "Abuso de bug"],
  ROLEPLAY: ["Anti-RP", "RDM", "VDM"],
  COMPORTAMENTO: ["Ofensa", "Toxicidade"],
  ORGANIZACAO: ["Invasão de base", "Falta de membros"]
};
