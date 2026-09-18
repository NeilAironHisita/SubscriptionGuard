export type CurrencyCode = 'PHP' | 'USD';

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  monthly_estimated_spend: number;
  currency: CurrencyCode;
  linked_bank_name?: string;
  bank_connected: boolean;
  onboarding_completed: boolean;
  budget_limit: number;
  alert_lead_days?: 1 | 3 | 7;
}

export type SubscriptionCategory = 'Entertainment' | 'Utilities' | 'Productivity' | 'Health' | 'Creative' | 'Security';
export type BillingCycle = 'Monthly' | 'Annual';
export type SubscriptionStatus = 'Active' | 'Paused' | 'Cancelled';

export interface Subscription {
  subscription_id: string;
  user_id: string;
  service_name: string;
  category: SubscriptionCategory;
  billing_cycle: BillingCycle;
  cost: number;
  next_billing_date: string; // YYYY-MM-DD
  payment_method: string;
  status: SubscriptionStatus;
  cancellation_url: string;
  logo_icon?: string;
  logo_img_url?: string;
  accent_color?: string;
  notes?: string;
  created_at: string;
  auto_renew: boolean;
  days_until_renewal?: number;
}

export interface FreeTrial {
  trial_id: string;
  user_id: string;
  service_name: string;
  start_date: string;
  expiry_date: string; // YYYY-MM-DD
  cost_after_trial: number;
  alert_lead_time_hours: number; // e.g., 24, 48, 72
  auto_renew_flag: boolean;
  tier_name: string;
  status: 'Active' | 'Cancelled' | 'Converted';
  logo_img_url?: string;
  logo_icon?: string;
  accent_color?: string;
  cancellation_url: string;
  notification_enabled: boolean;
}

export interface UsageLog {
  log_id: string;
  user_id: string;
  subscription_id: string;
  last_opened_timestamp: string;
  total_monthly_hours: number;
  user_value_rating: number; // 1-5 scale
  weekly_hours: [number, number, number, number]; // W1, W2, W3, W4
  historical_average_hours: number;
  drop_percentage: number;
}

export interface CancellationStep {
  step_number: number;
  title: string;
  instruction: string;
  tip: string;
  is_completed: boolean;
}

export interface DarkPatternGuide {
  guide_id: string;
  service_name: string;
  dark_pattern_type: 'Forced Chat/Phone Call' | 'Multi-screen Guilt-Trip' | 'Hidden Cancel Button' | 'Deceptive Discount Loop' | 'Auto-re-enrollment';
  severity: 'High' | 'Critical' | 'Medium';
  overview: string;
  quick_bypass_strategy: string;
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
}

export interface AuditLog {
  log_id: string;
  timestamp: string;
  action_type: 'CANCELLED_SUBSCRIPTION' | 'UPDATED_ALERT' | 'LINKED_BANK' | 'ADDED_SUBSCRIPTION' | 'CONVERTED_TRIAL';
  service_name: string;
  amount_saved: number;
  details: string;
}
