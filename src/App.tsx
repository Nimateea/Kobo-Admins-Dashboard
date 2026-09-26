import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useSession } from './state/sessionStore'
import { Login } from './pages/Login'
import { Layout } from './components/Layout'
import { CommandCentre } from './pages/CommandCentre'
import { Users } from './pages/Users'
import { Approvals } from './pages/Approvals'
import { Providers } from './pages/Providers'
import { Support } from './pages/Support'
import { Risk } from './pages/Risk'
import { Transactions } from './pages/Transactions'
import { Accounts } from './pages/Accounts'
import { Analytics } from './pages/Analytics'
import { FeatureFlags } from './pages/FeatureFlags'
import { AuditLogs } from './pages/AuditLogs'
import { Assistant } from './pages/Assistant'

export default function App() {
  const { me } = useSession()

  if (!me) return <Login />

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CommandCentre />} />
          <Route path="/users" element={<Users />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/support" element={<Support />} />
          <Route path="/risk" element={<Risk />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/feature-flags" element={<FeatureFlags />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/approvals" element={<Approvals />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
