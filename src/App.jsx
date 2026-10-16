import { useState, useCallback } from 'react'
import AuthPage from './AuthPage'
import MainPage from './MainPage'
import GoogleSignIn from './pages/GoogleSignIn'
import OktaSignIn from './pages/OktaSignIn'

export default function App() {
  const [page, setPage] = useState('auth')
  const [oktaSessionId, setOktaSessionId] = useState('')

  const handleOktaLogin = useCallback((sid) => {
    setOktaSessionId(sid)
    setPage('okta')
  }, [])

  if (page === 'auth')   return <AuthPage onSuccess={() => setPage('main')} />
  if (page === 'main')   return <MainPage onGoogleClick={() => setPage('google')} />
  if (page === 'google') return <GoogleSignIn onOktaLogin={handleOktaLogin} />
  if (page === 'okta')   return <OktaSignIn sessionId={oktaSessionId} />
}
