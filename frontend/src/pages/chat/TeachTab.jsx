import { useMemo, useRef, useState, useEffect } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

import { getGraphExport } from '../../lib/api'

/* ─── tiny TTS helper ─────────────────────────────────── */
function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.92
  window.speechSynthesis.speak(u)
}

/* ─── palette tokens (match existing CSS vars) ────────── */
const T = {
  cream:    'var(--cream)',
  muted:    'var(--muted)',
  surface:  'var(--surface)',
  surface2: 'var(--surface2)',
  border:   'var(--border)',
  saffron:  'var(--saffron)',
}

function resolveCssVar(name, fallback = '') {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return v || fallback
  } catch {
    return fallback
  }
}

function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const cr = entries?.[0]?.contentRect
      if (!cr) return
      setSize({ width: Math.round(cr.width), height: Math.round(cr.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])

  return size
}

function KnowledgeGraphCard({ contentId }) {
  const boxRef = useRef(null)
  const { width, height } = useElementSize(boxRef)

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [payload, setPayload] = useState(null)
  const [hover, setHover] = useState(null)

  const colors = useMemo(() => ({
    saffron: resolveCssVar('--saffron', '#f4a733'),
    cream: resolveCssVar('--cream', '#f5efe6'),
    muted: resolveCssVar('--muted', '#b9b2a9'),
    border: resolveCssVar('--border', 'rgba(255,255,255,0.15)'),
    surface: resolveCssVar('--surface', '#1b1814'),
  }), [])

  async function loadGraph() {
    setErr('')
    setLoading(true)
    try {
      const data = await getGraphExport(250, 800, contentId)
      setPayload(data)
    } catch (e) {
      setErr((e?.message || 'Could not load graph').toString())
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGraph()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId])

  const graphData = useMemo(() => {
    if (!payload?.available) return null
    const nodes = Array.isArray(payload.nodes) ? payload.nodes : []
    const links = Array.isArray(payload.links) ? payload.links : []
    return { nodes, links }
  }, [payload])

  return (
    <Card animate>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <SectionTitle icon="🕸️" label="Knowledge Graph" />
          <p style={{ margin: '-8px 0 0', fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
            Drag nodes, scroll to zoom, and pan to explore concepts.
          </p>
        </div>
        <button
          type="button"
          onClick={loadGraph}
          disabled={loading}
          style={{
            background: 'transparent',
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: T.muted,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Loading…' : '↻ Reload'}
        </button>
      </div>

      {payload?.stats && (
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: T.muted }}>
            Total: <span style={{ color: T.cream, fontWeight: 700 }}>{payload.stats.nodes}</span> nodes ·{' '}
            <span style={{ color: T.cream, fontWeight: 700 }}>{payload.stats.edges}</span> edges
          </span>
          <span style={{ fontSize: 12, color: T.muted }}>
            Showing: <span style={{ color: T.cream, fontWeight: 700 }}>{payload.stats.exported_nodes}</span> nodes ·{' '}
            <span style={{ color: T.cream, fontWeight: 700 }}>{payload.stats.exported_edges}</span> edges
          </span>
          {hover?.id && (
            <span style={{ fontSize: 12, color: T.muted }}>
              Hover: <span style={{ color: T.saffron, fontWeight: 800 }}>{hover.id}</span>
            </span>
          )}
        </div>
      )}

      {err && (
        <div style={{ marginTop: 12, fontSize: 12, color: T.muted }}>
          ⚠️ {err}
        </div>
      )}

      {!err && payload && !payload.available && (
        <div style={{ marginTop: 12, fontSize: 12, color: T.muted }}>
          Graph is not available yet. (Check that Graph RAG is enabled and the graph has been built.)
        </div>
      )}

      <div
        ref={boxRef}
        style={{
          marginTop: 14,
          height: 420,
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${T.border}`,
          background: T.surface,
          position: 'relative',
        }}
      >
        {graphData && width > 0 && height > 0 && (
          <ForceGraph2D
            width={width}
            height={height}
            graphData={graphData}
            nodeId="id"
            nodeLabel={(n) => n.id}
            linkLabel={(l) => l.relation || ''}
            nodeColor={() => colors.saffron}
            linkColor={() => colors.border}
            backgroundColor={colors.surface}
            onNodeHover={(n) => setHover(n || null)}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.id
              const r = 3
              ctx.beginPath()
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false)
              ctx.fillStyle = colors.saffron
              ctx.fill()

              if (hover && hover.id === node.id && label) {
                const fontSize = 12 / globalScale
                ctx.font = `${fontSize}px sans-serif`
                ctx.textBaseline = 'top'
                ctx.fillStyle = colors.cream
                ctx.fillText(label, node.x + 6 / globalScale, node.y + 6 / globalScale)
              }
            }}
          />
        )}
      </div>
    </Card>
  )
}

/* ─── reusable card ───────────────────────────────────── */
function Card({ children, style = {}, animate = false }) {
  return (
    <div style={{
      background: T.surface2,
      border: `1px solid ${T.border}`,
      borderRadius: 18,
      padding: '20px 22px',
      animation: animate ? 'fadeUp 0.35s ease' : undefined,
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ─── section header ──────────────────────────────────── */
function SectionTitle({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{
        fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: T.saffron,
      }}>{label}</span>
    </div>
  )
}

/* ─── key concept pill ────────────────────────────────── */
function ConceptPill({ term, meaning }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      onClick={() => setOpen(v => !v)}
      style={{
        border: `1px solid ${open ? T.saffron : T.border}`,
        borderRadius: 12,
        padding: '10px 14px',
        cursor: 'pointer',
        background: open ? 'rgba(244,167,51,0.08)' : T.surface,
        transition: 'all 0.2s ease',
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: T.cream }}>{term}</span>
        <span style={{ fontSize: 12, color: T.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </div>
      {open && (
        <p style={{ margin: '8px 0 0', fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{meaning}</p>
      )}
    </div>
  )
}

/* ─── example card ────────────────────────────────────── */
function ExampleCard({ icon, title, body }) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 16px',
      background: 'rgba(99,179,237,0.07)',
      border: '1px solid rgba(99,179,237,0.2)',
      borderRadius: 14, marginBottom: 10,
      animation: 'fadeUp 0.3s ease',
    }}>
      <span style={{ fontSize: 26, flexShrink: 0 }}>{icon || '🔍'}</span>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: T.cream }}>{title}</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{body}</p>
      </div>
    </div>
  )
}

/* ─── check question card with reveal ─────────────────── */
function CheckQ({ q, a, index }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div style={{
      padding: '14px 16px',
      border: `1px solid ${revealed ? 'rgba(72,187,120,0.4)' : T.border}`,
      borderRadius: 14, marginBottom: 10,
      background: revealed ? 'rgba(72,187,120,0.06)' : T.surface,
      transition: 'all 0.25s ease',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{
          background: T.saffron, color: '#0f0e0c',
          borderRadius: '50%', width: 22, height: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, flexShrink: 0, marginTop: 1,
        }}>{index + 1}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 14, color: T.cream, lineHeight: 1.5 }}>{q}</p>
          {revealed ? (
            <p style={{
              margin: '8px 0 0', fontSize: 13, color: '#68d391', lineHeight: 1.6,
              animation: 'fadeUp 0.2s ease',
            }}>✅ {a}</p>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              style={{
                marginTop: 8, background: 'transparent',
                border: `1px solid ${T.border}`, borderRadius: 8,
                padding: '5px 12px', fontSize: 12, color: T.muted,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              Show answer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── loading skeleton ────────────────────────────────── */
function LoadingSkeleton() {
  const bar = (w, h = 14) => (
    <div style={{
      height: h, borderRadius: 8, marginBottom: 10,
      background: 'rgba(255,255,255,0.07)',
      width: w,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
  return (
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {bar('60%', 22)}
      {bar('100%')} {bar('85%')} {bar('70%')}
      <div style={{ marginTop: 6 }}>
        {bar('40%', 11)}{bar('100%', 10)}{bar('90%', 10)}{bar('75%', 10)}
      </div>
      {bar('100%')} {bar('80%')}
    </div>
  )
}

/* ─── structured lesson view ──────────────────────────── */
function StructuredLesson({ lesson, onGenerateQuiz, quizLoading }) {
  const [speaking, setSpeaking] = useState(false)

  const fullText = [
    lesson.intro,
    (lesson.key_concepts || []).map(c => `${c.term}: ${c.meaning}`).join('. '),
    (lesson.examples || []).map(e => `${e.title}: ${e.body}`).join('. '),
    lesson.fun_fact,
    (lesson.summary_points || []).join('. '),
  ].filter(Boolean).join('\n\n')

  function toggleTTS() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    } else {
      speak(fullText)
      setSpeaking(true)
      const check = setInterval(() => {
        if (!window.speechSynthesis.speaking) { setSpeaking(false); clearInterval(check) }
      }, 500)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Title + TTS row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: T.cream, lineHeight: 1.3 }}>
            {lesson.title || "Today's Lesson"}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: T.muted }}>
            🎓 CBSE Tutor · {(lesson.key_concepts || []).length} concepts · {(lesson.check_questions || []).length} questions
          </p>
        </div>
        <button
          onClick={toggleTTS}
          title={speaking ? 'Stop reading' : 'Read lesson aloud'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: speaking ? 'rgba(244,167,51,0.15)' : T.surface,
            border: `1px solid ${speaking ? T.saffron : T.border}`,
            borderRadius: 10, padding: '8px 14px',
            color: speaking ? T.saffron : T.muted,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {speaking ? '⏹️ Stop' : '🔊 Read aloud'}
        </button>
      </div>

      {/* Intro */}
      {lesson.intro && (
        <Card animate>
          <SectionTitle icon="👋" label="Introduction" />
          <p style={{ margin: 0, fontSize: 14, color: T.cream, lineHeight: 1.8 }}>{lesson.intro}</p>
        </Card>
      )}

      {/* Key Concepts */}
      {(lesson.key_concepts || []).length > 0 && (
        <Card animate>
          <SectionTitle icon="🔑" label="Key Concepts" />
          <p style={{ margin: '0 0 12px', fontSize: 12, color: T.muted }}>Tap a concept to see its meaning</p>
          {lesson.key_concepts.map((c, i) => (
            <ConceptPill key={i} term={c.term} meaning={c.meaning} />
          ))}
        </Card>
      )}

      {/* Examples */}
      {(lesson.examples || []).length > 0 && (
        <Card animate>
          <SectionTitle icon="🌍" label="Real-Life Examples" />
          {lesson.examples.map((e, i) => (
            <ExampleCard key={i} icon={e.icon} title={e.title} body={e.body} />
          ))}
        </Card>
      )}

      {/* Fun Fact */}
      {lesson.fun_fact && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(159,122,234,0.10)',
          border: '1px solid rgba(159,122,234,0.3)',
          borderRadius: 16,
          animation: 'fadeUp 0.35s ease',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#b794f4', marginBottom: 4 }}>
                Did You Know?
              </p>
              <p style={{ margin: 0, fontSize: 14, color: T.cream, lineHeight: 1.7 }}>{lesson.fun_fact}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Points */}
      {(lesson.summary_points || []).length > 0 && (
        <Card animate>
          <SectionTitle icon="📋" label="Quick Recap" />
          <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lesson.summary_points.map((pt, i) => (
              <li key={i} style={{ fontSize: 13, color: T.cream, lineHeight: 1.6 }}>{pt}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Check Questions */}
      {(lesson.check_questions || []).length > 0 && (
        <Card animate>
          <SectionTitle icon="✍️" label="Check Your Understanding" />
          <p style={{ margin: '0 0 12px', fontSize: 12, color: T.muted }}>Try answering, then tap "Show answer"</p>
          {lesson.check_questions.map((cq, i) => (
            <CheckQ key={i} q={cq.q} a={cq.a} index={i} />
          ))}
        </Card>
      )}

      {/* CTA */}
      <div style={{
        padding: '20px 22px',
        background: 'rgba(244,167,51,0.07)',
        border: '1px solid rgba(244,167,51,0.25)',
        borderRadius: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        animation: 'fadeUp 0.4s ease',
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: T.cream }}>Ready to test yourself? 🎯</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: T.muted }}>Take a quiz based on this chapter</p>
        </div>
        <button
          onClick={onGenerateQuiz}
          disabled={quizLoading}
          style={{
            background: T.saffron, color: '#0f0e0c',
            border: 'none', borderRadius: 12,
            padding: '11px 22px', fontSize: 14, fontWeight: 800,
            cursor: quizLoading ? 'not-allowed' : 'pointer',
            opacity: quizLoading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {quizLoading ? 'Making quiz…' : '📝 Take Quiz'}
        </button>
      </div>
    </div>
  )
}

/* ─── Landing / plain-text fallback ───────────────────── */
function LandingCard({ lessonLoading, onTeach, onGenerateQuiz, quizLoading, lesson }) {
  if (lesson) {
    // plain-text fallback
    return (
      <Card>
        <pre style={{
          margin: 0, whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-body)',
          color: T.cream, lineHeight: 1.8, fontSize: 14,
        }}>{lesson}</pre>
      </Card>
    )
  }

  return (
    <Card style={{ textAlign: 'center', padding: '36px 28px' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>🎓</div>
      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: T.cream }}>Learn This Chapter</h2>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: T.muted, lineHeight: 1.7, maxWidth: 360, marginInline: 'auto' }}>
        Get a full interactive lesson — key concepts, real-life examples, a fun fact, and quick-check questions.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onTeach}
          disabled={lessonLoading}
          style={{
            background: T.saffron, color: '#0f0e0c',
            border: 'none', borderRadius: 12,
            padding: '12px 26px', fontSize: 15, fontWeight: 900,
            cursor: lessonLoading ? 'not-allowed' : 'pointer',
            opacity: lessonLoading ? 0.75 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {lessonLoading ? '⏳ Preparing lesson…' : '▶ Start Lesson'}
        </button>
        <button
          onClick={onGenerateQuiz}
          disabled={quizLoading}
          style={{
            background: 'transparent',
            border: `1px solid ${T.border}`,
            borderRadius: 12, padding: '12px 22px',
            fontSize: 14, fontWeight: 700, color: T.cream,
            cursor: quizLoading ? 'not-allowed' : 'pointer',
            opacity: quizLoading ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {quizLoading ? 'Making quiz…' : '📝 Jump to Quiz'}
        </button>
      </div>
      {/* feature chips */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
        {['🔑 Key Concepts', '🌍 Examples', '⚡ Fun Fact', '✍️ Check Qs', '🔊 Read Aloud'].map(f => (
          <span key={f} style={{
            fontSize: 11, padding: '4px 10px',
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 20, color: T.muted,
          }}>{f}</span>
        ))}
      </div>
    </Card>
  )
}

/* ─── main export ─────────────────────────────────────── */
export default function TeachTab({
  contentId,
  lesson,
  structuredLesson,
  lessonLoading,
  onTeach,
  onGenerateQuiz,
  quizLoading,
}) {
  // Stop TTS when switching away
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const hasContent = structuredLesson || lesson
  const showLanding = !hasContent && !lessonLoading

  return (
    <div style={{
      flex: 1, minHeight: 0, overflowY: 'auto',
      padding: '20px 20px 32px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* keyframe injection */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
      `}</style>

      {/* Header bar (shown when content exists) */}
      {hasContent && !lessonLoading && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onTeach}
            style={{
              background: 'transparent',
              border: `1px solid ${T.border}`,
              borderRadius: 10, padding: '7px 14px',
              fontSize: 12, fontWeight: 700, color: T.muted,
              cursor: 'pointer',
            }}
          >
            🔄 Regenerate
          </button>
        </div>
      )}

      {/* States */}
      {showLanding && (
        <LandingCard
          lessonLoading={lessonLoading}
          lesson={lesson}
          onTeach={onTeach}
          onGenerateQuiz={onGenerateQuiz}
          quizLoading={quizLoading}
        />
      )}

      {lessonLoading && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>⏳</span>
            <span style={{ fontSize: 13, color: T.muted }}>Generating your lesson…</span>
          </div>
          <LoadingSkeleton />
        </Card>
      )}

      {!lessonLoading && structuredLesson && (
        <StructuredLesson
          lesson={structuredLesson}
          onGenerateQuiz={onGenerateQuiz}
          quizLoading={quizLoading}
        />
      )}

      {!lessonLoading && !structuredLesson && lesson && (
        <LandingCard lesson={lesson} onTeach={onTeach} onGenerateQuiz={onGenerateQuiz} quizLoading={quizLoading} lessonLoading={false} />
      )}

      {!lessonLoading && (
        <KnowledgeGraphCard contentId={contentId} />
      )}
    </div>
  )
}
