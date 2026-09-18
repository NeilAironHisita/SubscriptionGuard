import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ToastContainer, ToastData } from './components/Toast';
import { AddSubscriptionModal, NewSubscriptionPayload } from './components/AddSubscriptionModal';
import { AddFreeTrialModal, NewFreeTrialPayload } from './components/AddFreeTrialModal';
import { EditBudgetModal } from './components/EditBudgetModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ImportLedgerModal } from './components/ImportLedgerModal';
import { OnboardingModal, SetupPreferencesPayload } from './components/OnboardingModal';

// ==================== TYPES & CONSTANTS ====================
export type Currency = 'PHP' | 'USD';
export type ActiveTab = 'dashboard' | 'trials' | 'analytics-detail' | 'defense' | 'sql';

export interface SubscriptionItem {
  id: string;
  name: string;
  category: 'Entertainment' | 'Creative' | 'Productivity' | 'Health' | 'Utilities';
  cost: number; // Base cost in PHP
  renewDays: number;
  billingCycle: 'Monthly' | 'Annual';
  status: 'Active' | 'Cancelled';
  paymentMethod: string;
  usageDrop?: number;
  costPerHour?: number;
  weeklyHours?: [number, number, number, number];
  valueScore?: number;
}

export interface FreeTrialItem {
  id: string;
  name: string;
  tier: string;
  costAfter: number; // Base cost in PHP
  daysLeft: number;
  alert48h: boolean;
  status: 'Active' | 'Cancelled';
}

export interface AuditLogItem {
  id: string;
  time: string;
  date: string;
  action: string;
  service: string;
  amount: number;
  details?: string;
}

const USD_RATE = 56.0;
const STORAGE_KEY = 'subscriptionguard_vault_v3';

// Initial Seed Data
const DEFAULT_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub_01',
    name: 'Netflix',
    category: 'Entertainment',
    cost: 22.99,
    renewDays: 2,
    billingCycle: 'Monthly',
    status: 'Active',
    paymentMethod: 'Visa •••• 1093',
    usageDrop: -15,
    costPerHour: 1.15,
    weeklyHours: [5, 4.5, 4.2, 4.0],
    valueScore: 82,
  },
  {
    id: 'sub_02',
    name: 'Spotify',
    category: 'Entertainment',
    cost: 14.99,
    renewDays: 14,
    billingCycle: 'Monthly',
    status: 'Active',
    paymentMethod: 'PayPal (Linked)',
    usageDrop: 0,
    costPerHour: 0.55,
    weeklyHours: [7, 7.5, 6.8, 7.2],
    valueScore: 94,
  },
  {
    id: 'sub_03',
    name: 'Adobe Creative Cloud',
    category: 'Creative',
    cost: 54.99,
    renewDays: 6,
    billingCycle: 'Monthly',
    status: 'Active',
    paymentMethod: 'Mastercard •••• 4821',
    usageDrop: -78,
    costPerHour: 13.75,
    weeklyHours: [12.0, 6.0, 1.5, 0.75],
    valueScore: 24,
  },
  {
    id: 'sub_04',
    name: 'ChatGPT Plus',
    category: 'Productivity',
    cost: 20.0,
    renewDays: 22,
    billingCycle: 'Monthly',
    status: 'Active',
    paymentMethod: 'Mastercard •••• 4821',
    usageDrop: -5,
    costPerHour: 0.95,
    weeklyHours: [6, 5.5, 5.0, 5.2],
    valueScore: 88,
  },
  {
    id: 'sub_05',
    name: 'Equinox Gym',
    category: 'Health',
    cost: 85.0,
    renewDays: 18,
    billingCycle: 'Monthly',
    status: 'Active',
    paymentMethod: 'Chase Premier (•••• 9012)',
    usageDrop: -30,
    costPerHour: 8.5,
    weeklyHours: [4, 3, 2, 1.5],
    valueScore: 48,
  },
  {
    id: 'sub_06',
    name: 'iCloud Storage',
    category: 'Utilities',
    cost: 16.53,
    renewDays: 8,
    billingCycle: 'Monthly',
    status: 'Active',
    paymentMethod: 'Apple Pay',
    usageDrop: 0,
    costPerHour: 0.25,
    weeklyHours: [20, 20, 20, 20],
    valueScore: 96,
  },
];

const DEFAULT_FREE_TRIALS: FreeTrialItem[] = [
  { id: 'tr_1', name: 'Disney+', tier: 'Ad-Free Premium', costAfter: 13.99, daysLeft: 2, alert48h: true, status: 'Active' },
  { id: 'tr_2', name: 'HelloFresh', tier: 'Classic Box', costAfter: 48.5, daysLeft: 5, alert48h: true, status: 'Active' },
  { id: 'tr_3', name: 'Audible', tier: '30-Day Audio', costAfter: 14.95, daysLeft: 12, alert48h: false, status: 'Active' },
];

const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log_1',
    time: '10:42 AM',
    date: new Date().toLocaleDateString(),
    action: 'VAULT_SYNCED',
    service: 'Chase Open Banking',
    amount: 0,
    details: 'Automated cryptographic handshake verified with Chase Premier Checking (•••• 9012).',
  },
];

export default function App() {
  // Load state from localStorage with fallback
  const loadSavedState = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return {
      currency: 'PHP' as Currency,
      burnCycle: 'monthly' as 'monthly' | 'annual',
      budgetCap: 500.0,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
      freeTrials: DEFAULT_FREE_TRIALS,
      auditLogs: DEFAULT_AUDIT_LOGS,
      alertLeadDays: 3 as 1 | 3 | 7,
      onboardingCompleted: false,
    };
  };

  const initial = loadSavedState();

  // Core State
  const [currency, setCurrency] = useState<Currency>(initial.currency);
  const [burnCycle, setBurnCycle] = useState<'monthly' | 'annual'>(initial.burnCycle);
  const [budgetCap, setBudgetCap] = useState<number>(initial.budgetCap);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(initial.subscriptions);
  const [freeTrials, setFreeTrials] = useState<FreeTrialItem[]>(initial.freeTrials);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initial.auditLogs);
  const [alertLeadDays, setAlertLeadDays] = useState<1 | 3 | 7>(initial.alertLeadDays || 3);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!initial.onboardingCompleted);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(!initial.onboardingCompleted);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Inspected Subscription State
  const [inspectedSubId, setInspectedSubId] = useState<string>('sub_03');
  const [cancelStep, setCancelStep] = useState<number>(1);
  const [cancelReason, setCancelReason] = useState<string>('Cost exceeds value / Too Expensive (Auto-Skip)');

  // Modals State
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [isAddTrialOpen, setIsAddTrialOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Confirm Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Legal script state in Defense View
  const [targetLegalService, setTargetLegalService] = useState<string>('Adobe Creative Cloud');
  const [cardLast4, setCardLast4] = useState<string>('4821');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [expandedTactic, setExpandedTactic] = useState<number | null>(null);

  // SQL Runner State
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM subscriptions WHERE status = 'Active'");
  const [sqlResultRows, setSqlResultRows] = useState<string[][]>([]);
  const [sqlHeaders, setSqlHeaders] = useState<string[]>([]);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        currency,
        burnCycle,
        budgetCap,
        subscriptions,
        freeTrials,
        auditLogs,
        alertLeadDays,
        onboardingCompleted: true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // storage quota or sandboxed
    }
  }, [currency, burnCycle, budgetCap, subscriptions, freeTrials, auditLogs, alertLeadDays]);

  // Toast Helper
  const addToast = useCallback((type: ToastData['type'], title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Currency Converter Formatter
  const formatMoney = useCallback(
    (amountInPHP: number) => {
      if (currency === 'PHP') {
        return {
          symbol: '₱',
          value: amountInPHP.toFixed(2),
          display: `₱${amountInPHP.toFixed(2)}`,
        };
      }
      const inUSD = amountInPHP / USD_RATE;
      return {
        symbol: '$',
        value: inUSD.toFixed(2),
        display: `$${inUSD.toFixed(2)}`,
      };
    },
    [currency]
  );

  // Derived Values
  const activeSubs = useMemo(() => subscriptions.filter((s) => s.status === 'Active'), [subscriptions]);
  const cancelledSubs = useMemo(() => subscriptions.filter((s) => s.status === 'Cancelled'), [subscriptions]);

  const totalMonthlySpend = useMemo(() => {
    return activeSubs.reduce((sum, s) => {
      const monthly = s.billingCycle === 'Annual' ? s.cost / 12 : s.cost;
      return sum + monthly;
    }, 0);
  }, [activeSubs]);

  const totalMonthlySaved = useMemo(() => {
    return cancelledSubs.reduce((sum, s) => {
      const monthly = s.billingCycle === 'Annual' ? s.cost / 12 : s.cost;
      return sum + monthly;
    }, 0);
  }, [cancelledSubs]);

  const displaySpend = burnCycle === 'monthly' ? totalMonthlySpend : totalMonthlySpend * 12;
  const budgetRatio = Math.min(100, (totalMonthlySpend / (budgetCap || 1)) * 100);

  const urgentRenewals = useMemo(() => {
    return activeSubs.filter((s) => s.renewDays <= alertLeadDays);
  }, [activeSubs, alertLeadDays]);

  const currentlyInspectedSub = useMemo(() => {
    return subscriptions.find((s) => s.id === inspectedSubId) || subscriptions[0];
  }, [subscriptions, inspectedSubId]);

  // ==================== MUTATION ACTIONS ====================

  // Quick Cancel
  const handleQuickCancel = (subId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'Cancelled' } : s))
    );

    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      action: 'QUICK_CANCEL',
      service: sub.name,
      amount: sub.cost,
      details: `Quick-cancelled ${sub.name}. Prevented future debits. Saved ${formatMoney(sub.cost).display}/mo.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast('success', `Quick-Cancelled ${sub.name}`, `Saved ${formatMoney(sub.cost).display}/mo.`);
  };

  // Reactivate Subscription
  const handleReactivateSub = (subId: string) => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'Active' } : s))
    );

    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      action: 'REACTIVATED',
      service: sub.name,
      amount: 0,
      details: `Restored active billing for ${sub.name}.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast('info', `Reactivated ${sub.name}`, 'Subscription billing resumed.');
  };

  // Delete Subscription
  const handleDeleteSub = (subId: string) => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;

    setConfirmModalConfig({
      isOpen: true,
      title: `Delete ${sub.name}?`,
      message: `Are you sure you want to permanently delete ${sub.name} from your monitored database? This removes all historical telemetry.`,
      confirmText: 'Delete Record',
      isDestructive: true,
      onConfirm: () => {
        setSubscriptions((prev) => prev.filter((s) => s.id !== subId));
        addToast('warning', `Deleted ${sub.name}`, 'Record removed from local database.');
        if (inspectedSubId === subId) {
          const remaining = subscriptions.filter((s) => s.id !== subId);
          if (remaining.length > 0) setInspectedSubId(remaining[0].id);
          else setActiveTab('dashboard');
        }
      },
    });
  };

  // Add Subscription
  const handleAddSubscription = (payload: NewSubscriptionPayload) => {
    const newSub: SubscriptionItem = {
      id: `sub_${Date.now()}`,
      name: payload.name,
      category: payload.category,
      cost: payload.cost,
      renewDays: payload.renewDays,
      billingCycle: payload.billingCycle,
      status: 'Active',
      paymentMethod: payload.paymentMethod || 'Chase Premier (•••• 9012)',
      usageDrop: 0,
      costPerHour: Math.round((payload.cost / 8) * 100) / 100,
      weeklyHours: [2, 2.5, 2, 1.8],
      valueScore: 80,
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      action: 'ADDED_SUBSCRIPTION',
      service: newSub.name,
      amount: 0,
      details: `Added new ${newSub.billingCycle} subscription (${formatMoney(newSub.cost).display}).`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast('success', `Added ${newSub.name}`, `Monitored under ${newSub.category}.`);
  };

  // Free Trial Alert Toggle
  const handleToggleTrialAlert = (trialId: string) => {
    const target = freeTrials.find((t) => t.id === trialId);
    if (!target) return;

    const nextState = !target.alert48h;
    setFreeTrials((prev) =>
      prev.map((t) => (t.id === trialId ? { ...t, alert48h: nextState } : t))
    );

    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      action: nextState ? 'ALERT_ENABLED' : 'ALERT_DISABLED',
      service: target.name,
      amount: 0,
      details: `48h push notification ${nextState ? 'armed' : 'disarmed'} for ${target.name}.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast(
      'info',
      `${target.name} Alert ${nextState ? 'Armed' : 'Disarmed'}`,
      nextState ? 'You will be notified 48 hours before auto-debit.' : 'Push notification disabled.'
    );
  };

  // Cancel Free Trial
  const handleCancelTrial = (trialId: string) => {
    const target = freeTrials.find((t) => t.id === trialId);
    if (!target) return;

    setFreeTrials((prev) =>
      prev.map((t) => (t.id === trialId ? { ...t, status: 'Cancelled' } : t))
    );

    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      action: 'TRIAL_DEFEATED',
      service: target.name,
      amount: target.costAfter,
      details: `Intercepted and cancelled ${target.name} before auto-charge. Prevented debit of ${formatMoney(target.costAfter).display}.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast(
      'success',
      `Auto-Charge Defeated!`,
      `Cancelled ${target.name} trial. Prevented ${formatMoney(target.costAfter).display}/mo charge.`
    );
  };

  // Reactivate Trial
  const handleReactivateTrial = (trialId: string) => {
    const target = freeTrials.find((t) => t.id === trialId);
    if (!target) return;

    setFreeTrials((prev) =>
      prev.map((t) => (t.id === trialId ? { ...t, status: 'Active' } : t))
    );
    addToast('info', `Trial Restored`, `Monitoring active for ${target.name}.`);
  };

  // Delete Free Trial
  const handleDeleteTrial = (trialId: string) => {
    const target = freeTrials.find((t) => t.id === trialId);
    if (!target) return;

    setConfirmModalConfig({
      isOpen: true,
      title: `Delete ${target.name} Trial?`,
      message: `Are you sure you want to remove this trial interceptor?`,
      confirmText: 'Delete Trial',
      isDestructive: true,
      onConfirm: () => {
        setFreeTrials((prev) => prev.filter((t) => t.id !== trialId));
        addToast('warning', `Deleted ${target.name}`, 'Trial removed from interceptor.');
      },
    });
  };

  // Convert Trial to Active Subscription
  const handleConvertTrialToSub = (trialId: string) => {
    const target = freeTrials.find((t) => t.id === trialId);
    if (!target) return;

    const newSub: SubscriptionItem = {
      id: `sub_${Date.now()}`,
      name: target.name,
      category: 'Entertainment',
      cost: target.costAfter,
      renewDays: 30,
      billingCycle: 'Monthly',
      status: 'Active',
      paymentMethod: 'Chase Premier (•••• 9012)',
      usageDrop: 0,
      costPerHour: 1.25,
      weeklyHours: [3, 3, 3, 3],
      valueScore: 85,
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    setFreeTrials((prev) => prev.filter((t) => t.id !== trialId));

    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      action: 'CONVERTED_TRIAL',
      service: target.name,
      amount: 0,
      details: `Enrolled ${target.name} into permanent recurring monitoring (${formatMoney(target.costAfter).display}/mo).`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast('success', `Converted to Subscription`, `${target.name} is now tracked on your live burn rate.`);
  };

  // Add Free Trial
  const handleAddFreeTrial = (payload: NewFreeTrialPayload) => {
    const newTrial: FreeTrialItem = {
      id: `tr_${Date.now()}`,
      name: payload.name,
      tier: payload.tier,
      costAfter: payload.costAfter,
      daysLeft: payload.daysLeft,
      alert48h: payload.alert48h,
      status: 'Active',
    };

    setFreeTrials((prev) => [newTrial, ...prev]);
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      action: 'ADDED_TRIAL',
      service: newTrial.name,
      amount: 0,
      details: `Armed trial countdown for ${newTrial.name} (${newTrial.daysLeft} days remaining).`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast('success', `Armed Trial Interceptor`, `${newTrial.name} is now monitored.`);
  };

  // 3-Step Guided Cancellation
  const handleFinalizeCancel = (subId: string) => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'Cancelled' } : s))
    );

    const annual = sub.billingCycle === 'Annual' ? sub.cost : sub.cost * 12;
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      action: 'STATUTORY_REVOCATION',
      service: sub.name,
      amount: sub.cost,
      details: `Executed statutory revocation under FTC 16 CFR Part 425 for ${sub.name}. Reason: ${cancelReason}. Saved ${formatMoney(sub.cost).display}/mo (${formatMoney(annual).display}/yr).`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast('success', `Statutory Revocation Executed`, `Saved ${formatMoney(sub.cost).display}/mo on ${sub.name}.`);
    setCancelStep(1);
    setActiveTab('dashboard');
  };

  // Copy Legal Script
  const getCustomLegalScript = () => {
    return `To Customer Support & Billing Department of ${targetLegalService || 'Merchant'}:

Under the Federal Trade Commission's Click-to-Cancel Rule (16 CFR Part 425) and Regulation E (12 CFR § 1005.10) governing preauthorized electronic fund transfers, I hereby formally revoke payment authorization for this recurring subscription effective immediately.

Linked Payment Method: Account / Card ending in •••• ${cardLast4 || 'XXXX'}
Target Service: ${targetLegalService || 'Recurring Subscription'}

As mandated by federal standards, cancellation mechanisms must be as simple, direct, and frictionless as enrollment. I do not consent to retention surveys, downsell counter-offers, phone call transfer procedures, or pause tiers.

Please process this permanent cancellation immediately and provide written confirmation along with a cancellation reference number. Any subsequent debit to my linked card or account will be disputed as an unauthorized electronic transaction under Regulation E.`;
  };

  const handleCopyLegalNotice = () => {
    const script = getCustomLegalScript();
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    addToast('success', '✓ Copied to Clipboard!', 'Legal revocation notice ready to paste into support.');
    setTimeout(() => setCopiedScript(false), 3000);
  };

  // SQL Query Execution Engine
  const runSQL = useCallback(
    (queryToRun: string) => {
      const q = queryToRun.trim().toLowerCase();
      setSqlError(null);

      try {
        if (!q.startsWith('select')) {
          setSqlError("Syntax Error: Only 'SELECT' queries are supported in the safe read-only sandbox.");
          setSqlHeaders([]);
          setSqlResultRows([]);
          return;
        }

        if (q.includes('from subscriptions')) {
          setSqlHeaders(['ID', 'Service Name', 'Category', 'Cycle', 'Cost', 'Renew In', 'Status']);
          let data = [...subscriptions];

          if (q.includes("where status = 'active'")) {
            data = data.filter((s) => s.status === 'Active');
          } else if (q.includes("where status = 'cancelled'")) {
            data = data.filter((s) => s.status === 'Cancelled');
          }

          if (q.includes("where category = 'entertainment'")) {
            data = data.filter((s) => s.category.toLowerCase() === 'entertainment');
          } else if (q.includes("where category = 'creative'")) {
            data = data.filter((s) => s.category.toLowerCase() === 'creative');
          }

          if (q.includes('where cost > 20') || q.includes('where cost > 20.0')) {
            data = data.filter((s) => s.cost > 20);
          }

          setSqlResultRows(
            data.map((s) => [
              s.id,
              s.name,
              s.category,
              s.billingCycle,
              formatMoney(s.cost).display,
              `${s.renewDays}d`,
              s.status,
            ])
          );
        } else if (q.includes('from free_trials')) {
          setSqlHeaders(['ID', 'Service Name', 'Tier', 'Post-Trial Cost', 'Days Left', '48h Alert', 'Status']);
          let data = [...freeTrials];

          if (q.includes('where daysleft <= 2') || q.includes('daysleft <= 3')) {
            data = data.filter((t) => t.daysLeft <= 3);
          }
          if (q.includes("where status = 'active'")) {
            data = data.filter((t) => t.status === 'Active');
          }

          setSqlResultRows(
            data.map((t) => [
              t.id,
              t.name,
              t.tier,
              formatMoney(t.costAfter).display,
              `${t.daysLeft}d`,
              t.alert48h ? 'Armed' : 'Off',
              t.status,
            ])
          );
        } else if (q.includes('from audit_logs')) {
          setSqlHeaders(['Timestamp', 'Action Type', 'Target Service', 'Savings', 'Details']);
          let data = [...auditLogs];
          setSqlResultRows(
            data.map((l) => [
              `${l.date || ''} ${l.time}`,
              l.action,
              l.service,
              l.amount > 0 ? formatMoney(l.amount).display : '-',
              l.details || '-',
            ])
          );
        } else {
          setSqlError("Table not recognized. Available tables: 'subscriptions', 'free_trials', 'audit_logs'.");
          setSqlHeaders([]);
          setSqlResultRows([]);
        }
      } catch (err: any) {
        setSqlError(`SQL Query Execution Error: ${err.message}`);
      }
    },
    [subscriptions, freeTrials, auditLogs, formatMoney]
  );

  useEffect(() => {
    runSQL(sqlQuery);
  }, [sqlQuery, runSQL]);

  // Export JSON Ledger
  const handleExportJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      vaultSummary: {
        currency,
        burnCycle,
        budgetCap,
        totalMonthlySpend,
        totalMonthlySaved,
        activeSubscriptionsCount: activeSubs.length,
        monitoredTrialsCount: freeTrials.filter((t) => t.status === 'Active').length,
      },
      subscriptions,
      freeTrials,
      auditLogs,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SubscriptionGuard_VaultLedger_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Vault Exported!', 'JSON Ledger downloaded successfully.');
  };

  // Import JSON Ledger
  const handleImportJSON = (data: any) => {
    try {
      if (Array.isArray(data.subscriptions)) {
        setSubscriptions(data.subscriptions);
      }
      if (Array.isArray(data.freeTrials)) {
        setFreeTrials(data.freeTrials);
      }
      if (Array.isArray(data.auditLogs)) {
        setAuditLogs(data.auditLogs);
      }
      if (data.vaultSummary?.budgetCap || data.budgetCap) {
        setBudgetCap(data.vaultSummary?.budgetCap || data.budgetCap);
      }
      if (data.vaultSummary?.currency || data.currency) {
        setCurrency(data.vaultSummary?.currency || data.currency);
      }
      addToast('success', 'Vault Ledger Imported', 'All subscriptions, trials, and audit records restored.');
    } catch {
      addToast('error', 'Import Failed', 'Unable to parse ledger structure.');
    }
  };

  // Setup / Preferences Saved
  const handleSavePreferences = (payload: SetupPreferencesPayload) => {
    setAlertLeadDays(payload.alertLeadDays);
    setCurrency(payload.currency);
    setBudgetCap(payload.budgetCap);

    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      action: 'CONFIGURED_PREFERENCES',
      service: payload.trackingMode === 'open_banking' ? (payload.linkedBankName || 'Open Banking Live Feed') : 'Manual Private Vault',
      amount: 0,
      details: `Configured ${payload.alertLeadDays}-day pre-billing alert timing under zero-credential read-only protocol.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    addToast(
      'success',
      'Preferences Saved',
      `Armed ${payload.alertLeadDays}-day pre-billing alerts under zero-credential security.`
    );
  };

  // Reset State to Default Demonstration
  const handleResetToDefault = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Reset Vault Database?',
      message: 'This will restore all subscriptions, free trial countdowns, and audit logs to the initial factory seed state. Any custom entries will be replaced.',
      confirmText: 'Reset to Defaults',
      isDestructive: true,
      onConfirm: () => {
        setSubscriptions(DEFAULT_SUBSCRIPTIONS);
        setFreeTrials(DEFAULT_FREE_TRIALS);
        setAuditLogs(DEFAULT_AUDIT_LOGS);
        setBudgetCap(500.0);
        setCurrency('PHP');
        setBurnCycle('monthly');
        setCancelStep(1);
        setAlertLeadDays(3);
        localStorage.removeItem(STORAGE_KEY);
        addToast('info', 'Database Reset', 'Demo seed state successfully re-established.');
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#DFE2EE] flex flex-col justify-between antialiased selection:bg-[#10B981] selection:text-black">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ==================== FIXED TOP HEADER ==================== */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-[#2D3748] z-40 px-4 md:px-6">
        <div className="max-w-md mx-auto h-full flex items-center justify-between">
          {/* Brand Logo & Pill */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] shadow">
              <svg className="w-4 h-4 fill-[#10B981]/20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block leading-tight">
                Subscription<span className="text-[#10B981]">Guard</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#10B981] font-mono block">
                DEFENSE CORE
              </span>
            </div>
          </div>

          {/* Controls: Setup Preferences, Currency Toggle & Add Button */}
          <div className="flex items-center gap-1.5">
            {/* Setup / Alert Timing Preferences Button */}
            <button
              type="button"
              onClick={() => {
                setIsFirstLaunch(false);
                setIsOnboardingOpen(true);
              }}
              className="h-8 px-2 rounded-xl bg-[#1E2640] hover:bg-[#2D3748] border border-[#2D3748] hover:border-[#10B981]/50 text-[#DFE2EE] hover:text-[#10B981] flex items-center gap-1 text-xs font-bold transition-all shadow active:scale-95 cursor-pointer"
              title="Configure Alert Timing (1, 3, or 7 days) & Security Model"
            >
              <svg className="w-3.5 h-3.5 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="font-mono text-[11px]">{alertLeadDays}d</span>
            </button>

            {/* Currency Toggle */}
            <div className="flex bg-[#1E2640] p-0.5 rounded-xl border border-[#2D3748] text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => {
                  setCurrency('PHP');
                  addToast('info', 'Currency: ₱ PHP', 'Switched display to Philippine Pesos.');
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currency === 'PHP'
                    ? 'bg-[#10B981] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ₱ PHP
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrency('USD');
                  addToast('info', 'Currency: $ USD', `Converted at 1 USD = ${USD_RATE} PHP.`);
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currency === 'USD'
                    ? 'bg-[#10B981] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Quick Add Header Button */}
            <button
              type="button"
              onClick={() => setIsAddSubOpen(true)}
              className="w-8 h-8 rounded-xl bg-[#10B981] hover:bg-[#4EDEA3] text-black flex items-center justify-center font-black shadow active:scale-95 transition-all"
              title="Add Recurring Subscription"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTAINER ==================== */}
      <main className="w-full max-w-md mx-auto pt-20 pb-24 px-4 flex-1 flex flex-col gap-5">
        {/* ==================== 1. DASHBOARD VIEW ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {/* Connected Vault Header Card */}
            <div className="flex items-center justify-between bg-[#1E2640]/70 border border-[#2D3748] rounded-2xl px-4 py-2.5 shadow">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20L12 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Chase Premier Checking (•••• 9012)</span>
                  <span className="text-[10px] text-[#10B981] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    Open Banking Live Feed Active
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditBudgetOpen(true)}
                className="text-[11px] font-bold text-gray-300 hover:text-white border border-[#2D3748] hover:border-[#10B981] bg-[#0B0F17]/50 px-2.5 py-1 rounded-xl transition-all"
              >
                Budget
              </button>
            </div>

            {/* Defense Protocol & Alert Timing Security Card */}
            <div className="flex items-center justify-between bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl p-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 flex items-center justify-center text-[#10B981] flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <span>{alertLeadDays}-Day Pre-Billing Alert Armed</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981] font-mono uppercase">
                      Zero-Credential
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                    Read-only tracking • Warns {alertLeadDays} {alertLeadDays === 1 ? 'day' : 'days'} prior to auto-debit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFirstLaunch(false);
                  setIsOnboardingOpen(true);
                }}
                className="px-2.5 py-1 bg-[#10B981] hover:bg-[#34D399] text-black font-extrabold rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow ml-2 flex-shrink-0"
              >
                Configure
              </button>
            </div>

            {/* Hero Burn Rate Card */}
            <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-[#0B0F17] text-[#10B981]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                    </svg>
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    {burnCycle === 'monthly' ? 'Live Monthly Burn Rate' : 'Projected Annual Run-Rate'}
                  </span>
                </div>

                <div className="flex bg-[#0B0F17] p-1 rounded-xl border border-[#2D3748] text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setBurnCycle('monthly')}
                    className={`px-2.5 py-0.5 rounded-lg transition-all ${
                      burnCycle === 'monthly'
                        ? 'bg-[#10B981] text-black shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Mo
                  </button>
                  <button
                    type="button"
                    onClick={() => setBurnCycle('annual')}
                    className={`px-2.5 py-0.5 rounded-lg transition-all ${
                      burnCycle === 'annual'
                        ? 'bg-[#10B981] text-black shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Yr
                  </button>
                </div>
              </div>

              <div className="my-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#10B981]">{formatMoney(displaySpend).symbol}</span>
                <span className="text-5xl font-black font-mono tracking-tight text-white">
                  {formatMoney(displaySpend).value}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {burnCycle === 'monthly' ? '/month' : '/year'}
                </span>
              </div>

              {/* Budget Utilization Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                  <span>Budget Cap Utilization</span>
                  <span className={`font-bold ${budgetRatio > 90 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                    {budgetRatio.toFixed(1)}% of {formatMoney(budgetCap).display}
                  </span>
                </div>
                <div className="w-full bg-[#0B0F17] h-2 rounded-full overflow-hidden border border-[#2D3748]/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetRatio > 90 ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                    }`}
                    style={{ width: `${budgetRatio}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2D3748]/60 flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0B0F17] border border-[#2D3748] text-gray-300 font-medium">
                  <strong className="text-white font-mono">{activeSubs.length}</strong> active stream{activeSubs.length !== 1 ? 's' : ''}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[11px] font-semibold font-mono">
                  Saved {formatMoney(totalMonthlySaved).display}/mo
                </span>
              </div>
            </div>

            {/* Configurable Urgency Alert Banner */}
            {urgentRenewals.length > 0 ? (
              <div className="bg-[#EF4444] text-white rounded-2xl p-4 shadow-xl border border-[#EF4444]/60 flex items-center justify-between transition-all animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs tracking-tight">
                        Auto-Charge Within {alertLeadDays * 24}h ({alertLeadDays} {alertLeadDays === 1 ? 'Day' : 'Days'})
                      </span>
                      <span className="text-[9px] uppercase font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">
                        Urgent
                      </span>
                    </div>
                    <p className="text-[11px] text-white/90 mt-0.5 leading-snug">
                      {urgentRenewals[0].name} (<span className="font-mono">{formatMoney(urgentRenewals[0].cost).display}</span>) auto-charges in {urgentRenewals[0].renewDays} {urgentRenewals[0].renewDays === 1 ? 'day' : 'days'}. Review before card debit.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInspectedSubId(urgentRenewals[0].id);
                    setActiveTab('analytics-detail');
                  }}
                  className="px-3 py-1.5 bg-white text-black text-xs font-black rounded-xl hover:bg-gray-100 flex-shrink-0 shadow active:scale-95 transition-all ml-2"
                >
                  Inspect
                </button>
              </div>
            ) : (
              <div className="bg-[#1E2640]/60 border border-[#2D3748] rounded-2xl p-3 flex items-center gap-2.5 text-xs text-gray-400">
                <div className="w-6 h-6 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>All Clear • No subscriptions renewing within your configured {alertLeadDays}-day warning window.</span>
              </div>
            )}

            {/* Horizontal Upcoming Renewal Stream */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>Upcoming Renewal Queue</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#1E2640] text-[#10B981] border border-[#2D3748]">
                    Live Stream
                  </span>
                </h3>
                <span className="text-[11px] text-gray-400">Horizontal scroll →</span>
              </div>

              {activeSubs.length > 0 ? (
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 no-scrollbar snap-x">
                  {activeSubs.map((sub) => {
                    const isUrgent = sub.renewDays <= 3;
                    return (
                      <div
                        key={sub.id}
                        className="bg-[#1E2640] border border-[#2D3748] rounded-2xl p-3.5 min-w-[170px] w-[170px] flex-shrink-0 snap-start flex flex-col justify-between h-40 hover:border-[#10B981]/50 transition-all card-glow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-xl bg-[#0B0F17] border border-[#2D3748] flex items-center justify-center font-bold text-white text-xs">
                            {sub.name.charAt(0)}
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              isUrgent
                                ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                                : 'bg-[#0B0F17] text-gray-400 border border-[#2D3748]'
                            }`}
                          >
                            In {sub.renewDays}d
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs truncate" title={sub.name}>
                            {sub.name}
                          </h4>
                          <div className="flex items-baseline gap-0.5 mt-0.5">
                            <span className="text-sm font-black font-mono text-white">
                              {formatMoney(sub.cost).display}
                            </span>
                            <span className="text-[9px] text-gray-400">/mo</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-[#2D3748]/60 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectedSubId(sub.id);
                              setActiveTab('analytics-detail');
                            }}
                            className="text-[10px] font-bold text-[#10B981] hover:underline"
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickCancel(sub.id, e)}
                            title="Quick Cancel"
                            className="p-1 rounded bg-[#0B0F17] hover:bg-[#EF4444]/20 text-gray-400 hover:text-[#EF4444] transition-all"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Subscription Card in stream */}
                  <div
                    onClick={() => setIsAddSubOpen(true)}
                    className="border border-dashed border-[#2D3748] hover:border-[#10B981] rounded-2xl p-3.5 min-w-[140px] w-[140px] flex-shrink-0 snap-start flex flex-col items-center justify-center h-40 cursor-pointer text-gray-400 hover:text-white transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1E2640] border border-[#2D3748] group-hover:border-[#10B981] flex items-center justify-center text-[#10B981] mb-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-center">Add Stream</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1E2640] border border-[#2D3748] rounded-2xl p-6 text-center space-y-3">
                  <p className="text-xs text-gray-400">No active subscriptions monitored. Add your first recurring service to protect against unauthorized debits.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddSubOpen(true)}
                    className="px-4 py-2 bg-[#10B981] text-black font-black text-xs rounded-xl shadow hover:bg-[#4EDEA3]"
                  >
                    + Add First Subscription
                  </button>
                </div>
              )}
            </section>

            {/* Category Spend Bento Grid */}
            <section className="space-y-2.5">
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                <span>Category Spend Distribution</span>
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {(['Entertainment', 'Creative', 'Health', 'Productivity', 'Utilities'] as const).map((cat) => {
                  const catSubs = activeSubs.filter((s) => s.category === cat);
                  const catSum = catSubs.reduce((sum, s) => sum + s.cost, 0);
                  const catPct = totalMonthlySpend > 0 ? Math.round((catSum / totalMonthlySpend) * 100) : 0;
                  return (
                    <div
                      key={cat}
                      className="bg-[#1E2640] border border-[#2D3748] rounded-2xl p-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white">{cat}</h5>
                          <span className="text-[10px] text-gray-400">
                            {catSubs.length} stream{catSubs.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-white block">
                            {formatMoney(catSum).display}
                          </span>
                          <span className="text-[10px] font-mono text-[#10B981] font-bold">{catPct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#0B0F17] h-1.5 rounded-full mt-2 overflow-hidden border border-[#2D3748]/40">
                        <div
                          className="bg-[#10B981] h-full rounded-full transition-all"
                          style={{ width: `${Math.max(4, catPct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Dark Pattern Callout Banner */}
            <div className="bg-gradient-to-r from-[#1E2640] to-[#0B0F17] border border-[#2D3748] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-white">Trapped in a retention maze?</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Use our FTC Click-to-Cancel legal script to force instant cancellation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('defense')}
                className="px-3 py-2 rounded-xl bg-[#10B981] text-black text-xs font-black shadow hover:bg-[#4EDEA3] transition-all flex-shrink-0 ml-2"
              >
                Defense Guide
              </button>
            </div>
          </div>
        )}

        {/* ==================== 2. FREE TRIAL DEFENSE VIEW ==================== */}
        {activeTab === 'trials' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Free Trial Defense Engine</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Automated countdown interceptor & auto-charge defense</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#1E2640] border border-[#2D3748] text-[#10B981]">
                {freeTrials.filter((t) => t.status === 'Active').length} Monitored
              </span>
            </div>

            {/* Policy Info Card */}
            <div className="bg-[#1E2640] border border-[#2D3748] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-gray-300">
              <svg className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>
                All trials trigger a formal push notification 48 hours prior to card debit to guarantee sufficient cancellation lead time before silent conversion.
              </span>
            </div>

            {/* Trial Cards Container */}
            <div className="space-y-3">
              {freeTrials.map((tr) => {
                const isUrgent = tr.daysLeft <= 2;
                const isCancelled = tr.status === 'Cancelled';
                const ringColor = isUrgent ? '#EF4444' : '#10B981';

                // SVG Circular Calculations
                const radius = 26;
                const circumference = 2 * Math.PI * radius; // ~163.36
                const percentage = Math.min(100, Math.max(5, (tr.daysLeft / 14) * 100));
                const strokeDashoffset = circumference - (percentage / 100) * circumference;

                return (
                  <div
                    key={tr.id}
                    className={`bg-[#1E2640] border ${
                      isUrgent && !isCancelled ? 'border-[#EF4444]/50' : 'border-[#2D3748]'
                    } rounded-3xl p-4 shadow-lg space-y-3 transition-all`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-sm text-white">{tr.name}</h3>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              isCancelled
                                ? 'bg-[#EF4444]/20 text-[#EF4444]'
                                : isUrgent
                                ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 animate-pulse'
                                : 'bg-[#10B981]/15 text-[#10B981]'
                            }`}
                          >
                            {isCancelled ? 'CANCELLED' : isUrgent ? 'URGENT EXPIRY' : 'ACTIVE TRIAL'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{tr.tier}</p>
                        <div className="mt-2 text-xs">
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-semibold">
                            Auto-Charge Conversion
                          </span>
                          <span className="text-sm font-black font-mono text-white">
                            {formatMoney(tr.costAfter).display}
                            <span className="text-[10px] text-gray-400 font-sans">/mo</span>
                          </span>
                        </div>
                      </div>

                      {/* SVG Circular Countdown Ring */}
                      <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r={radius} fill="transparent" stroke="#0B0F17" strokeWidth="5" />
                          <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            fill="transparent"
                            stroke={isCancelled ? '#4B5563' : ringColor}
                            strokeWidth="5"
                            strokeDasharray={circumference}
                            strokeDashoffset={isCancelled ? circumference : strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span
                            className={`text-xs font-black font-mono leading-none ${
                              isCancelled ? 'text-gray-500 line-through' : isUrgent ? 'text-[#EF4444]' : 'text-[#10B981]'
                            }`}
                          >
                            {tr.daysLeft}d
                          </span>
                          <span className="text-[7px] uppercase tracking-wider text-gray-400 font-bold">Left</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Interceptor Switch */}
                    <div className="pt-2 border-t border-[#2D3748]/60 flex items-center justify-between text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-300 select-none">
                        <input
                          type="checkbox"
                          checked={tr.alert48h}
                          onChange={() => handleToggleTrialAlert(tr.id)}
                          className="accent-[#10B981] w-3.5 h-3.5 rounded cursor-pointer"
                        />
                        <span>48h Push Interceptor</span>
                      </label>

                      <div className="flex items-center gap-2">
                        {!isCancelled ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCancelTrial(tr.id)}
                              className="px-2.5 py-1 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/30 text-[10px] font-bold transition-all active:scale-95"
                            >
                              Cancel Before Debit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConvertTrialToSub(tr.id)}
                              title="Keep and convert into recurring subscription"
                              className="px-2 py-1 rounded-xl bg-[#0B0F17] hover:bg-[#1E2640] border border-[#2D3748] text-gray-400 hover:text-white text-[10px] transition-all"
                            >
                              Keep
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1">
                              Charge Defeated ✓
                            </span>
                            <button
                              type="button"
                              onClick={() => handleReactivateTrial(tr.id)}
                              className="text-[10px] text-gray-400 hover:text-white underline"
                            >
                              Restore
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteTrial(tr.id)}
                          title="Delete Trial"
                          className="p-1 rounded text-gray-500 hover:text-[#EF4444] transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {freeTrials.length === 0 && (
                <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl p-6 text-center space-y-2">
                  <p className="text-xs text-gray-400">No free trials currently monitored. Add any ongoing trial to receive automatic 48h push alerts.</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsAddTrialOpen(true)}
              className="w-full py-3.5 rounded-2xl border border-dashed border-[#2D3748] hover:border-[#10B981] text-xs font-bold text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <svg className="w-4 h-4 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>+ Add New Trial Intercept</span>
            </button>
          </div>
        )}

        {/* ==================== 3. ANALYTICS & 3-STEP CANCELLATION VIEW ==================== */}
        {activeTab === 'analytics-detail' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Header & Sub Selector */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                ← Return to Dashboard
              </button>

              {/* Sub Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={currentlyInspectedSub?.id}
                  onChange={(e) => {
                    setInspectedSubId(e.target.value);
                    setCancelStep(1);
                  }}
                  className="bg-[#1E2640] border border-[#2D3748] rounded-xl px-2 py-1 text-xs text-white outline-none font-bold"
                >
                  {subscriptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentlyInspectedSub ? (
              <>
                {/* Service Summary Card */}
                <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl p-5 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B0F17] border border-[#2D3748] flex items-center justify-center font-black text-xl text-white">
                      {currentlyInspectedSub.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-white">{currentlyInspectedSub.name}</h2>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            (currentlyInspectedSub.usageDrop || 0) < -40
                              ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                              : 'bg-[#10B981]/20 text-[#10B981]'
                          }`}
                        >
                          {currentlyInspectedSub.usageDrop ? `${currentlyInspectedSub.usageDrop}% Use` : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {currentlyInspectedSub.category} • {currentlyInspectedSub.billingCycle} ({currentlyInspectedSub.paymentMethod})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-0.5 justify-end">
                      <span className="text-xl font-black font-mono text-white">
                        {formatMoney(currentlyInspectedSub.cost).display}
                      </span>
                      <span className="text-[10px] text-gray-400">/mo</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono block">
                      {formatMoney(
                        currentlyInspectedSub.billingCycle === 'Annual'
                          ? currentlyInspectedSub.cost
                          : currentlyInspectedSub.cost * 12
                      ).display}
                      /yr
                    </span>
                  </div>
                </div>

                {/* 4-Week Usage Activity Bar Chart */}
                <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#EF4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                      </svg>
                      <span>4-Week Application Usage Activity</span>
                    </h3>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        (currentlyInspectedSub.usageDrop || 0) < -40
                          ? 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30'
                          : 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30'
                      }`}
                    >
                      {(currentlyInspectedSub.usageDrop || 0) < -40
                        ? `Critical Drop: ${currentlyInspectedSub.usageDrop}%`
                        : 'Healthy Utilization'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Active weekly usage trends for {currentlyInspectedSub.name} based on synchronized device telemetry.
                  </p>

                  {/* Vertical Bar Chart */}
                  {(() => {
                    const hours = currentlyInspectedSub.weeklyHours || [8, 6, 3, 1];
                    const maxH = Math.max(...hours, 1);
                    return (
                      <div className="h-36 pt-4 flex items-end justify-between gap-3 border-b border-[#2D3748] pb-2">
                        {hours.map((h, idx) => {
                          const heightPct = Math.round((h / maxH) * 100);
                          const isLast = idx === hours.length - 1;
                          const isDrop = (currentlyInspectedSub.usageDrop || 0) < -40;
                          const barColor = isDrop && isLast ? 'bg-[#EF4444] animate-pulse' : isDrop && idx === 2 ? 'bg-[#EF4444]' : 'bg-[#10B981]';
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                              <span className={`text-[10px] font-mono ${isDrop && isLast ? 'text-[#EF4444] font-bold' : 'text-white'}`}>
                                {h.toFixed(1)}h
                              </span>
                              <div className="w-full bg-[#0B0F17] rounded-t-lg h-24 flex items-end">
                                <div
                                  className={`w-full ${barColor} rounded-t-lg transition-all duration-500`}
                                  style={{ height: `${Math.max(8, heightPct)}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-bold ${isDrop && isLast ? 'text-[#EF4444]' : 'text-gray-400'}`}>
                                W{idx + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Value Score Engine */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#1E2640] border border-[#2D3748] rounded-2xl p-3.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Cost Per Active Hour</span>
                    <span className="text-xl font-black font-mono text-[#EF4444]">
                      {formatMoney(currentlyInspectedSub.costPerHour || 4.5).display}
                      <span className="text-xs text-gray-400 font-sans">/hr</span>
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Target: &lt; {currency === 'PHP' ? '₱195' : '$3.50'}/hr
                    </span>
                  </div>
                  <div className="bg-[#1E2640] border border-[#2D3748] rounded-2xl p-3.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Value Score</span>
                    <span className="text-xl font-black font-mono text-[#EF4444]">
                      {currentlyInspectedSub.valueScore || 45} <span className="text-xs text-gray-400 font-sans">/ 100</span>
                    </span>
                    <span className="text-[10px] text-[#EF4444] font-bold block mt-1">
                      {(currentlyInspectedSub.valueScore || 45) < 50 ? 'Severe Underuse' : 'Moderate Value'}
                    </span>
                  </div>
                </div>

                {/* 3-Step Guided Cancellation or Reactivate Box */}
                {currentlyInspectedSub.status === 'Active' ? (
                  <div className="bg-gradient-to-b from-[#1E2640] to-[#0B0F17] border border-[#EF4444]/50 rounded-3xl p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#2D3748] pb-3">
                      <h3 className="font-black text-sm text-white flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#EF4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        <span>3-Step Guided Cancellation Defense</span>
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-[#10B981]">
                        Step {cancelStep} of 3
                      </span>
                    </div>

                    {/* Step 1: Legal Notification & Identification */}
                    {cancelStep === 1 && (
                      <div className="space-y-3">
                        <div className="bg-[#0B0F17] p-3 rounded-xl border border-[#2D3748] text-xs text-gray-300 leading-relaxed">
                          Under <strong>FTC 16 CFR Part 425</strong> and Regulation E, merchants are legally required to provide a cancellation path that is as simple and direct as signup.
                        </div>
                        <p className="text-xs text-gray-400">
                          Target Service: <strong className="text-white">{currentlyInspectedSub.name}</strong>. Ready to initiate statutory revocation:
                        </p>
                        <button
                          type="button"
                          onClick={() => setCancelStep(2)}
                          className="w-full py-3 bg-[#10B981] text-black font-black text-xs rounded-xl shadow hover:bg-[#4EDEA3] transition-all"
                        >
                          Confirm & Proceed to Survey Shield →
                        </button>
                      </div>
                    )}

                    {/* Step 2: Survey Defense Countermeasure */}
                    {cancelStep === 2 && (
                      <div className="space-y-3">
                        <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl p-2.5 text-[11px] text-[#EF4444] font-semibold">
                          Defense Strategy: Selecting &quot;Too Expensive&quot; automatically bypasses 68% of downstream retention discount loops and saves your time.
                        </div>
                        <div className="space-y-2 text-xs">
                          <label className="flex items-center gap-2 bg-[#0B0F17] p-2.5 rounded-xl border border-[#10B981] cursor-pointer">
                            <input
                              type="radio"
                              name="cancel-reason"
                              value="Cost exceeds value / Too Expensive (Auto-Skip)"
                              checked={cancelReason.includes('Too Expensive')}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="accent-[#10B981]"
                            />
                            <span className="text-white font-bold">Cost exceeds value / Too Expensive (Auto-Skip)</span>
                          </label>
                          <label className="flex items-center gap-2 bg-[#0B0F17] p-2.5 rounded-xl border border-[#2D3748] cursor-pointer text-gray-400">
                            <input
                              type="radio"
                              name="cancel-reason"
                              value="Switched to alternative provider"
                              checked={cancelReason.includes('alternative')}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="accent-[#10B981]"
                            />
                            <span>Switched to alternative software</span>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCancelStep(1)}
                            className="w-1/3 py-2.5 rounded-xl border border-[#2D3748] text-xs text-gray-400 font-bold"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelStep(3)}
                            className="w-2/3 py-2.5 bg-[#EF4444] text-white font-black text-xs rounded-xl hover:bg-red-600 shadow transition-all"
                          >
                            Execute Revocation →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Execution & Audit Record */}
                    {cancelStep === 3 && (
                      <div className="space-y-3 text-center py-2">
                        <div className="w-12 h-12 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <h4 className="font-black text-white text-sm">Ready to Execute Revocation</h4>
                        <p className="text-xs text-gray-400 leading-snug">
                          Permanently terminate {currentlyInspectedSub.name}. Projected savings:{' '}
                          <strong className="text-[#10B981] font-mono">
                            {formatMoney(currentlyInspectedSub.cost).display}/mo (
                            {formatMoney(currentlyInspectedSub.cost * 12).display}/yr)
                          </strong>
                          .
                        </p>
                        <button
                          type="button"
                          onClick={() => handleFinalizeCancel(currentlyInspectedSub.id)}
                          className="w-full py-3 bg-[#10B981] text-black font-black text-xs rounded-xl shadow hover:bg-[#4EDEA3]"
                        >
                          Execute Statutory Cancellation
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl p-5 shadow-xl text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center mx-auto">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-white text-sm">Subscription Is Currently Cancelled</h4>
                    <p className="text-xs text-gray-400">
                      You are saving {formatMoney(currentlyInspectedSub.cost).display}/month by maintaining this cancellation.
                    </p>
                    <div className="flex gap-2 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => handleReactivateSub(currentlyInspectedSub.id)}
                        className="px-4 py-2 bg-[#10B981] text-black font-bold text-xs rounded-xl shadow hover:bg-[#4EDEA3]"
                      >
                        Reactivate Subscription
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSub(currentlyInspectedSub.id)}
                        className="px-4 py-2 bg-[#0B0F17] text-[#EF4444] font-bold text-xs rounded-xl border border-[#2D3748] hover:bg-[#EF4444]/10"
                      >
                        Delete Record
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl p-6 text-center">
                <p className="text-xs text-gray-400">No subscription selected.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== 4. DARK PATTERN DEFENSE CORE VIEW ==================== */}
        {activeTab === 'defense' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Dark Pattern Defense Core</h2>
                <p className="text-xs text-gray-400">Deceptive retention bypass & statutory revocation script</p>
              </div>
            </div>

            {/* Legal Revocation Letter Generator Card */}
            <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#2D3748] pb-2.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>FTC Click-to-Cancel Statutory Notice</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyLegalNotice}
                  className="px-3 py-1.5 rounded-xl bg-[#10B981] text-black text-xs font-black shadow hover:bg-[#4EDEA3] flex items-center gap-1 transition-all active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{copiedScript ? '✓ Copied!' : '1-Tap Copy Script'}</span>
                </button>
              </div>

              {/* Target Service Customization Inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Merchant</label>
                  <input
                    type="text"
                    value={targetLegalService}
                    onChange={(e) => setTargetLegalService(e.target.value)}
                    placeholder="e.g. Adobe, Gym, Netflix"
                    className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl px-2.5 py-1.5 text-white font-medium focus:border-[#10B981] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Card Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    placeholder="e.g. 4821"
                    className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl px-2.5 py-1.5 text-white font-mono focus:border-[#10B981] outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#0B0F17] p-3.5 rounded-2xl border border-[#2D3748] font-mono text-[11px] text-gray-300 leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap select-all">
                {getCustomLegalScript()}
              </div>
            </div>

            {/* Tactical Countermeasure Cards */}
            <div className="space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-gray-400">Tactical Retention Defenses</h3>

              {[
                {
                  id: 1,
                  title: 'The Forced Phone Call Labyrinth',
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ),
                  tactic: 'Disables online cancellation buttons and forces customers into 45-minute phone queues.',
                  countermeasure: 'Submit our written Regulation E revocation via ticket or email. If debited again, banks must legally reverse the unauthorized transaction.',
                  protocol: 'Step 1: Send written statutory notice via email / chat ticket. Step 2: Save timestamped screenshot. Step 3: Contact card issuer to block merchant authorization under Regulation E (12 CFR § 1005.10).',
                },
                {
                  id: 2,
                  title: 'The Guilt-Trip Multi-Step Survey Maze',
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                    </svg>
                  ),
                  tactic: 'Traps users in 5+ survey screens claiming "You\'ll lose all cloud data and benefits forever."',
                  countermeasure: 'Always select "Too Expensive / Cost Exceeds Value". This bypasses automated retainers and branches straight to confirmation.',
                  protocol: 'Never select "Technical Issues" or "Temporary Pause" as they trigger retention bot escalation loops.',
                },
                {
                  id: 3,
                  title: 'The Hidden Recurring Conversion Trap',
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  ),
                  tactic: '$1 trial quietly converts into an annual non-refundable $140 subscription.',
                  countermeasure: 'Use SubscriptionGuard\'s 48-hour push interceptor and cancel immediately upon trial signup.',
                  protocol: 'Virtually all major platforms preserve trial access until the end of the promotional window even after cancelling auto-renewal.',
                },
                {
                  id: 4,
                  title: 'The Disappearing Cancel Button',
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  ),
                  tactic: 'Renders the "Cancel Plan" button in low-contrast gray text or buried inside nested account settings menus.',
                  countermeasure: 'Directly navigate to the billing portal or revoke via Open Banking bank portal.',
                  protocol: 'Search page HTML for "cancel" or invoke the bank card token revocation tool.',
                },
              ].map((item) => (
                <div key={item.id} className="bg-[#1E2640] border border-[#2D3748] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#EF4444] font-bold text-xs">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedTactic(expandedTactic === item.id ? null : item.id)}
                      className="text-[11px] text-[#10B981] hover:underline font-bold"
                    >
                      {expandedTactic === item.id ? 'Hide Protocol' : 'View Protocol'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <strong className="text-gray-300">Merchant Tactic:</strong> {item.tactic}
                    <br />
                    <strong className="text-[#10B981]">Countermeasure:</strong> {item.countermeasure}
                  </p>
                  {expandedTactic === item.id && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#0B0F17] border border-[#10B981]/30 text-[11px] text-gray-300 animate-in fade-in">
                      <span className="font-bold text-[#10B981] block mb-1">Defense Protocol:</span>
                      {item.protocol}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 5. SQL QUERY INSPECTOR VIEW ==================== */}
        {activeTab === 'sql' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                  <span>Relational SQL Inspector</span>
                </h2>
                <p className="text-xs text-gray-400">Sandboxed in-memory query terminal & immutable audit trail</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                ACID Emulation
              </span>
            </div>

            {/* SQL Terminal Box */}
            <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl p-4 shadow-2xl space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="e.g. SELECT * FROM subscriptions WHERE status = 'Active'"
                  className="flex-1 bg-[#0B0F17] border border-[#2D3748] rounded-xl px-3 py-2 text-xs font-mono text-[#10B981] focus:outline-none focus:border-[#10B981]"
                />
                <button
                  type="button"
                  onClick={() => runSQL(sqlQuery)}
                  className="px-4 py-2 bg-[#10B981] text-black font-black text-xs rounded-xl shadow hover:bg-[#4EDEA3] active:scale-95 transition-all"
                >
                  Run
                </button>
              </div>

              {/* Preset Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSqlQuery("SELECT * FROM subscriptions WHERE status = 'Active'")}
                  className="px-2 py-1 rounded-lg bg-[#0B0F17] border border-[#2D3748] text-[10px] font-mono text-gray-400 hover:text-white"
                >
                  Active Subs
                </button>
                <button
                  type="button"
                  onClick={() => setSqlQuery("SELECT * FROM subscriptions WHERE status = 'Cancelled'")}
                  className="px-2 py-1 rounded-lg bg-[#0B0F17] border border-[#2D3748] text-[10px] font-mono text-gray-400 hover:text-white"
                >
                  Cancelled Subs
                </button>
                <button
                  type="button"
                  onClick={() => setSqlQuery('SELECT * FROM free_trials WHERE daysLeft <= 2')}
                  className="px-2 py-1 rounded-lg bg-[#0B0F17] border border-[#2D3748] text-[10px] font-mono text-gray-400 hover:text-white"
                >
                  Expiring Trials
                </button>
                <button
                  type="button"
                  onClick={() => setSqlQuery('SELECT * FROM audit_logs')}
                  className="px-2 py-1 rounded-lg bg-[#0B0F17] border border-[#2D3748] text-[10px] font-mono text-gray-400 hover:text-white"
                >
                  Audit Ledger
                </button>
                <button
                  type="button"
                  onClick={() => setSqlQuery('SELECT * FROM subscriptions WHERE cost > 20')}
                  className="px-2 py-1 rounded-lg bg-[#0B0F17] border border-[#2D3748] text-[10px] font-mono text-gray-400 hover:text-white"
                >
                  High Cost (&gt;20)
                </button>
              </div>
            </div>

            {/* Results Table View */}
            <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#2D3748] pb-2">
                <span className="text-xs font-bold text-white">Query Execution Output</span>
                <span className="text-[10px] font-mono text-[#10B981]">
                  {sqlResultRows.length} rows returned
                </span>
              </div>

              {sqlError ? (
                <div className="p-3 text-xs text-[#EF4444] font-mono bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/20">
                  {sqlError}
                </div>
              ) : sqlResultRows.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  0 records found matching this query criteria.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-64 no-scrollbar">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-[#0B0F17] text-gray-400 text-[10px] uppercase">
                      <tr>
                        {sqlHeaders.map((h, i) => (
                          <th key={i} className="p-2 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D3748]">
                      {sqlResultRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#0B0F17]/40">
                          {row.map((col, cIdx) => {
                            let textClass = 'p-2 text-white whitespace-nowrap';
                            if (col === 'Active' || col === 'VAULT_SYNCED' || col === 'Armed') {
                              textClass = 'p-2 text-[#10B981] font-bold whitespace-nowrap';
                            }
                            if (col === 'Cancelled' || col === 'URGENT EXPIRY' || col === 'Off') {
                              textClass = 'p-2 text-[#EF4444] font-bold whitespace-nowrap';
                            }
                            return (
                              <td key={cIdx} className={textClass}>
                                {col}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-2 border-t border-[#2D3748] flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="px-3 py-2 rounded-xl border border-[#2D3748] text-xs font-bold text-gray-300 hover:text-white hover:border-[#10B981] transition-all"
                  >
                    📥 Export JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-2 rounded-xl border border-[#2D3748] text-xs font-bold text-gray-300 hover:text-white hover:border-[#10B981] transition-all"
                  >
                    📤 Import JSON
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2D3748] text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
                >
                  Reset Vault State
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== FIXED 4-TAB BOTTOM NAVIGATION BAR ==================== */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-[#2D3748] z-40 px-6">
        <div className="max-w-md mx-auto h-full flex justify-around items-center">
          {/* Tab 1: Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-all ${
              activeTab === 'dashboard' ? 'text-[#10B981] font-bold' : 'text-gray-400 hover:text-white font-medium'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="text-[10px] tracking-tight">Dashboard</span>
          </button>

          {/* Tab 2: Free Trials */}
          <button
            type="button"
            onClick={() => setActiveTab('trials')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-all relative ${
              activeTab === 'trials' ? 'text-[#10B981] font-bold' : 'text-gray-400 hover:text-white font-medium'
            }`}
          >
            {freeTrials.some((t) => t.daysLeft <= 2 && t.status === 'Active') && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-[#0B0F17] animate-ping" />
            )}
            <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[10px] tracking-tight">Trials</span>
          </button>

          {/* Tab 3: Defense */}
          <button
            type="button"
            onClick={() => setActiveTab('defense')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-all ${
              activeTab === 'defense' ? 'text-[#10B981] font-bold' : 'text-gray-400 hover:text-white font-medium'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[10px] tracking-tight">Defense</span>
          </button>

          {/* Tab 4: SQL Vault */}
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-all ${
              activeTab === 'sql' ? 'text-[#10B981] font-bold' : 'text-gray-400 hover:text-white font-medium'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            <span className="text-[10px] tracking-tight">SQL Vault</span>
          </button>
        </div>
      </nav>

      {/* ==================== INTERACTIVE MODALS ==================== */}
      {/* 1. Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isAddSubOpen}
        onClose={() => setIsAddSubOpen(false)}
        currency={currency}
        usdRate={USD_RATE}
        onAdd={handleAddSubscription}
      />

      {/* 2. Add Free Trial Modal */}
      <AddFreeTrialModal
        isOpen={isAddTrialOpen}
        onClose={() => setIsAddTrialOpen(false)}
        currency={currency}
        usdRate={USD_RATE}
        onAdd={handleAddFreeTrial}
      />

      {/* 3. Edit Budget Modal */}
      <EditBudgetModal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        currentBudget={budgetCap}
        currency={currency}
        usdRate={USD_RATE}
        onSave={(newBudget) => {
          setBudgetCap(newBudget);
          addToast('success', 'Budget Ceiling Updated', `New ceiling set to ${formatMoney(newBudget).display}.`);
        }}
      />

      {/* 4. Import Ledger Modal */}
      <ImportLedgerModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportJSON}
      />

      {/* 5. Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        isDestructive={confirmModalConfig.isDestructive}
      />

      {/* 6. Onboarding & Alert Timing Setup Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          setIsFirstLaunch(false);
        }}
        currentAlertDays={alertLeadDays}
        currentCurrency={currency}
        currentBudget={budgetCap}
        onSavePreferences={handleSavePreferences}
        isFirstLaunch={isFirstLaunch}
      />
    </div>
  );
}
