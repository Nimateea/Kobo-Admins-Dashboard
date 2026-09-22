import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useSession } from './state/sessionStore'
import { Login } from './pages/Login'
import { Layout } from './components/Layout'
import { CommandCentre } from './pages/CommandCentre'
import { Users } from './pages/Users'
import { Approvals } from './pages/Approvals'

export default function App() {
  const { me } = useSession()

  if (!me) return <Login />

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CommandCentre />} />
          <Route path="/users" element={<Users />} />
          <Route path="/approvals" element={<Approvals />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
