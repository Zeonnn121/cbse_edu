import { s } from './styles'

export default function AskTab({
  messages,
  loading,
  input,
  onInputChange,
  onSubmit,
  feedbackByHistoryId,
  feedbackSaving,
  onFeedback,
  curiosityByHistoryId,
  curiosityLoading,
  bottomRef,
  inputRef,
}) {
  return (
    <div style={s.tabPane}>
      <div style={s.feed}>
        {messages.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🧑‍🏫</div>
            <h2 style={s.emptyTitle}>Ask your tutor</h2>
            <p style={s.emptyHint}>Try: "Explain evaporation step by step" or "Give an example of a habitat."</p>
          </div>
        )}

        {messages.map(msg => {
          const isBot = msg.role === 'bot'
          const historyId = msg.historyId
          const currentRating = historyId ? feedbackByHistoryId?.[historyId] : undefined
          const saving = historyId ? Boolean(feedbackSaving?.[historyId]) : false

          return (
            <div key={msg.id} style={{ ...s.bubble, ...(msg.role === 'user' ? s.bubbleUser : s.bubbleBot) }}>
              {isBot && <span style={s.botIcon}>🤖</span>}
              <div style={s.bubbleBody}>
                <p style={s.bubbleText}>{msg.text}</p>

                {isBot && historyId && (
                  <div style={s.feedbackRow}>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onFeedback?.(historyId, 1)}
                      style={{
                        ...s.feedbackBtn,
                        ...(currentRating === 1 ? s.feedbackBtnActive : null),
                      }}
                      aria-label="Thumbs up"
                      title="Helpful"
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onFeedback?.(historyId, -1)}
                      style={{
                        ...s.feedbackBtn,
                        ...(currentRating === -1 ? s.feedbackBtnActive : null),
                      }}
                      aria-label="Thumbs down"
                      title="Not helpful"
                    >
                      👎
                    </button>
                  </div>
                )}

                {isBot && historyId && curiosityByHistoryId?.[historyId] && (
                  <div style={s.curiosityRow}>
                    {curiosityLoading[historyId] ? (
                      <small style={{ color: 'var(--muted)', opacity: 0.7 }}>Generating ideas…</small>
                    ) : (
                      curiosityByHistoryId[historyId].map((suggestion, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            onInputChange(suggestion)
                            inputRef.current?.focus()
                          }}
                          style={s.curiosityBtn}
                          title="Ask this"
                        >
                          💡 {suggestion}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          <div style={{ ...s.bubble, ...s.bubbleBot }}>
            <span style={s.botIcon}>🤖</span>
            <div style={s.typing}><span /><span /><span /></div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} style={s.inputBar}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask a doubt from the chapter…"
          style={s.inputField}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} style={s.sendBtn}>↑</button>
      </form>
    </div>
  )
}
