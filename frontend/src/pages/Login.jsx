import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]         = useState('login') // 'login' | 'signup'
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Check your email to confirm your account!')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div style={styles.page}>
      {/* Background grain */}
      <div style={styles.grain} />

      {/* Glow orb */}
      <div style={styles.orb} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>📚</div>
          <h1 style={styles.title}>Deev</h1>
          <p style={styles.subtitle}>Your CBSE Learning Assistant</p>
        </div>

        {/* Toggle */}
        <div style={styles.toggle}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              style={{ ...styles.toggleBtn, ...(mode === m ? styles.toggleActive : {}) }}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          {error   && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.successMsg}>{success}</p>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Google */}
        <button onClick={handleGoogle} style={styles.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34 6.5 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.5 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.5 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  grain: {
    position: 'fixed', inset: 0, zIndex: 0, opacity: 0.04,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
    backgroundSize: '128px',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(244,167,51,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
  },
  header: { textAlign: 'center', marginBottom: '28px' },
  logo: { fontSize: '36px', marginBottom: '8px' },
  title: {
    fontFamily: 'var(--font-head)',
    fontSize: '32px',
    fontStyle: 'italic',
    color: 'var(--cream)',
    marginBottom: '4px',
  },
  subtitle: { color: 'var(--muted)', fontSize: '13px' },
  toggle: {
    display: 'flex', background: 'var(--bg)',
    borderRadius: '10px', padding: '4px', marginBottom: '24px',
  },
  toggleBtn: {
    flex: 1, padding: '8px', borderRadius: '7px',
    background: 'transparent', color: 'var(--muted)',
    fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
  },
  toggleActive: { background: 'var(--surface2)', color: 'var(--cream)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '12px 14px',
    color: 'var(--cream)', fontSize: '14px',
    transition: 'border-color 0.2s',
  },
  error: { color: '#e05c5c', fontSize: '13px', textAlign: 'center' },
  successMsg: { color: '#5cb85c', fontSize: '13px', textAlign: 'center' },
  btn: {
    background: 'var(--saffron)', color: '#0f0e0c',
    padding: '13px', borderRadius: '10px',
    fontSize: '14px', fontWeight: '700',
    transition: 'opacity 0.2s',
    marginTop: '4px',
  },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' },
  dividerLine: { flex: 1, height: '1px', background: 'var(--border)' },
  dividerText: { color: 'var(--muted)', fontSize: '12px' },
  googleBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', padding: '12px', borderRadius: '10px',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--cream)', fontSize: '14px', fontWeight: '500',
    transition: 'border-color 0.2s',
  },
}