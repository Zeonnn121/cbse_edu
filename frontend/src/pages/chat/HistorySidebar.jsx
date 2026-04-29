import { useState } from 'react'
import { s } from './styles'

export default function HistorySidebar({
  open,
  history,
  onClose,
  onPickQuestion,
  onDeleteQuestion,
}) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <>
      <aside style={{ ...s.sidebar, transform: open ? 'translateX(0)' : 'translateX(-100%)' }}>
        {/* Header */}
        <div style={s.sidebarHead}>
          <span style={s.sidebarTitle}>📖 Chat History</span>
          <button onClick={onClose} style={s.iconBtn} title="Close">✕</button>
        </div>

        {/* Privacy Notice */}
        <div style={{
          padding: '10px 16px',
          background: 'rgba(59,130,246,0.10)',
          borderBottom: '1px solid rgba(59,130,246,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>🛡️</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Privacy</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
            Chats <strong style={{ color: 'var(--cream)' }}>auto-delete after 10 days</strong> for your privacy.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
            You can also delete individual chats anytime using the 🗑️ button.
          </p>
        </div>

        {/* History List */}
        <div style={s.historyList}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
              <p style={{ ...s.emptyHistory, marginTop: 0 }}>No questions yet</p>
              <p style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.6 }}>Your conversations will appear here</p>
            </div>
          ) : (
            history.map((h, i) => {
              const itemId = h.id || `item-${i}`
              const isHovered = hoveredId === itemId
              return (
                <div
                  key={itemId}
                  style={{
                    ...s.historyItem,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: isHovered ? 'rgba(255,255,255,0.06)' : 'var(--surface2)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={() => setHoveredId(itemId)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Clickable content */}
                  <div
                    onClick={() => onPickQuestion(h.question ?? '')}
                    style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
                  >
                    <p style={s.historyQ}>{h.question}</p>
                    <p style={s.historyA}>{h.answer?.slice(0, 80)}…</p>
                  </div>

                  {/* Delete button — always visible */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (h.id) onDeleteQuestion?.(h.id)
                    }}
                    title="Delete this chat"
                    style={{
                      flexShrink: 0,
                      background: 'transparent',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '8px',
                      color: '#f87171',
                      fontSize: '13px',
                      padding: '4px 7px',
                      cursor: 'pointer',
                      opacity: isHovered ? 1 : 0.5,
                      transition: 'opacity 0.15s ease',
                      lineHeight: 1,
                    }}
                  >
                    🗑️
                  </button>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {open && <div style={s.overlay} onClick={onClose} />}
    </>
  )
}
