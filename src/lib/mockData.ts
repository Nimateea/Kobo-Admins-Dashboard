export interface AppUser {
  id: string
  name: string
  email: string
  phone: string
  status: 'Active' | 'Pending' | 'Restricted' | 'Suspended' | 'Deactivated'
  plan: 'Free' | 'Premium'
  country: string
  region: string
  accounts: number
  risk: 'Low' | 'Medium' | 'High'
}

const CTRY: Record<string, [string, string]> = {
  NG: ['Nigeria', 'West Africa'],
  GH: ['Ghana', 'West Africa'],
  SN: ['Senegal', 'West Africa'],
  KE: ['Kenya', 'East Africa'],
  ZA: ['South Africa', 'Southern Africa'],
  GB: ['United Kingdom', 'Europe'],
}
export const countryOf = (code: string) => CTRY[code]?.[0] ?? code
export const regionOf = (code: string) => CTRY[code]?.[1] ?? 'Other'

export const USERS: AppUser[] = [
  { id: 'USR-1042', name: 'Adaeze Okafor', email: 'adaeze.okafor@mail.com', phone: '+234 803 555 0142', status: 'Active', plan: 'Premium', country: 'NG', accounts: 3, risk: 'Low', region: 'West Africa' },
  { id: 'USR-1055', name: 'Tunde Bakare', email: 'tunde.b@mail.com', phone: '+234 806 555 0188', status: 'Active', plan: 'Free', country: 'NG', accounts: 1, risk: 'Low', region: 'West Africa' },
  { id: 'USR-1061', name: 'Chioma Eze', email: 'chioma.eze@mail.com', phone: '+234 810 555 0129', status: 'Pending', plan: 'Free', country: 'NG', accounts: 0, risk: 'Low', region: 'West Africa' },
  { id: 'USR-1077', name: 'Ibrahim Musa', email: 'ibrahim.m@mail.com', phone: '+234 812 555 0170', status: 'Restricted', plan: 'Premium', country: 'NG', accounts: 2, risk: 'High', region: 'West Africa' },
  { id: 'USR-1083', name: 'Kemi Adeyemi', email: 'kemi.ade@mail.com', phone: '+234 909 555 0114', status: 'Active', plan: 'Premium', country: 'NG', accounts: 4, risk: 'Medium', region: 'West Africa' },
  { id: 'USR-1090', name: 'Sarah Mensah', email: 'sarah.mensah@mail.com', phone: '+233 24 555 0166', status: 'Active', plan: 'Free', country: 'GH', accounts: 2, risk: 'Low', region: 'West Africa' },
  { id: 'USR-1102', name: 'Emeka Nwosu', email: 'emeka.n@mail.com', phone: '+234 805 555 0193', status: 'Suspended', plan: 'Free', country: 'NG', accounts: 1, risk: 'High', region: 'West Africa' },
  { id: 'USR-1118', name: 'Zainab Bello', email: 'zainab.b@mail.com', phone: '+234 813 555 0121', status: 'Deactivated', plan: 'Free', country: 'NG', accounts: 0, risk: 'Low', region: 'West Africa' },
  { id: 'USR-1124', name: 'Wanjiru Kamau', email: 'wanjiru.k@mail.com', phone: '+254 712 555 0134', status: 'Active', plan: 'Premium', country: 'KE', accounts: 2, risk: 'Low', region: 'East Africa' },
  { id: 'USR-1131', name: 'Thabo Nkosi', email: 'thabo.n@mail.com', phone: '+27 82 555 0177', status: 'Active', plan: 'Free', country: 'ZA', accounts: 1, risk: 'Low', region: 'Southern Africa' },
  { id: 'USR-1139', name: 'Amina Diallo', email: 'amina.d@mail.com', phone: '+221 77 555 0152', status: 'Pending', plan: 'Free', country: 'SN', accounts: 0, risk: 'Low', region: 'West Africa' },
  { id: 'USR-1147', name: 'Oluwaseun Adebayo', email: 'seun.a@mail.com', phone: '+44 7700 555 019', status: 'Active', plan: 'Premium', country: 'GB', accounts: 3, risk: 'Medium', region: 'Europe' },
]

export interface Provider {
  name: string
  status: 'Healthy' | 'Warning' | 'Degraded' | 'Disabled' | 'Pending'
  syncSuccess: string
  avgSync: string
  apiErrors: number
  webhookErrors: number
  connections: string
}

export const PROVIDERS: Provider[] = [
  { name: 'Mono', status: 'Healthy', syncSuccess: '99.2%', avgSync: '4.1s', apiErrors: 12, webhookErrors: 2, connections: '8,420' },
  { name: 'Stitch', status: 'Warning', syncSuccess: '96.4%', avgSync: '6.8s', apiErrors: 58, webhookErrors: 9, connections: '5,112' },
  { name: 'Paystack', status: 'Degraded', syncSuccess: '88.1%', avgSync: '11.2s', apiErrors: 214, webhookErrors: 31, connections: '3,970' },
  { name: 'Flutterwave', status: 'Healthy', syncSuccess: '98.7%', avgSync: '4.9s', apiErrors: 21, webhookErrors: 4, connections: '2,655' },
]

export interface Ticket {
  id: string
  category: string
  userId: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'New' | 'Open' | 'Waiting' | 'Escalated' | 'Resolved' | 'Closed'
  assignee: string
  age: string
}

export const TICKETS: Ticket[] = [
  { id: 'TCK-2031', category: 'Bank connection', userId: 'USR-1055', priority: 'High', status: 'Escalated', assignee: 'Funmi A.', age: '2h' },
  { id: 'TCK-2032', category: 'Missing transaction', userId: 'USR-1083', priority: 'Medium', status: 'Open', assignee: 'Chidi O.', age: '5h' },
  { id: 'TCK-2033', category: 'Incorrect categorization', userId: 'USR-1042', priority: 'Low', status: 'Waiting', assignee: 'Funmi A.', age: '1d' },
  { id: 'TCK-2034', category: 'AI issue', userId: 'USR-1090', priority: 'Medium', status: 'New', assignee: 'Unassigned', age: '20m' },
  { id: 'TCK-2035', category: 'Account access', userId: 'USR-1102', priority: 'High', status: 'Open', assignee: 'Chidi O.', age: '3h' },
  { id: 'TCK-2036', category: 'Subscription/billing', userId: 'USR-1118', priority: 'Low', status: 'Resolved', assignee: 'Funmi A.', age: '2d' },
]

export interface RiskEvent {
  id: string
  type: string
  subjectId: string
  severity: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'Escalated' | 'Resolved'
  detected: string
}

export const RISK_EVENTS: RiskEvent[] = [
  { id: 'RSK-311', type: 'Repeated failed login', subjectId: 'USR-1077', severity: 'High', status: 'Open', detected: '14 Sep 22:10' },
  { id: 'RSK-312', type: 'Unusual login (new device)', subjectId: 'USR-1102', severity: 'Medium', status: 'Open', detected: '14 Sep 23:41' },
  { id: 'RSK-313', type: 'Multiple connection attempts', subjectId: 'USR-1083', severity: 'Medium', status: 'Resolved', detected: '15 Sep 08:02' },
  { id: 'RSK-314', type: 'Repeated password resets', subjectId: 'USR-1077', severity: 'High', status: 'Escalated', detected: '15 Sep 09:30' },
]

export interface Transaction {
  id: string
  userId: string
  type: 'Transfer' | 'Card payment' | 'Deposit' | 'Withdrawal'
  amount: number
  currency: string
  status: 'Completed' | 'Pending' | 'Failed' | 'Flagged' | 'Adjusted'
  provider: string
  date: string
}

export const TRANSACTIONS: Transaction[] = [
  { id: 'TXN-80421', userId: 'USR-1042', type: 'Transfer', amount: 125000, currency: 'NGN', status: 'Completed', provider: 'Paystack', date: '2026-09-26 10:42' },
  { id: 'TXN-80420', userId: 'USR-1055', type: 'Deposit', amount: 48000, currency: 'NGN', status: 'Pending', provider: 'Flutterwave', date: '2026-09-26 10:35' },
  { id: 'TXN-80419', userId: 'USR-1083', type: 'Card payment', amount: 79.99, currency: 'GBP', status: 'Flagged', provider: 'Mono', date: '2026-09-26 10:12' },
  { id: 'TXN-80418', userId: 'USR-1077', type: 'Withdrawal', amount: 23000, currency: 'NGN', status: 'Failed', provider: 'Paystack', date: '2026-09-26 09:58' },
  { id: 'TXN-80417', userId: 'USR-1090', type: 'Transfer', amount: 2150, currency: 'GHS', status: 'Completed', provider: 'Stitch', date: '2026-09-26 09:41' },
  { id: 'TXN-80416', userId: 'USR-1124', type: 'Deposit', amount: 8500, currency: 'KES', status: 'Completed', provider: 'Mono', date: '2026-09-26 09:20' },
  { id: 'TXN-80415', userId: 'USR-1102', type: 'Transfer', amount: 350000, currency: 'NGN', status: 'Flagged', provider: 'Paystack', date: '2026-09-26 08:57' },
  { id: 'TXN-80414', userId: 'USR-1147', type: 'Card payment', amount: 42.5, currency: 'GBP', status: 'Completed', provider: 'Flutterwave', date: '2026-09-26 08:31' },
]

export interface LinkedAccount {
  id: string
  userId: string
  institution: string
  type: 'Current' | 'Savings' | 'Card' | 'Wallet'
  balance: number
  currency: string
  status: 'Connected' | 'Syncing' | 'Review' | 'Disconnected'
  lastSync: string
}

export const ACCOUNTS: LinkedAccount[] = [
  { id: 'ACC-5011', userId: 'USR-1042', institution: 'Access Bank', type: 'Current', balance: 2845000, currency: 'NGN', status: 'Connected', lastSync: '2m ago' },
  { id: 'ACC-5012', userId: 'USR-1042', institution: 'GTBank', type: 'Savings', balance: 840000, currency: 'NGN', status: 'Connected', lastSync: '5m ago' },
  { id: 'ACC-5013', userId: 'USR-1055', institution: 'Zenith Bank', type: 'Current', balance: 135000, currency: 'NGN', status: 'Syncing', lastSync: 'Now' },
  { id: 'ACC-5014', userId: 'USR-1083', institution: 'UBA', type: 'Savings', balance: 920000, currency: 'NGN', status: 'Review', lastSync: '1h ago' },
  { id: 'ACC-5015', userId: 'USR-1090', institution: 'GCB Bank', type: 'Current', balance: 18700, currency: 'GHS', status: 'Connected', lastSync: '8m ago' },
  { id: 'ACC-5016', userId: 'USR-1124', institution: 'Equity Bank', type: 'Wallet', balance: 46200, currency: 'KES', status: 'Connected', lastSync: '12m ago' },
  { id: 'ACC-5017', userId: 'USR-1147', institution: 'Monzo', type: 'Current', balance: 3210, currency: 'GBP', status: 'Disconnected', lastSync: '6d ago' },
]

export interface AuditEvent {
  id: string
  time: string
  actor: string
  action: string
  resource: string
  result: 'Success' | 'Denied' | 'Pending'
  ip: string
}

export const AUDIT_LOGS: AuditEvent[] = [
  { id: 'AUD-9108', time: '2026-09-26 10:44:12', actor: 'Amara Obi', action: 'Viewed user profile', resource: 'USR-1042', result: 'Success', ip: '10.24.8.11' },
  { id: 'AUD-9107', time: '2026-09-26 10:41:03', actor: 'Halima Sani', action: 'Requested user suspension', resource: 'USR-1061', result: 'Pending', ip: '10.24.8.29' },
  { id: 'AUD-9106', time: '2026-09-26 10:22:51', actor: 'Ngozi Eze', action: 'Accessed analytics', resource: 'Analytics', result: 'Success', ip: '10.24.8.45' },
  { id: 'AUD-9105', time: '2026-09-26 09:58:06', actor: 'Chidi Okeke', action: 'Exported transactions', resource: 'Transactions', result: 'Success', ip: '10.24.8.16' },
  { id: 'AUD-9104', time: '2026-09-26 09:31:17', actor: 'Funmi Adebayo', action: 'Attempted risk review', resource: 'RSK-311', result: 'Denied', ip: '10.24.8.33' },
  { id: 'AUD-9103', time: '2026-09-26 09:10:29', actor: 'Amara Obi', action: 'Updated feature flag', resource: 'new-dashboard', result: 'Success', ip: '10.24.8.11' },
]
