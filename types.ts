
export enum View {
  HOME = 'home',
  PRODUCTS = 'products',
  INVITATION = 'invitation',
  PROFILE = 'profile',
  ADD_BANK = 'add_bank',
  CHANGE_PASSWORD = 'change_password',
  RECHARGE = 'recharge',
  WITHDRAWAL = 'withdrawal',
  COMPANY_INTRO = 'company_intro',
  CONVERT_BONUS = 'convert_bonus',
  CHAT = 'chat',
  NOTIFICATIONS = 'notifications',
  DOWNLOAD_APP = 'download_app',
  ABOUT_US = 'about_us',
  FAQ = 'faq',
  CUSTOMER_SERVICE = 'customer_service',
  TRANSACTION_HISTORY = 'transaction_history',
  SETTINGS = 'settings',
  USER_PROFILE_DETAIL = 'user_profile_detail',
  GIFT = 'gift',
  TASKS = 'tasks',
  SOCIAL_PROOF = 'social_proof',
  PURCHASED_PACKAGES = 'purchased_packages'
}

export type Language = 'pt' | 'en';
export type Theme = 'light' | 'dark';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  isFallback?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  dailyIncome: number;
  duration: number; // em dias
  purchaseLimit: number;
  description: string;
  imageUrl?: string;
  emoji: string;
}
