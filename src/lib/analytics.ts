export type ReportPeriod = '7d' | '30d' | '90d'

export const REPORTS: Record<ReportPeriod, {
  totalUsers: string
  activeUsers: string
  openTickets: string
  transactions: number
  volume: string
  series: Array<{ label: string; value: number }>
}> = {
  '7d': {
    totalUsers: '48,210', activeUsers: '31,882', openTickets: '42', transactions: 12840, volume: 'NGN 2.03B',
    series: [{ label: 'Mon', value: 42 }, { label: 'Tue', value: 61 }, { label: 'Wed', value: 55 }, { label: 'Thu', value: 78 }, { label: 'Fri', value: 68 }, { label: 'Sat', value: 91 }, { label: 'Sun', value: 73 }],
  },
  '30d': {
    totalUsers: '47,902', activeUsers: '31,204', openTickets: '186', transactions: 52618, volume: 'NGN 8.74B',
    series: [{ label: 'Wk 1', value: 48 }, { label: 'Wk 2', value: 62 }, { label: 'Wk 3', value: 73 }, { label: 'Wk 4', value: 89 }],
  },
  '90d': {
    totalUsers: '45,774', activeUsers: '29,481', openTickets: '512', transactions: 144206, volume: 'NGN 24.6B',
    series: [{ label: 'Jul', value: 52 }, { label: 'Aug', value: 68 }, { label: 'Sep', value: 89 }],
  },
}