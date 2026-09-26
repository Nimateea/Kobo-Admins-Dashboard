import { create } from 'zustand'
import { PROVIDERS, RISK_EVENTS, TICKETS, type Provider, type RiskEvent, type Ticket } from '../lib/mockData'

export interface SupportReply {
  author: string
  body: string
  time: string
}

export interface FeatureFlag {
  key: string
  description: string
  enabled: boolean
  environment: 'Production' | 'Staging'
}

const INITIAL_FLAGS: FeatureFlag[] = [
  { key: 'new-dashboard', description: 'New account overview experience', enabled: true, environment: 'Production' },
  { key: 'smart-categorization', description: 'Automatic transaction categorization', enabled: true, environment: 'Production' },
  { key: 'scheduled-transfers', description: 'Scheduled recurring transfers', enabled: false, environment: 'Staging' },
  { key: 'support-inbox-v2', description: 'Updated support inbox workflow', enabled: false, environment: 'Staging' },
]

interface OperationsState {
  providers: Provider[]
  tickets: Ticket[]
  riskEvents: RiskEvent[]
  replies: Record<string, SupportReply[]>
  featureFlags: FeatureFlag[]
  setProviderStatus: (name: string, status: Provider['status']) => void
  updateTicket: (id: string, change: Partial<Ticket>) => void
  addTicketReply: (id: string, reply: SupportReply) => void
  setRiskStatus: (id: string, status: RiskEvent['status']) => void
  toggleFeatureFlag: (key: string) => void
}

export const useOperations = create<OperationsState>((set) => ({
  providers: PROVIDERS.map((provider) => ({ ...provider })),
  tickets: TICKETS.map((ticket) => ({ ...ticket })),
  riskEvents: RISK_EVENTS.map((event) => ({ ...event })),
  replies: {
    'TCK-2031': [{ author: 'Funmi A.', body: 'We are checking the latest response from the bank provider.', time: '10:42' }],
    'TCK-2032': [{ author: 'Chidi O.', body: 'The transaction sync is being reviewed.', time: '09:18' }],
  },
  featureFlags: INITIAL_FLAGS.map((flag) => ({ ...flag })),
  setProviderStatus: (name, status) => set((state) => ({
    providers: state.providers.map((provider) => provider.name === name ? { ...provider, status } : provider),
  })),
  updateTicket: (id, change) => set((state) => ({
    tickets: state.tickets.map((ticket) => ticket.id === id ? { ...ticket, ...change } : ticket),
  })),
  addTicketReply: (id, reply) => set((state) => ({
    replies: { ...state.replies, [id]: [...(state.replies[id] ?? []), reply] },
  })),
  setRiskStatus: (id, status) => set((state) => ({
    riskEvents: state.riskEvents.map((event) => event.id === id ? { ...event, status } : event),
  })),
  toggleFeatureFlag: (key) => set((state) => ({
    featureFlags: state.featureFlags.map((flag) => flag.key === key ? { ...flag, enabled: !flag.enabled } : flag),
  })),
}))