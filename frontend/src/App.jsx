import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Chat from './pages/Chat'
import Homepage from './pages/Homepage'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Spinner />
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/" element={session ? <Homepage session={session} /> : <Navigate to="/login" replace />} />

      <Route path="/teach" element={session ? <Chat session={session} initialTab="teach" /> : <Navigate to="/login" replace />} />
      <Route path="/ask" element={session ? <Chat session={session} initialTab="ask" /> : <Navigate to="/login" replace />} />
      <Route path="/quiz" element={session ? <Chat session={session} initialTab="quiz" /> : <Navigate to="/login" replace />} />
      <Route path="/progress" element={session ? <Chat session={session} initialTab="progress" /> : <Navigate to="/login" replace />} />

      <Route path="/chat" element={session ? <Chat session={session} /> : <Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
    </Routes>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: '3px solid var(--border)',
      borderTopColor: 'var(--saffron)',
      animation: 'spin 0.8s linear infinite'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}