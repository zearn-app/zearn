
export enum TaskStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PROCESS = 'IN_PROCESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum WithdrawalMethod {
  UPI = 'UPI',
  BANK = 'Bank Transfer',
  AMAZON = 'Amazon Gift Card',
  FLIPKART = 'Flipkart Gift Card',
  PLAYSTORE = 'Play Store Redeem',
  WHATSAPP_PAY = 'WhatsApp Pay'
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PAID_BY_ADMIN = 'PAID_BY_ADMIN',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export interface User {
  uid: string;
  email: string;
  name: string;
  mobile: string;
  gender: string;
  dob: string;
  district: string;
  state: string;
  country: string;
  photoURL?: string;
  balance: number; 
  diamonds: number; 
  level: number;
  isAdmin: boolean;
  isBanned?: boolean; // Added
  createdAt: string;
  lastDailyClaim: string | null;
  referralCode: string;
  referredBy?: string;
  lifetimeEarnings: number;
  lifetimeDiamondEarnings: number;
  totalTasks: number;
  monthlyTasks: number;
  totalSpecialTasks: number;
  monthlySpecialTasks: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number; 
  diamondReward: number; 
  link: string;
  password?: string; 
  packageName?: string; 
  isSpecial: boolean;
  hideUntil?: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  taskName: string;
  type: 'standard' | 'special';
  status: TaskStatus;
  amountEarned: number;
  diamondEarned: number;
  reason?: string;
  timestamp: string;
}

export interface UserTask {
  taskId: string;
  status: TaskStatus;
  startedAt: string;
  completedAt?: string;
  obfuscatedName?: string; 
}

export interface WithdrawalRequest {
  id: string;
  uid: string;
  amount: number;
  method: WithdrawalMethod;
  details: string; 
  status: WithdrawalStatus;
  requestedAt: string;
}

export interface AdminSettings {
  tapCount: number;
  adminPassword: string;
  dailyClaimLimit: number;
  minWithdrawal: number;
  randomWinnerEntryFee: number;
}

export interface WinnerEntry {
  uid: string;
  name: string;
  avatarChar: string;
  amountSpent: number;
  month: string;
  timestamp: string;
}

export interface ContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}
