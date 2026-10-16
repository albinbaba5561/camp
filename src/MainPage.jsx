import { useEffect, useState } from 'react'
import './App.css'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="25" height="25">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
)

const phases = [
  { n: '01', name: 'Onboarding',      dates: 'Jul 28 – Aug 1',   desc: 'Account access, team intros & strategy alignment', next: true },
  { n: '02', name: 'Campaign Build',  dates: 'Aug 4 – Aug 22',   desc: 'Ad creative, audience builds & full campaign launch' },
  { n: '03', name: 'Live Management', dates: 'Aug 24 – Sep 14',  desc: 'Real-time optimization & event day coverage', event: 'Event Day: Sep 6' },
  { n: '04', name: 'Debrief & Wrap',  dates: 'Sep 15 – Sep 22',  desc: 'ROI reporting & final documentation' },
]

const payouts = [
  { name: 'Onboarding',      sub: 'Jul 28 – Aug 1',   days: 5,  amt: '$5,000'  },
  { name: 'Campaign Build',  sub: 'Aug 4 – Aug 22',   days: 19, amt: '$19,000' },
  { name: 'Live Management', sub: 'Aug 24 – Sep 14',  days: 22, amt: '$22,000' },
  { name: 'Debrief & Wrap',  sub: 'Sep 15 – Sep 22',  days: 8,  amt: '$8,000'  },
]

export default function MainPage({ onGoogleClick = () => {} }) {
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) }
      }),
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
    )
    document.querySelectorAll('.fade').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* ── LOGO BAR ── */}
      <div className="logo-bar">
        <img src="/redbull-logo.svg" alt="Red Bull" className="lb-logo" />
        <span className="lb-tag">Campaign Sponsorship Portal</span>
      </div>

      {/* ── HERO — Sponsorship focused, car photo bg ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-label">Red Bull &nbsp;·&nbsp; Digital Advertising Management</div>
          <h1 className="hero-title">
            You Have Been<br />Selected
          </h1>
          <p className="hero-subtitle">
            Exclusive Advertising Campaign Lead &nbsp;·&nbsp; Extreme Challenge Racing 2026
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hs-val">$54,000</span>
              <span className="hs-lbl">Total Payout</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hs-val">54</span>
              <span className="hs-lbl">Campaign Days</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hs-val">Jul 28</span>
              <span className="hs-lbl">Start Date</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hs-val">Google Ads</span>
              <span className="hs-lbl">Platform</span>
            </div>
          </div>
          <a className="hero-cta" href="#confirm">
            Accept Sponsorship
            <span className="hero-cta-arrow" />
          </a>
        </div>
      </section>

      {/* ── SPONSORSHIP OVERVIEW ── */}
      <div className="sw-white">
        <div className="si">
          <div className="eyebrow red fade">The Opportunity</div>
          <h2 className="dh xl on-white fade">Advertising<br />Campaign Lead</h2>
          <p className="body-text dark fade" style={{ marginTop: 14 }}>
            Red Bull has personally selected you to lead the digital advertising campaign for
            Extreme Challenge Racing 2026. You own the entire Google Ads strategy — from
            onboarding through post-event debrief — fully backed and funded by Red Bull.
          </p>
          <div className="overview-grid fade">
            <div className="ov-card">
              <div className="ov-icon">$</div>
              <div className="ov-title">Guaranteed $54,000</div>
              <div className="ov-desc">Full campaign payout regardless of performance. $1,000 per day, paid weekly every Monday.</div>
            </div>
            <div className="ov-card">
              <div className="ov-icon">G</div>
              <div className="ov-title">Full Google Ads Ownership</div>
              <div className="ov-desc">Search, Display, YouTube, Performance Max — you control the entire advertising suite.</div>
            </div>
            <div className="ov-card">
              <div className="ov-icon">RB</div>
              <div className="ov-title">Red Bull Backed</div>
              <div className="ov-desc">Full Red Bull support structure — creative assets, data access, and senior stakeholder reporting.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROLE / MISSION ── */}
      <div className="sw-off">
        <div className="si">
          <div className="eyebrow red fade">Your Role</div>
          <h2 className="dh xl on-white fade">Responsibilities</h2>
          <div className="mission-grid" style={{ marginTop: 40 }}>
            {[
              { label: 'Primary Role',       title: 'Advertising Lead',   desc: 'Full ownership of Google Ads — strategy, execution, daily bid management, audience targeting, and executive reporting.' },
              { label: 'Campaign Platform',  title: 'Google Ads Suite',   desc: 'Search, Display, YouTube, and Performance Max — targeting motorsport fans across 40+ countries for maximum reach.' },
              { label: 'Team Integration',   title: 'Red Bull Creative',  desc: 'Direct collaboration with the Red Bull creative and media teams for assets, approvals, and brand alignment.' },
            ].map((c, i) => (
              <div key={i} className={`mc fade fd${i + 1}`} style={{ background: '#fff' }}>
                <div className="mc-label">{c.label}</div>
                <div className="mc-title">{c.title}</div>
                <div className="mc-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONFIRM SPONSORSHIP ── */}
      <div className="confirm-wrap" id="confirm">
        <div className="confirm-inner">
          <div className="fade">
            <img src="/redbull-logo.svg" alt="Red Bull" className="confirm-logo" />
            <h2 className="confirm-head">
              Accept Your<br /><span className="accent">Sponsorship</span>
            </h2>
            <p className="confirm-sub">
              By confirming, you accept Red Bull&apos;s advertising management sponsorship terms
              and authorize onboarding to begin July 28, 2026. Your Google account links your
              campaign dashboard and verifies your identity.
            </p>
            <div className="confirm-stats">
              <div className="cs-cell"><div className="cs-lbl">Role</div><div className="cs-val">Advertising Lead</div></div>
              <div className="cs-cell"><div className="cs-lbl">Daily Rate</div><div className="cs-val gd">$1,000 / day</div></div>
              <div className="cs-cell"><div className="cs-lbl">Start Date</div><div className="cs-val">July 28, 2026</div></div>
            </div>
          </div>
          <div className="fade fd1">
            <div className="confirm-card">
              <div className="cc-lbl">Total Campaign Payout</div>
              <div className="cc-total">$54,000</div>
              <div className="cc-note">54 campaign days &nbsp;·&nbsp; Guaranteed upon acceptance</div>
            </div>

            {/* Accept checkbox */}
            <button
              className={`btn-accept-toggle${accepted ? ' accepted' : ''}`}
              type="button"
              onClick={() => setAccepted(a => !a)}
            >
              <span className="bat-box">
                {accepted && <CheckIcon />}
              </span>
              <span className="bat-label">
                {accepted ? 'Sponsorship Accepted' : 'Accept Sponsorship'}
              </span>
            </button>

            {/* Google button — only active when accepted */}
            <button
              className={`btn-google${accepted ? ' google-ready' : ''}`}
              type="button"
              disabled={!accepted}
              onClick={() => accepted && onGoogleClick()}
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <p className="google-note">
              Google sign-in is required to verify your identity and link your
              campaign dashboard to your Red Bull sponsorship account.
            </p>

            <p className="confirm-terms">
              By accepting you agree to Red Bull&apos;s <a href="#">Sponsorship Terms</a> and <a href="#">Privacy Policy</a>.<br />
              Offer valid until July 27, 2026 &nbsp;·&nbsp; Strictly confidential.
            </p>
          </div>
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div className="sw-dark">
        <div className="tl-inner">
          <div className="eyebrow gold fade">Campaign Roadmap</div>
          <h2 className="dh xl on-dark fade">Timeline</h2>
          <div className="phase-track">
            <div className="track-rail"><div className="track-fill" /></div>
            {phases.map((p, i) => (
              <div key={i} className={`phase${p.next ? ' next' : ''} fade fd${Math.min(i, 3)}`}>
                <div className="phase-node">{p.n}</div>
                <div className="ph-n">Phase {p.n}</div>
                <div className="ph-name">{p.name}</div>
                <div className="ph-dates">{p.dates}</div>
                <div className="ph-desc">{p.desc}</div>
                {p.event && <span className="ph-event">{p.event}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMPENSATION ── */}
      <div className="sw-white">
        <div className="si">
          <div className="eyebrow ink fade">Sponsorship Terms</div>
          <h2 className="dh xl on-white fade">Compensation</h2>
          <div className="comp-layout">
            <div className="fade">
              <p className="body-text dark" style={{ marginBottom: 14 }}>
                Red Bull covers your full rate for every campaign day. Paid weekly every
                Monday — no invoicing delays, no holdbacks.
              </p>
              <div className="comp-rate">
                <span className="comp-cur">$</span>
                <span className="comp-num">1,000</span>
              </div>
              <div className="comp-unit">per day &nbsp;·&nbsp; paid weekly</div>
              <div className="comp-total">
                <div className="ct-ey">Total Campaign Payout</div>
                <div className="ct-val">$54,000</div>
                <div className="ct-note">54 campaign days &nbsp;·&nbsp; Guaranteed upon signing</div>
              </div>
            </div>
            <div className="fade fd1">
              <table className="pt">
                <thead><tr><th>Phase</th><th>Days</th><th>Payout</th></tr></thead>
                <tbody>
                  {payouts.map((r, i) => (
                    <tr key={i}>
                      <td><div className="pt-name">{r.name}</div><div className="pt-sub">{r.sub}</div></td>
                      <td><span className="pt-days">{r.days}</span></td>
                      <td><span className="pt-amt">{r.amt}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><span className="pt-tl">Total</span></td>
                    <td><span className="pt-days" style={{ color: 'var(--ink)', fontWeight: 700 }}>54</span></td>
                    <td><span className="pt-ta">$54,000</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── EVENT DETAILS ── */}
      <div className="event-section">
        <div className="event-overlay" />
        <div className="si" style={{ position: 'relative', zIndex: 2 }}>
          <div className="eyebrow gold fade">The Event</div>
          <h2 className="dh xl on-dark fade">Red Bull Extreme<br />Challenge Racing</h2>
          <p className="body-text light fade" style={{ marginTop: 14 }}>
            The event you will be running the advertising campaign for. A flagship Red Bull motorsport
            event drawing 80,000+ live attendees and millions of viewers worldwide.
          </p>
          <div className="event-stats fade">
            <div className="ev-stat">
              <div className="ev-val">Sep 6</div>
              <div className="ev-lbl">Event Day 2026</div>
            </div>
            <div className="ev-divider" />
            <div className="ev-stat">
              <div className="ev-val">Cork, IE</div>
              <div className="ev-lbl">Spike Island, Ireland</div>
            </div>
            <div className="ev-divider" />
            <div className="ev-stat">
              <div className="ev-val">80K+</div>
              <div className="ev-lbl">Live Attendees</div>
            </div>
            <div className="ev-divider" />
            <div className="ev-stat">
              <div className="ev-val">4M+</div>
              <div className="ev-lbl">Online Viewers</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <img src="/redbull-logo.svg" alt="Red Bull" className="footer-logo" />
        <p>Red Bull Extreme Challenge Racing &nbsp;·&nbsp; Digital Advertising Campaign 2026</p>
        <p>© 2026 Red Bull GmbH &nbsp;·&nbsp; Confidential</p>
      </footer>
    </>
  )
}
