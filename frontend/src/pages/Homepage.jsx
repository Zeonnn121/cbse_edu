import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'

import { supabase } from '../lib/supabase'
import { getContentLibrary } from '../lib/api'

const LS_CONTENT_ID = 'tisd.content_id'

const softAccentByVar = {
  '--kid-pink': 'var(--kid-pink-soft)',
  '--kid-blue': 'var(--kid-blue-soft)',
  '--kid-green': 'var(--kid-green-soft)',
  '--kid-yellow': 'var(--kid-yellow-soft)',
}

function FeatureCard({ to, emoji, title, subtitle, accentVar }) {
  const soft = softAccentByVar[accentVar] ?? 'rgba(0,0,0,0.06)'

  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '26px',
        border: '2px solid var(--border)',
        background: `
          radial-gradient(circle at 18% 18%, ${soft} 0 110px, transparent 111px),
          radial-gradient(circle at 88% 22%, ${soft} 0 80px, transparent 81px),
          linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)
        `,
        p: { xs: 3, sm: 3.5 },
        minHeight: { xs: 190, sm: 220 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 14px 30px rgba(20, 30, 50, 0.10)',
        },
        '&:active': {
          transform: 'translateY(-2px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, var(${accentVar}), transparent 65%)`,
          opacity: 0.10,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography sx={{ fontSize: { xs: 58, sm: 66 }, lineHeight: 1 }}>{emoji}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: '999px',
              background: `var(${accentVar})`,
              boxShadow: '0 0 0 10px rgba(0,0,0,0.03)',
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 1000,
              color: 'var(--muted)',
              background: 'rgba(255,255,255,0.65)',
              border: '1px dashed var(--border)',
              px: 1.2,
              py: 0.6,
              borderRadius: '999px',
            }}
          >
            Tap to open
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography sx={{ fontWeight: 1000, fontSize: { xs: 22, sm: 26 }, color: 'var(--cream)' }}>
          {title}
        </Typography>
        <Typography sx={{ mt: 0.6, fontSize: 14, color: 'var(--muted)' }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  )
}

export default function Homepage({ session }) {
  const userEmail = session?.user?.email ?? 'Student'
  const username = userEmail.includes('@') ? userEmail.split('@')[0] : userEmail

  const [library, setLibrary] = useState(null)
  const [libraryError, setLibraryError] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    const saved = (localStorage.getItem(LS_CONTENT_ID) || '').trim()
    const subj = saved.includes('/') ? saved.split('/')[0] : ''
    return subj || ''
  })
  const [selectedContentId, setSelectedContentId] = useState(() => (localStorage.getItem(LS_CONTENT_ID) || '').trim())

  useEffect(() => {
    let cancelled = false

    getContentLibrary().then((data) => {
      if (cancelled) return
      setLibrary(data)
      setLibraryError('')
    }).catch((e) => {
      if (cancelled) return
      setLibrary(null)
      setLibraryError((e?.message || 'Failed to load subjects/chapters').toString())
    })

    return () => { cancelled = true }
  }, [])

  const subjects = useMemo(() => (Array.isArray(library?.subjects) ? library.subjects : []), [library])
  const contentIdFromState = (selectedContentId || '').trim()
  const subjectIdFromState = (selectedSubjectId || '').trim()
  const subjectIdFromContent = contentIdFromState.includes('/') ? contentIdFromState.split('/')[0] : ''

  const effectiveSubjectId = useMemo(() => {
    const candidate = (subjectIdFromContent || subjectIdFromState || '').trim()
    if (!candidate) return ''
    return subjects.some(s => s?.id === candidate) ? candidate : ''
  }, [subjects, subjectIdFromContent, subjectIdFromState])

  const selectedSubject = useMemo(
    () => subjects.find(s => s?.id === effectiveSubjectId) || null,
    [subjects, effectiveSubjectId]
  )

  const chapters = useMemo(
    () => (Array.isArray(selectedSubject?.chapters) ? selectedSubject.chapters : []),
    [selectedSubject]
  )

  const effectiveContentId = useMemo(() => {
    if (!contentIdFromState) return ''
    return chapters.some(c => c?.id === contentIdFromState) ? contentIdFromState : ''
  }, [chapters, contentIdFromState])

  const contentSuffix = effectiveContentId ? `?content_id=${encodeURIComponent(effectiveContentId)}` : ''

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 14% 10%, var(--kid-pink-soft) 0 140px, transparent 141px),
          radial-gradient(circle at 88% 16%, var(--kid-blue-soft) 0 160px, transparent 161px),
          radial-gradient(circle at 18% 88%, var(--kid-yellow-soft) 0 180px, transparent 181px),
          radial-gradient(circle at 92% 86%, var(--kid-green-soft) 0 150px, transparent 151px),
          var(--bg)
        `,
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          pt: { xs: 3, sm: 4 },
          pb: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: { xs: 42, sm: 56 }, lineHeight: 1 }}>
            🧸✨
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontFamily: 'var(--font-head)',
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: { xs: 30, sm: 44 },
              color: 'var(--cream)',
              letterSpacing: '-0.02em',
            }}
          >
            Hi {username}!
          </Typography>
          <Typography sx={{ mt: 0.75, color: 'var(--muted)', fontSize: { xs: 15, sm: 17 } }}>
            Choose your adventure — learn, ask, quiz, or track progress.
          </Typography>

          <Box sx={{ mt: 1.25, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 900, color: 'var(--muted)' }}>⭐ Fun</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 900, color: 'var(--muted)' }}>🎯 Simple</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 900, color: 'var(--muted)' }}>🧠 Smart</Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          onClick={() => supabase.auth.signOut()}
          sx={{
            borderColor: 'var(--border)',
            color: 'var(--cream)',
            fontWeight: 900,
            textTransform: 'none',
            borderRadius: '14px',
            px: 2,
            py: 1,
            background: 'var(--surface)',
            '&:hover': { borderColor: 'var(--saffron)', background: 'var(--surface2)' },
          }}
        >
          👋 Sign out
        </Button>
      </Box>

      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          pb: { xs: 1.5, sm: 2.5 },
        }}
      >
        <Box
          sx={{
            borderRadius: '22px',
            border: '2px solid var(--border)',
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)',
            p: { xs: 2.2, sm: 2.6 },
          }}
        >
          <Typography sx={{ fontWeight: 1000, color: 'var(--cream)', fontSize: { xs: 16, sm: 18 } }}>
            📚 Choose your chapter
          </Typography>
          <Typography sx={{ mt: 0.6, fontSize: 13, color: 'var(--muted)' }}>
            First pick a subject, then pick a chapter.
          </Typography>

          {libraryError && (
            <Typography sx={{ mt: 1.2, fontSize: 12, color: 'var(--muted)' }}>
              ⚠️ {libraryError}
            </Typography>
          )}

          {!libraryError && !library && (
            <Typography sx={{ mt: 1.2, fontSize: 12, color: 'var(--muted)' }}>
              Loading chapters…
            </Typography>
          )}

          {subjects.length > 0 && (
            <Box sx={{ mt: 1.6, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {subjects.map((s) => {
                const active = s.id === effectiveSubjectId
                return (
                  <Button
                    key={s.id}
                    variant="outlined"
                    onClick={() => {
                      setSelectedSubjectId(s.id)
                      setSelectedContentId('')
                    }}
                    sx={{
                      borderColor: active ? 'var(--saffron)' : 'var(--border)',
                      color: active ? 'var(--saffron)' : 'var(--cream)',
                      fontWeight: 900,
                      textTransform: 'none',
                      borderRadius: '999px',
                      px: 2,
                      py: 0.9,
                      background: active ? 'rgba(244,167,51,0.10)' : 'transparent',
                      '&:hover': {
                        borderColor: 'var(--saffron)',
                        background: 'rgba(244,167,51,0.10)',
                      },
                    }}
                  >
                    {s.name || s.id}
                  </Button>
                )
              })}
            </Box>
          )}

          {selectedSubject && (
            <Box sx={{ mt: 1.6 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 900, color: 'var(--muted)' }}>
                Chapters in {selectedSubject.name || selectedSubject.id}
              </Typography>

              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {chapters.map((c) => {
                  const active = c.id === selectedContentId
                  return (
                    <Button
                      key={c.id}
                      variant="outlined"
                      onClick={() => {
                        setSelectedContentId(c.id)
                        localStorage.setItem(LS_CONTENT_ID, c.id)
                      }}
                      sx={{
                        borderColor: active ? 'var(--kid-green)' : 'var(--border)',
                        color: active ? 'var(--kid-green)' : 'var(--cream)',
                        fontWeight: 900,
                        textTransform: 'none',
                        borderRadius: '14px',
                        px: 1.6,
                        py: 0.9,
                        background: active ? 'rgba(72,187,120,0.10)' : 'transparent',
                        '&:hover': {
                          borderColor: 'var(--kid-green)',
                          background: 'rgba(72,187,120,0.10)',
                        },
                      }}
                    >
                      {c.label || c.id}
                    </Button>
                  )
                })}
              </Box>

              <Typography sx={{ mt: 1.2, fontSize: 12, color: 'var(--muted)' }}>
                Selected: {effectiveContentId ? effectiveContentId : '—'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          px: { xs: 2, sm: 4 },
          pb: { xs: 4, sm: 6 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: { xs: 2.2, sm: 3.2 },
          alignContent: 'start',
        }}
      >
        <FeatureCard
          to={`/teach${contentSuffix}`}
          emoji="🧑‍🏫"
          title="Learn a Chapter"
          subtitle="Story-style lesson + examples"
          accentVar="--kid-pink"
        />
        <FeatureCard
          to={`/ask${contentSuffix}`}
          emoji="🤔"
          title="Ask a Doubt"
          subtitle="Ask anything — get help fast"
          accentVar="--kid-blue"
        />
        <FeatureCard
          to={`/quiz${contentSuffix}`}
          emoji="📝"
          title="Take a Quiz"
          subtitle="Practice, score, and improve"
          accentVar="--kid-green"
        />
        <FeatureCard
          to="/progress"
          emoji="📊"
          title="My Progress"
          subtitle="See your wins and grow"
          accentVar="--kid-yellow"
        />
      </Box>
    </Box>
  )
}
