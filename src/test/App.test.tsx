import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { useSession } from '../state/sessionStore'
import { useApprovals } from '../state/approvalsStore'
import { useFinance } from '../state/financeStore'
import { useOperations } from '../state/operationsStore'
import { ACCOUNTS, TRANSACTIONS } from '../lib/mockData'
import { toCsv } from '../lib/exportCsv'

async function loginAs(user: ReturnType<typeof userEvent.setup>, email: string) {
  const emailInput = screen.getByLabelText('Work email')
  await user.clear(emailInput)
  await user.type(emailInput, email)
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  await user.type(screen.getByLabelText('6-digit verification code'), '123456')
  await user.click(screen.getByRole('button', { name: /Verify/ }))
}

beforeEach(() => {
  useSession.setState({ me: null, loginError: null })
  useApprovals.setState({ requests: [] })
  useFinance.setState({
    transactions: TRANSACTIONS.map((transaction) => ({ ...transaction })),
    accounts: ACCOUNTS.map((account) => ({ ...account })),
  })
  useOperations.setState(useOperations.getInitialState(), true)
})

describe('login', () => {
  it('rejects an unknown email', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.clear(screen.getByLabelText('Work email'))
    await user.type(screen.getByLabelText('Work email'), 'nobody@kobo.com')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.type(screen.getByLabelText('6-digit verification code'), '123456')
    await user.click(screen.getByRole('button', { name: /Verify/ }))
    expect(screen.getByText(/No admin account found/)).toBeInTheDocument()
  })

  it('rejects a suspended admin', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loginAs(user, 'dev.rotimi@kobo.com')
    expect(screen.getByText(/suspended/)).toBeInTheDocument()
  })

  it('signs in a valid admin and shows their identity in the sidebar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loginAs(user, 'amara.obi@kobo.com')
    expect(screen.getByText('Amara Obi')).toBeInTheDocument()
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
  })

  it('rejects a 6-digit code of all zeros', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.type(screen.getByLabelText('6-digit verification code'), '000000')
    await user.click(screen.getByRole('button', { name: /Verify/ }))
    expect(screen.getByText(/Invalid code/)).toBeInTheDocument()
  })
})

describe('permission gating', () => {
  it('Analyst sees a restricted notice on Approvals instead of the page', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loginAs(user, 'ngozi.eze@kobo.com')
    await user.click(screen.getByRole('link', { name: /Approvals/ }))
    expect(screen.getByText('Access restricted')).toBeInTheDocument()
  })

  it('opens providers, support and risk views backed by their seed records', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loginAs(user, 'amara.obi@kobo.com')

    await user.click(screen.getByRole('link', { name: 'Providers' }))
    expect(screen.getByText('Flutterwave')).toBeInTheDocument()
    const monoRow = screen.getByText('Mono').closest('tr')!
    await user.click(within(monoRow).getByRole('button', { name: 'Disable' }))
    expect(monoRow).toHaveTextContent('Disabled')

    await user.click(screen.getByRole('link', { name: 'Support' }))
    expect(screen.getByText('TCK-2031')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send reply' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Ticket status'), 'Open')
    await user.type(screen.getByLabelText('Message'), 'I have reviewed the bank response.')
    await user.click(screen.getByRole('button', { name: 'Send reply' }))
    expect(screen.getByText('I have reviewed the bank response.')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Risk & Security' }))
    expect(screen.getByText('RSK-311')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Resolve' }).length).toBeGreaterThan(0)
    const riskRow = screen.getByText('RSK-311').closest('tr')!
    await user.click(within(riskRow).getByRole('button', { name: 'Resolve' }))
    expect(riskRow).toHaveTextContent('Resolved')
  })

  it('filters analytics, updates feature flags, filters audit logs and answers locally', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loginAs(user, 'amara.obi@kobo.com')

    await user.click(screen.getByRole('link', { name: 'Analytics' }))
    await user.selectOptions(screen.getByLabelText('Analytics period'), '30d')
    expect(screen.getByText('52,618')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Feature Flags' }))
    await user.click(screen.getByRole('switch', { name: 'Disable smart-categorization' }))
    expect(screen.getByRole('switch', { name: 'Enable smart-categorization' })).toHaveAttribute('aria-checked', 'false')
    await user.click(screen.getByRole('link', { name: 'Analytics' }))
    await user.click(screen.getByRole('link', { name: 'Feature Flags' }))
    expect(screen.getByRole('switch', { name: 'Enable smart-categorization' })).toHaveAttribute('aria-checked', 'false')

    await user.click(screen.getByRole('link', { name: 'Audit Logs' }))
    await user.selectOptions(screen.getByLabelText('Audit result filter'), 'Denied')
    expect(screen.getAllByRole('row')).toHaveLength(2)

    await user.click(screen.getByRole('link', { name: 'Admin Assistant' }))
    await user.type(screen.getByLabelText('Ask about dashboard data'), 'risk')
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    expect(screen.getByText(/risk signals remain unresolved/)).toBeInTheDocument()
  })

  it('keeps finance changes pending until another admin approves them', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loginAs(user, 'chidi.okeke@kobo.com')

    await user.click(screen.getByRole('link', { name: 'Transactions' }))
    await user.click(screen.getAllByRole('button', { name: 'Request adjustment' })[0])
    expect(screen.getByText('Pending approval')).toBeInTheDocument()
    expect(useApprovals.getState().requests[0].target).toBe('TXN-80421')

    await user.click(screen.getByRole('link', { name: 'Accounts' }))
    await user.click(screen.getAllByRole('button', { name: 'Request disconnect' })[0])
    expect(useApprovals.getState().requests[0].target).toBe('ACC-5011')

    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    await loginAs(user, 'amara.obi@kobo.com')
    await user.click(screen.getByRole('link', { name: 'Approvals' }))
    await user.click(screen.getAllByRole('button', { name: 'Approve' })[0])
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(useApprovals.getState().requests.every((request) => request.status === 'Approved')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    await loginAs(user, 'chidi.okeke@kobo.com')
    await user.click(screen.getByRole('link', { name: 'Transactions' }))
    expect(screen.getByText('TXN-80421').closest('tr')).toHaveTextContent('Adjusted')
    await user.click(screen.getByRole('link', { name: 'Accounts' }))
    expect(screen.getByText('ACC-5011').closest('tr')).toHaveTextContent('Disconnected')
  })

  it('quotes CSV values containing commas and quotes', () => {
    expect(toCsv(['Name', 'Note'], [['Ada', 'review, then "approve"']])).toBe(
      '"Name","Note"\r\n"Ada","review, then ""approve"""',
    )
  })
})

describe('users table', () => {
  it('sorts by column when a header is clicked, and toggles direction', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loginAs(user, 'amara.obi@kobo.com')
    await user.click(screen.getByRole('link', { name: 'Users' }))

    const idHeader = screen.getByRole('button', { name: 'User ID' })
    await user.click(idHeader)
    let rows = screen.getAllByRole('row').slice(1) // drop header row
    let firstCellsAsc = rows.map((r) => within(r).getAllByRole('cell')[0].textContent)
    expect(firstCellsAsc).toEqual([...firstCellsAsc].sort())

    await user.click(idHeader)
    rows = screen.getAllByRole('row').slice(1)
    const firstCellsDesc = rows.map((r) => within(r).getAllByRole('cell')[0].textContent)
    expect(firstCellsDesc).toEqual([...firstCellsAsc].reverse())
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loginAs(user, 'amara.obi@kobo.com')
    await user.click(screen.getByRole('link', { name: 'Users' }))

    await user.selectOptions(screen.getByLabelText('Status filter'), 'Suspended')
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(1)
    expect(within(rows[0]).getByText('Emeka Nwosu')).toBeInTheDocument()
  })
})

describe('the reported bug, end to end through real UI', () => {
  it('requester cannot approve their own suspend request; a different admin can', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Halima requests a suspension.
    await loginAs(user, 'halima.sani@kobo.com')
    await user.click(screen.getByRole('link', { name: 'Users' }))
    const chiomaRow = screen.getByText('Chioma Eze').closest('tr')!
    await user.click(within(chiomaRow).getByRole('button', { name: 'Suspend' }))

    // She can see it in Approvals, but only Cancel — never Approve.
    await user.click(screen.getByRole('link', { name: /Approvals/ }))
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel request' })).toBeInTheDocument()
    expect(screen.getByText(/different admin has to approve/)).toBeInTheDocument()

    // Sign out, sign in as a genuinely different admin with permission.
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    await loginAs(user, 'amara.obi@kobo.com')
    await user.click(screen.getByRole('link', { name: /Approvals/ }))
    await user.click(screen.getByRole('button', { name: 'Approve' }))

    expect(useApprovals.getState().requests[0].status).toBe('Approved')
  })
})
