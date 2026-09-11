import { UserProfile, Subscription, FreeTrial, UsageLog, AuditLog, CurrencyCode } from '../types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_FREE_TRIALS,
  INITIAL_USAGE_LOGS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  USER_PROFILE: 'subscriptionguard_user_profile',
  SUBSCRIPTIONS: 'subscriptionguard_subscriptions',
  FREE_TRIALS: 'subscriptionguard_free_trials',
  USAGE_LOGS: 'subscriptionguard_usage_logs',
  AUDIT_LOGS: 'subscriptionguard_audit_logs',
};

type Listener = () => void;

class RelationalDatabaseEngine {
  private listeners: Set<Listener> = new Set();

  private userProfile: UserProfile;
  private subscriptions: Subscription[];
  private freeTrials: FreeTrial[];
  private usageLogs: UsageLog[];
  private auditLogs: AuditLog[];

  constructor() {
    this.userProfile = this.loadFromStorage(STORAGE_KEYS.USER_PROFILE, INITIAL_USER_PROFILE);
    this.subscriptions = this.loadFromStorage(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    this.freeTrials = this.loadFromStorage(STORAGE_KEYS.FREE_TRIALS, INITIAL_FREE_TRIALS);
    this.usageLogs = this.loadFromStorage(STORAGE_KEYS.USAGE_LOGS, INITIAL_USAGE_LOGS);
    this.auditLogs = this.loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore localStorage error in sandboxed environments
    }
    return fallback;
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.userProfile));
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(this.subscriptions));
      localStorage.setItem(STORAGE_KEYS.FREE_TRIALS, JSON.stringify(this.freeTrials));
      localStorage.setItem(STORAGE_KEYS.USAGE_LOGS, JSON.stringify(this.usageLogs));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch {
      // Ignore storage errors
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- USER PROFILE QUERIES & MUTATIONS ---
  public getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }

  public updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    this.userProfile = { ...this.userProfile, ...updates };
    this.saveToStorage();
    return this.getUserProfile();
  }

  public setCurrency(currency: CurrencyCode) {
    this.userProfile.currency = currency;
    this.saveToStorage();
  }

  // --- SUBSCRIPTIONS QUERIES & MUTATIONS ---
  public getSubscriptions(): Subscription[] {
    return [...this.subscriptions];
  }

  public getActiveSubscriptions(): Subscription[] {
    return this.subscriptions.filter((s) => s.status === 'Active');
  }

  public getSubscriptionById(id: string): Subscription | undefined {
    return this.subscriptions.find((s) => s.subscription_id === id);
  }

  public addSubscription(sub: Omit<Subscription, 'subscription_id' | 'created_at'>): Subscription {
    const newSub: Subscription = {
      ...sub,
      subscription_id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.subscriptions.unshift(newSub);

    // Also create initial usage log record
    const usageLog: UsageLog = {
      log_id: `log_${newSub.subscription_id}`,
      user_id: newSub.user_id,
      subscription_id: newSub.subscription_id,
      last_opened_timestamp: new Date().toISOString(),
      total_monthly_hours: 8.0,
      user_value_rating: 4,
      weekly_hours: [3.0, 2.5, 1.5, 1.0],
      historical_average_hours: 3.0,
      drop_percentage: 0,
    };
    this.usageLogs.push(usageLog);

    this.auditLogs.unshift({
      log_id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action_type: 'ADDED_SUBSCRIPTION',
      service_name: newSub.service_name,
      amount_saved: 0,
      details: `Added new ${newSub.billing_cycle} subscription for ${newSub.service_name} at ${newSub.cost}.`,
    });

    this.saveToStorage();
    return newSub;
  }

  public updateSubscription(id: string, updates: Partial<Subscription>): Subscription | undefined {
    const index = this.subscriptions.findIndex((s) => s.subscription_id === id);
    if (index === -1) return undefined;

    this.subscriptions[index] = { ...this.subscriptions[index], ...updates };
    this.saveToStorage();
    return this.subscriptions[index];
  }

  public cancelSubscription(id: string, reason?: string): boolean {
    const sub = this.subscriptions.find((s) => s.subscription_id === id);
    if (!sub) return false;

    sub.status = 'Cancelled';
    const annualSavings = sub.billing_cycle === 'Monthly' ? sub.cost * 12 : sub.cost;

    this.auditLogs.unshift({
      log_id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action_type: 'CANCELLED_SUBSCRIPTION',
      service_name: sub.service_name,
      amount_saved: sub.cost,
      details: `Terminated ${sub.service_name} billing cycle through 1-Tap Cancellation guide. Reason: ${reason || 'Too expensive / low utilization'}. Projected annual savings: ${sub.cost.toFixed(2)}/mo (${annualSavings.toFixed(2)}/yr).`,
    });

    this.saveToStorage();
    return true;
  }

  public reactivateSubscription(id: string): boolean {
    const sub = this.subscriptions.find((s) => s.subscription_id === id);
    if (!sub) return false;
    sub.status = 'Active';
    this.saveToStorage();
    return true;
  }

  public deleteSubscription(id: string): boolean {
    const index = this.subscriptions.findIndex((s) => s.subscription_id === id);
    if (index === -1) return false;
    this.subscriptions.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // --- FREE TRIALS QUERIES & MUTATIONS ---
  public getFreeTrials(): FreeTrial[] {
    return [...this.freeTrials];
  }

  public getActiveFreeTrials(): FreeTrial[] {
    return this.freeTrials.filter((t) => t.status === 'Active');
  }

  public getFreeTrialById(id: string): FreeTrial | undefined {
    return this.freeTrials.find((t) => t.trial_id === id);
  }

  public addFreeTrial(trial: Omit<FreeTrial, 'trial_id'>): FreeTrial {
    const newTrial: FreeTrial = {
      ...trial,
      trial_id: `trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.freeTrials.unshift(newTrial);
    this.saveToStorage();
    return newTrial;
  }

  public toggleTrialAlert(trial_id: string, leadHours?: number): FreeTrial | undefined {
    const trial = this.freeTrials.find((t) => t.trial_id === trial_id);
    if (!trial) return undefined;

    if (leadHours !== undefined) {
      trial.alert_lead_time_hours = leadHours;
    }
    trial.notification_enabled = !trial.notification_enabled;

    this.auditLogs.unshift({
      log_id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action_type: 'UPDATED_ALERT',
      service_name: trial.service_name,
      amount_saved: 0,
      details: `Updated push alert notification for ${trial.service_name} to ${trial.notification_enabled ? `Active (${trial.alert_lead_time_hours}h lead)` : 'Disabled'}.`,
    });

    this.saveToStorage();
    return trial;
  }

  public cancelFreeTrial(trial_id: string): boolean {
    const trial = this.freeTrials.find((t) => t.trial_id === trial_id);
    if (!trial) return false;

    trial.status = 'Cancelled';
    this.auditLogs.unshift({
      log_id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action_type: 'CANCELLED_SUBSCRIPTION',
      service_name: trial.service_name,
      amount_saved: trial.cost_after_trial,
      details: `Safely cancelled ${trial.service_name} free trial before ${trial.expiry_date} auto-billing trigger. Prevented charge of ${trial.cost_after_trial.toFixed(2)}.`,
    });

    this.saveToStorage();
    return true;
  }

  // --- USAGE LOGS QUERIES & MUTATIONS ---
  public getUsageLogs(): UsageLog[] {
    return [...this.usageLogs];
  }

  public getUsageLogForSubscription(sub_id: string): UsageLog | undefined {
    return this.usageLogs.find((l) => l.subscription_id === sub_id);
  }

  public updateUsageRating(sub_id: string, rating: number): UsageLog | undefined {
    const log = this.usageLogs.find((l) => l.subscription_id === sub_id);
    if (!log) return undefined;
    log.user_value_rating = rating;
    this.saveToStorage();
    return log;
  }

  // --- AUDIT LOGS QUERIES ---
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // --- AGGREGATE CALCULATIONS & BUSINESS LOGIC ---
  public getTotalMonthlySpend(): number {
    const active = this.getActiveSubscriptions();
    const sum = active.reduce((acc, sub) => {
      const monthlyEquivalent = sub.billing_cycle === 'Annual' ? sub.cost / 12 : sub.cost;
      return acc + monthlyEquivalent;
    }, 0);
    return Math.round(sum * 100) / 100;
  }

  public getTotalAnnualSpend(): number {
    return Math.round(this.getTotalMonthlySpend() * 12 * 100) / 100;
  }

  public getTotalMonthlySaved(): number {
    const cancelled = this.subscriptions.filter((s) => s.status === 'Cancelled');
    const sum = cancelled.reduce((acc, sub) => {
      const monthlyEquivalent = sub.billing_cycle === 'Annual' ? sub.cost / 12 : sub.cost;
      return acc + monthlyEquivalent;
    }, 0);
    return Math.round(sum * 100) / 100;
  }

  public getCategoryBreakdown(): { category: string; total: number; percentage: number; count: number }[] {
    const active = this.getActiveSubscriptions();
    const totalSpend = this.getTotalMonthlySpend() || 1;
    const catMap: Record<string, { total: number; count: number }> = {};

    active.forEach((sub) => {
      const cost = sub.billing_cycle === 'Annual' ? sub.cost / 12 : sub.cost;
      if (!catMap[sub.category]) {
        catMap[sub.category] = { total: 0, count: 0 };
      }
      catMap[sub.category].total += cost;
      catMap[sub.category].count += 1;
    });

    return Object.entries(catMap).map(([category, data]) => ({
      category,
      total: Math.round(data.total * 100) / 100,
      percentage: Math.round((data.total / totalSpend) * 100),
      count: data.count,
    }));
  }

  /**
   * Programmatically computes subscriptions renewing in <= days
   * Assumes reference date is 2026-08-07
   */
  public getRenewalsWithinDays(days: number = 3): Subscription[] {
    const refDate = new Date('2026-08-07T00:00:00Z');
    return this.getActiveSubscriptions().filter((sub) => {
      const billDate = new Date(`${sub.next_billing_date}T00:00:00Z`);
      const diffTime = billDate.getTime() - refDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= days;
    });
  }

  /**
   * Computes days remaining for a trial based on 2026-08-07
   */
  public getTrialDaysRemaining(trial: FreeTrial): number {
    const refDate = new Date('2026-08-07T00:00:00Z');
    const expDate = new Date(`${trial.expiry_date}T00:00:00Z`);
    const diffTime = expDate.getTime() - refDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Computes value score (0-100) for a subscription based on cost and usage hours
   */
  public computeValueScore(subId: string): {
    score: number;
    costPerHour: number;
    isLowValue: boolean;
    recommendation: string;
  } {
    const sub = this.getSubscriptionById(subId);
    const usage = this.getUsageLogForSubscription(subId);

    if (!sub) {
      return { score: 50, costPerHour: 0, isLowValue: false, recommendation: 'No data' };
    }

    const monthlyHours = usage?.total_monthly_hours || 1;
    const monthlyCost = sub.billing_cycle === 'Annual' ? sub.cost / 12 : sub.cost;
    const costPerHour = Math.round((monthlyCost / monthlyHours) * 100) / 100;

    // A high cost per hour (> $5 or ₱25) combined with low rating flags low value
    const isLowValue = costPerHour > 2.5 || (usage?.drop_percentage || 0) > 50 || (usage?.user_value_rating || 3) <= 2;
    const score = Math.max(10, Math.min(98, Math.round(100 - costPerHour * 10 + (usage?.user_value_rating || 3) * 5)));

    let recommendation = 'Good value based on routine utilization.';
    if (isLowValue) {
      recommendation = `Low utilization (${monthlyHours}h/mo at ${sub.cost}/mo). Recommended for 1-Tap Cancellation.`;
    }

    return {
      score,
      costPerHour,
      isLowValue,
      recommendation,
    };
  }

  // --- UTILITY & RESET ---
  public resetToInitial() {
    this.userProfile = { ...INITIAL_USER_PROFILE };
    this.subscriptions = JSON.parse(JSON.stringify(INITIAL_SUBSCRIPTIONS));
    this.freeTrials = JSON.parse(JSON.stringify(INITIAL_FREE_TRIALS));
    this.usageLogs = JSON.parse(JSON.stringify(INITIAL_USAGE_LOGS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.saveToStorage();
  }

  public exportDatabaseJSON(): string {
    return JSON.stringify(
      {
        user_profiles: [this.userProfile],
        subscriptions: this.subscriptions,
        free_trials: this.freeTrials,
        usage_logs: this.usageLogs,
        audit_logs: this.auditLogs,
      },
      null,
      2
    );
  }

  public importDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.user_profiles?.[0]) this.userProfile = data.user_profiles[0];
      if (Array.isArray(data.subscriptions)) this.subscriptions = data.subscriptions;
      if (Array.isArray(data.free_trials)) this.freeTrials = data.free_trials;
      if (Array.isArray(data.usage_logs)) this.usageLogs = data.usage_logs;
      if (Array.isArray(data.audit_logs)) this.auditLogs = data.audit_logs;
      this.saveToStorage();
      return true;
    } catch {
      return false;
    }
  }
}

export const db = new RelationalDatabaseEngine();
