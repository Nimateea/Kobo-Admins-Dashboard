import { create } from 'zustand'
import { ACCOUNTS, TRANSACTIONS, type LinkedAccount, type Transaction } from '../lib/mockData'

interface FinanceState {
  transactions: Transaction[]
  accounts: LinkedAccount[]
  adjustTransaction: (id: string) => void
  disconnectAccount: (id: string) => void
}

export const useFinance = create<FinanceState>((set) => ({
  transactions: TRANSACTIONS.map((transaction) => ({ ...transaction })),
  accounts: ACCOUNTS.map((account) => ({ ...account })),
  adjustTransaction: (id) => set((state) => ({
    transactions: state.transactions.map((transaction) => transaction.id === id
      ? { ...transaction, status: 'Adjusted' }
      : transaction),
  })),
  disconnectAccount: (id) => set((state) => ({
    accounts: state.accounts.map((account) => account.id === id
      ? { ...account, status: 'Disconnected' }
      : account),
  })),
}))