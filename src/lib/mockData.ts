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
