import { UserProfile, Subscription, FreeTrial, UsageLog, DarkPatternGuide, AuditLog } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  user_id: 'usr_88291410',
  email: 'hisita2321186@mkt.ceu.edu.ph',
  full_name: 'Alex Rivera',
  avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAgzpswIxn3rhsx36aRBLuA7NNbq1L3-dmG1LLgRV31fQqlUruo-MjEHktMmkbD32Oba-hgrDm02HOu66A6RVVxgH0QOKpB_it64mcxtB3QRMdoXeCUeUkrG-0obC1n-DrYyaY_d6ZcHbUDpjkgRdqHiUXPj0Dv1bT5CxK-drfYftQPqz82OC6vMFVqoUptW5Hdz7y_X-8mQoJnja9I8OTXfWobI-HU7vUjgXDSoDvRv3ifU8jqcD3',
  created_at: '2026-05-10T08:00:00Z',
  monthly_estimated_spend: 214.50,
  currency: 'PHP',
  linked_bank_name: 'Chase Premier Checking (•••• 9012)',
  bank_connected: true,
  onboarding_completed: true,
  budget_limit: 250.00,
};

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    subscription_id: 'sub_adobe_cc',
    user_id: 'usr_88291410',
    service_name: 'Adobe Creative Cloud',
    category: 'Creative',
    billing_cycle: 'Monthly',
    cost: 54.99,
    next_billing_date: '2026-08-19', // ~12 days from today
    payment_method: 'Mastercard •••• 4821',
    status: 'Active',
    cancellation_url: 'https://account.adobe.com/plans',
    logo_icon: 'brush',
    accent_color: '#EF4444',
    notes: 'All Apps Plan. Low usage detected in last 2 weeks.',
    created_at: '2025-08-19T00:00:00Z',
    auto_renew: true,
  },
  {
    subscription_id: 'sub_netflix',
    user_id: 'usr_88291410',
    service_name: 'Netflix',
    category: 'Entertainment',
    billing_cycle: 'Monthly',
    cost: 22.99,
    next_billing_date: '2026-08-09', // 2 days from today (renews in ≤ 3 days)
    payment_method: 'Visa •••• 1093',
    status: 'Active',
    cancellation_url: 'https://www.netflix.com/youraccount',
    logo_icon: 'N',
    accent_color: '#E50914',
    notes: 'Standard 4K Tier with spatial audio.',
    created_at: '2024-06-12T00:00:00Z',
    auto_renew: true,
  },
  {
    subscription_id: 'sub_spotify',
    user_id: 'usr_88291410',
    service_name: 'Spotify',
    category: 'Entertainment',
    billing_cycle: 'Monthly',
    cost: 14.99,
    next_billing_date: '2026-08-10', // 3 days from today (renews in ≤ 3 days)
    payment_method: 'PayPal (Linked)',
    status: 'Active',
    cancellation_url: 'https://www.spotify.com/account/overview/',
    logo_icon: 'S',
    accent_color: '#1DB954',
    notes: 'Premium Individual plan.',
    created_at: '2023-06-14T00:00:00Z',
    auto_renew: true,
  },
  {
    subscription_id: 'sub_icloud',
    user_id: 'usr_88291410',
    service_name: 'iCloud',
    category: 'Utilities',
    billing_cycle: 'Monthly',
    cost: 0.99,
    next_billing_date: '2026-08-10', // 3 days from today (renews in ≤ 3 days)
    payment_method: 'Apple Pay',
    status: 'Active',
    cancellation_url: 'https://support.apple.com/HT207594',
    logo_icon: 'cloud',
    accent_color: '#0A84FF',
    notes: '50GB Storage plan for device backups.',
    created_at: '2022-06-15T00:00:00Z',
    auto_renew: true,
  },
  {
    subscription_id: 'sub_chatgpt',
    user_id: 'usr_88291410',
    service_name: 'ChatGPT Plus',
    category: 'Productivity',
    billing_cycle: 'Monthly',
    cost: 20.00,
    next_billing_date: '2026-08-22',
    payment_method: 'Mastercard •••• 4821',
    status: 'Active',
    cancellation_url: 'https://chatgpt.com/#settings/subscription',
    logo_icon: 'psychology',
    accent_color: '#10A37F',
    notes: 'GPT-4o & specialized agent plugins.',
    created_at: '2025-01-22T00:00:00Z',
    auto_renew: true,
  },
  {
    subscription_id: 'sub_health_gym',
    user_id: 'usr_88291410',
    service_name: 'Equinox Gym & Spa',
    category: 'Health',
    billing_cycle: 'Monthly',
    cost: 100.54,
    next_billing_date: '2026-08-28',
    payment_method: 'Direct Debit ACH',
    status: 'Active',
    cancellation_url: 'https://www.equinox.com/account/membership',
    logo_icon: 'fitness_center',
    accent_color: '#10B981',
    notes: 'All-club access. Hidden in-person cancellation policy.',
    created_at: '2025-02-28T00:00:00Z',
    auto_renew: true,
  },
];

export const INITIAL_FREE_TRIALS: FreeTrial[] = [
  {
    trial_id: 'trial_disney_plus',
    user_id: 'usr_88291410',
    service_name: 'Disney+',
    tier_name: 'Standard Tier',
    start_date: '2026-08-02',
    expiry_date: '2026-08-09', // 2 days remaining (urgent red!)
    cost_after_trial: 13.99,
    alert_lead_time_hours: 48,
    auto_renew_flag: true,
    status: 'Active',
    logo_img_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYSLxz3kvVp1hkUEL7BKbCy_AFNhvf812PBPpdAiKSkIa4YK8eNy4l45LX0yk-NkX8eDK3Ipkc7vhLNspsXpceaZv0IxEAiu8nDEwDk2LfItWJna1-4VLzzQcl6AUWi-ZXcJNkb2K7mzSBTRZonrYqehfVw0upzBVSiDCKOQR8msrNX4LNsBeT5C9kE32k1OaLGyznEUPCzSflmVoMfB5rJffjagiUNRXAtzlNUqAERc6FvWkTrrBe',
    logo_icon: 'live_tv',
    accent_color: '#113CCF',
    cancellation_url: 'https://www.disneyplus.com/account/subscription',
    notification_enabled: true,
  },
  {
    trial_id: 'trial_hellofresh',
    user_id: 'usr_88291410',
    service_name: 'HelloFresh',
    tier_name: 'Meal Plan Box',
    start_date: '2026-08-05',
    expiry_date: '2026-08-12', // 5 days remaining (action emerald!)
    cost_after_trial: 65.00,
    alert_lead_time_hours: 48,
    auto_renew_flag: true,
    status: 'Active',
    logo_img_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNHMoImth21yiGgNy0FnroYI_VyzVkXryTOEmcN04PQhia1fTRTlOmHrrShIoGpUTpaZSnS_3TmZiRcW1ZFmTXMhTh9Bfh8LmVVjdVxG3qjXmafn0yry1CIAhhM3pQ_DoKQs3gJjXtEZLBgMzVo8ht-Sj490gf-mXYe_NpmvpAFu0yDg_5zU5DRE73I9FUnzCPmzmtKCC-8kV2YmYX_E7L_T15ShICG9M9pTnZuHo5etZvpLlqcrgM',
    logo_icon: 'restaurant',
    accent_color: '#91C11E',
    cancellation_url: 'https://www.hellofresh.com/my-account/settings',
    notification_enabled: true,
  },
  {
    trial_id: 'trial_audible',
    user_id: 'usr_88291410',
    service_name: 'Audible',
    tier_name: 'Premium Plus (1-Month)',
    start_date: '2026-08-01',
    expiry_date: '2026-08-19', // 12 days remaining
    cost_after_trial: 14.95,
    alert_lead_time_hours: 72,
    auto_renew_flag: true,
    status: 'Active',
    logo_icon: 'headphones',
    accent_color: '#F8991C',
    cancellation_url: 'https://www.audible.com/account/overview',
    notification_enabled: true,
  },
];

export const INITIAL_USAGE_LOGS: UsageLog[] = [
  {
    log_id: 'log_adobe_cc',
    user_id: 'usr_88291410',
    subscription_id: 'sub_adobe_cc',
    last_opened_timestamp: '2026-08-05T14:22:00Z',
    total_monthly_hours: 20.25,
    user_value_rating: 2, // Low value
    weekly_hours: [12.0, 6.0, 1.5, 0.75], // W1, W2, W3, W4 (Matching screenshot)
    historical_average_hours: 14.5,
    drop_percentage: 78, // Usage dropped by 78% in last two weeks!
  },
  {
    log_id: 'log_netflix',
    user_id: 'usr_88291410',
    subscription_id: 'sub_netflix',
    last_opened_timestamp: '2026-08-06T21:40:00Z',
    total_monthly_hours: 38.5,
    user_value_rating: 4,
    weekly_hours: [9.0, 11.5, 8.0, 10.0],
    historical_average_hours: 9.5,
    drop_percentage: 0,
  },
  {
    log_id: 'log_spotify',
    user_id: 'usr_88291410',
    subscription_id: 'sub_spotify',
    last_opened_timestamp: '2026-08-07T06:15:00Z',
    total_monthly_hours: 52.0,
    user_value_rating: 5,
    weekly_hours: [13.0, 14.0, 12.5, 12.5],
    historical_average_hours: 13.0,
    drop_percentage: 0,
  },
  {
    log_id: 'log_chatgpt',
    user_id: 'usr_88291410',
    subscription_id: 'sub_chatgpt',
    last_opened_timestamp: '2026-08-07T05:30:00Z',
    total_monthly_hours: 28.0,
    user_value_rating: 5,
    weekly_hours: [7.0, 7.5, 6.5, 7.0],
    historical_average_hours: 7.0,
    drop_percentage: 0,
  },
  {
    log_id: 'log_health_gym',
    user_id: 'usr_88291410',
    subscription_id: 'sub_health_gym',
    last_opened_timestamp: '2026-08-01T07:30:00Z',
    total_monthly_hours: 4.0,
    user_value_rating: 1, // Extremely low value ($28.13 per visit)
    weekly_hours: [2.0, 1.0, 0.5, 0.5],
    historical_average_hours: 6.0,
    drop_percentage: 65,
  }
];

export const DARK_PATTERN_GUIDES: DarkPatternGuide[] = [
  {
    guide_id: 'dp_adobe',
    service_name: 'Adobe Creative Cloud',
    dark_pattern_type: 'Multi-screen Guilt-Trip',
    severity: 'High',
    overview: 'Adobe uses a multi-tier retention labyrinth: early termination fee warnings (up to $150), guilt-tripping asset deletion notices, and 2-month free decoy discount prompts.',
    quick_bypass_strategy: 'Select "Too Expensive" on screen 1 to bypass the feature survey, decline the 2-month discount offer, and immediately confirm before the discount counter locks your contract.',
    steps: [
      {
        number: 1,
        title: 'Confirm Identity & Plan',
        description: 'Navigate to account.adobe.com/plans, sign in, and click "Manage Plan" -> "Cancel your plan".'
      },
      {
        number: 2,
        title: 'Select Reason ("Too Expensive")',
        description: 'Choose "Too Expensive" from the dropdown. This automatically suppresses the technical troubleshooting questionnaire and triggers the skip flow.'
      },
      {
        number: 3,
        title: 'Bypass Offers & Finalize Termination',
        description: 'Reject the "Stay for 2 months at $29.99" popup by clicking the faint grey "No thanks, continue to cancel" text at the bottom. Save the confirmation reference.'
      }
    ]
  },
  {
    guide_id: 'dp_disney',
    service_name: 'Disney+',
    dark_pattern_type: 'Hidden Cancel Button',
    severity: 'Medium',
    overview: 'Disney hides the cancellation link inside deeply nested sub-menus and places a high-contrast "Pause Subscription" button to trick users into maintaining billing eligibility.',
    quick_bypass_strategy: 'Do not click "Pause Subscription". Scroll past the primary green action buttons to find the low-contrast red link labeled "Cancel Subscription" at the bottom of the page.',
    steps: [
      {
        number: 1,
        title: 'Access Billing Settings',
        description: 'Tap Profile -> Account -> Select "Disney+ (Monthly)" under Subscription.'
      },
      {
        number: 2,
        title: 'Ignore "Pause" Recommendations',
        description: 'Bypass the "Pause for 1 month" prompt by clicking "Continue to Cancel".'
      },
      {
        number: 3,
        title: 'Submit Survey & Confirm',
        description: 'Pick any reason, click the final "Complete Cancellation" button, and verify your access expires on the trial date.'
      }
    ]
  },
  {
    guide_id: 'dp_hellofresh',
    service_name: 'HelloFresh',
    dark_pattern_type: 'Deceptive Discount Loop',
    severity: 'High',
    overview: 'HelloFresh requires cancellation 5 full days before delivery cutoffs. If you miss the cutoff by 1 minute, you are billed for the entire next week.',
    quick_bypass_strategy: 'Click "Deactivate Subscription" under Plan Settings, confirm "Cancel Anyway" across 4 confirmation screens, and check your email for the cancellation code.',
    steps: [
      {
        number: 1,
        title: 'Locate Deactivate Option',
        description: 'Go to Settings -> Plan Settings -> scroll to the bottom right and click "Cancel My Subscription".'
      },
      {
        number: 2,
        title: 'Navigate 4 Exit Hurdles',
        description: 'HelloFresh presents 4 consecutive screens showing ingredients you will miss. Click "Cancel Anyway" on each.'
      },
      {
        number: 3,
        title: 'Verify Deactivated Status',
        description: 'Confirm the status badge changes from "Active" to "Deactivated" and save the confirmation receipt.'
      }
    ]
  },
  {
    guide_id: 'dp_gym',
    service_name: 'Equinox Gym / Fitness Clubs',
    dark_pattern_type: 'Forced Chat/Phone Call',
    severity: 'Critical',
    overview: 'Many fitness clubs mandate in-person registered certified letters or 45-day advance written notice to terminate direct debits.',
    quick_bypass_strategy: 'Use the SubscriptionGuard FTC "Click-to-Cancel" enforcement script or request a direct bank block via your ACH account.',
    steps: [
      {
        number: 1,
        title: 'Generate Legal Revocation Letter',
        description: 'Use our 1-click generator to email the gym billing director invoking Regulation E direct debit cancellation.'
      },
      {
        number: 2,
        title: 'Notify Your Bank',
        description: 'Instruct your bank to place a stop-payment order on ACH merchant ID to prevent surprise retention charges.'
      },
      {
        number: 3,
        title: 'Record Timestamped Proof',
        description: 'Save the sent email and bank confirmation in SubscriptionGuard audit logs.'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    log_id: 'audit_01',
    timestamp: '2026-08-06T10:14:00Z',
    action_type: 'LINKED_BANK',
    service_name: 'Chase Checking',
    amount_saved: 0,
    details: 'Connected mock banking feed. Discovered 6 recurring billing cycles and 3 free trial records.'
  },
  {
    log_id: 'audit_02',
    timestamp: '2026-08-04T18:30:00Z',
    action_type: 'CANCELLED_SUBSCRIPTION',
    service_name: 'HBO Max',
    amount_saved: 16.99,
    details: 'Executed 1-tap cancellation guide to bypass hidden retainers. Saved $16.99/mo ($203.88/yr).'
  }
];
