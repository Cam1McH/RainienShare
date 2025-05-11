// app/dashboard/types/index.ts
// User types
export interface User {
  id?: number;
  fullName: string;
  email: string;
  role: string;
  businessName?: string;
  businessType?: string;
  accountType: 'personal' | 'business';
  createdAt?: string;
  updatedAt?: string;
}

// Billing types
export interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  current: boolean;
}

// AI model types
export interface AIModel {
  id?: string;
  name: string;
  status: string;
  type: string;
  interactions: number;
  satisfaction: number;
  lastActive: string;
  color: string;
}

// Activity types
export interface Activity {
  title: string;
  time: string;
  description: string;
  icon: any;
  color: string;
}

// Event types
export interface Event {
  title: string;
  date: string;
  attendees: number;
  location: string;
}

// Notification types
export interface Notification {
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'update' | 'alert' | 'feature';
}

// Quick tool types
export interface QuickTool {
  name: string;
  icon: any;
  color: string;
  description?: string;
}

// Dashboard tab type
export interface DashboardTab {
  name: string;
  icon: any;
}

// Analytics data types
export interface AnalyticsDataPoint {
  day: string;
  queries: number;
  responses: number;
}

// Team types
export interface Team {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  userRole?: string;
}

export interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Theme type
export type Theme = 'dark' | 'light';